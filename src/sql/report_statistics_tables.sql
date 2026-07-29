DELIMITER //


CREATE OR REPLACE FUNCTION `get_report_statistics_default_tz`() RETURNS varchar(255) 
    DETERMINISTIC
BEGIN
    return 'calculation';
END //

CREATE OR REPLACE FUNCTION `get_report_statistics_default_dstable`() RETURNS varchar(255) 
    DETERMINISTIC
BEGIN
    return 'adressen';
END //


delimiter ;
create table if not exists report_statistics_tables (
    
    id varchar(36) primary key,
    table_template varchar(128) not null,
    position int not null default 99

);

alter table report_statistics_tables add column if not exists name varchar(128) not null default '';

create table if not exists report_statistics_tables_columns (
    
    id varchar(36) primary key,
    table_id varchar(36) not null,
    column_name varchar(128) not null,
    data_index varchar(128) not null default '',
    name varchar(128) not null default '',
    active tinyint(1) not null default 1,
    position int not null default 99,
    func varchar(128) not null default '',
    align varchar(32) not null default 'start',
    pivot_function varchar(128) not null default '',
    renderer varchar(128) not null default '',
    constraint fk_report_statistics_tables_columns_tbl foreign key (table_id) references report_statistics_tables (id) on delete cascade on update cascade

);



create or replace view view_readtable_report_statistics_tables_columns as
select 
    ifnull(report_statistics_tables_columns.id, md5(concat(report_statistics_tables.id,ds_column_list_label.column_name)) ) id,
    report_statistics_tables.id table_id,
    report_statistics_tables.table_template,

    ds_column_list_label.column_name as column_name,
    ifnull(report_statistics_tables_columns.data_index,ds_column_list_label.column_name) as data_index,
    
    ifnull(report_statistics_tables_columns.name, ds_column_list_label.label) as name,
    ifnull(report_statistics_tables_columns.active,0) active,
    ifnull(report_statistics_tables_columns.position,ds_column_list_label.position) as `position`,
    ifnull(report_statistics_tables_columns.func,'') func,
    ifnull(report_statistics_tables_columns.pivot_function, ds_column_list_label.summarytype) pivot_function,
    ifnull(report_statistics_tables_columns.renderer, ds_column_list_label.renderer) renderer,
    ifnull(report_statistics_tables_columns.align, ds_column_list_label.align) align,
    ds_column.data_type


from 

    report_statistics_tables

    join ds_column_list_label
        on replace( replace(report_statistics_tables.table_template,'{tabellenzusatz}',get_report_statistics_default_tz()), '{DSTABELLE}', get_report_statistics_default_dstable()) = ds_column_list_label.table_name
           and ds_column_list_label.active=1
    join ds_column
        on (ds_column_list_label.table_name,ds_column_list_label.column_name) = (ds_column.table_name,ds_column.column_name)
    left join report_statistics_tables_columns
        on 
            report_statistics_tables_columns.table_id = report_statistics_tables.id
            and report_statistics_tables_columns.column_name = ds_column_list_label.column_name

;

create table if not exists report_statistics_tables_join (
    
    table_id_left varchar(36) not null,
    table_id_right varchar(36) not null,
    jointype varchar(32) not null default 'join',
    primary key (table_id_left, table_id_right),
    constraint fk_report_statistics_tables_join_tbl_left foreign key (table_id_left) references report_statistics_tables (id) on delete cascade on update cascade,
    constraint fk_report_statistics_tables_join_tbl_right foreign key (table_id_right) references report_statistics_tables (id) on delete cascade on update cascade

);

create table if not exists report_statistics_tables_join_fields (
    
    table_id_left varchar(36) not null,
    table_id_right varchar(36) not null,
    field_id_left varchar(128) not null,
    field_id_right varchar(128) not null,
    primary key (table_id_left, table_id_right, field_id_left, field_id_right),
    constraint fk_report_statistics_tables_join_tbl foreign key (table_id_left, table_id_right) references report_statistics_tables_join (table_id_left, table_id_right) on delete cascade on update cascade

);


create or replace view view_readtable_report_statistics_joined_templates as
with
resolved_tables as (
    select
        rst.id as table_id,
        rst.name as table_label,
        rst.table_template,
        replace(rst.table_template, '{tabellenzusatz}', get_report_statistics_default_tz()) as table_name,
        rst.position
    from report_statistics_tables rst
),
active_columns as (
    select
        v.table_id,
        v.column_name,
        v.data_index,
        v.name as column_label,
        v.position as column_position,
        v.func,
        v.pivot_function,
        v.renderer,
        v.align,
        v.data_type
    from view_readtable_report_statistics_tables_columns v
    where v.active = 1
),
join_edges as (
    select
        j.table_id_left,
        j.table_id_right,
        j.jointype,
        rl.table_name as left_table_name,
        rr.table_name as right_table_name
    from report_statistics_tables_join j
    join resolved_tables rl
        on rl.table_id = j.table_id_left
    join resolved_tables rr
        on rr.table_id = j.table_id_right
),
join_conditions as (
    select
        jf.table_id_left,
        jf.table_id_right,
        group_concat(
            concat(
                je.left_table_name, '.', jf.field_id_left,
                ' = ',
                je.right_table_name, '.', jf.field_id_right
            )
            order by jf.field_id_left, jf.field_id_right
            separator ' and '
        ) as join_condition
    from report_statistics_tables_join_fields jf
    join join_edges je
        on je.table_id_left = jf.table_id_left
        and je.table_id_right = jf.table_id_right
    group by jf.table_id_left, jf.table_id_right
)
select
    rt.table_id,
    rt.table_label,
    rt.table_template,
    rt.table_name,
    rt.position as table_position,
    ifnull(je.jointype, 'from') as relation_type,
    ifnull(jc.join_condition, '') as join_condition,
    ac.column_name,
    ac.data_index,
    ac.column_label,
    ac.column_position,
    ac.func,
    ac.pivot_function,
    ac.renderer,
    ac.align,
    ac.data_type,
    case
        when ifnull(ac.func, '') <> '' then concat(ac.func, '(', rt.table_name, '.', ac.column_name, ')')
        else concat(rt.table_name, '.', ac.column_name)
    end as select_expr,
    concat(
        case
            when ifnull(ac.func, '') <> '' then concat(ac.func, '(', rt.table_name, '.', ac.column_name, ')')
            else concat(rt.table_name, '.', ac.column_name)
        end,
        ' as ',
        ifnull(nullif(ac.data_index, ''), ac.column_name)
    ) as select_fragment,
    case
        when je.table_id_left is null then concat('from ', rt.table_name)
        else concat(
            ifnull(je.jointype, 'join'),
            ' ',
            rt.table_name,
            case
                when ifnull(jc.join_condition, '') <> '' then concat(' on ', jc.join_condition)
                else ''
            end
        )
    end as from_join_fragment
from resolved_tables rt
left join active_columns ac
    on ac.table_id = rt.table_id
left join join_edges je
    on je.table_id_right = rt.table_id
left join join_conditions jc
    on jc.table_id_left = je.table_id_left
    and jc.table_id_right = je.table_id_right
order by
    rt.position,
    ac.column_position,
    ac.column_name
;

