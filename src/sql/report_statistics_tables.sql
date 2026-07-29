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
        on replace(report_statistics_tables.table_template,'{tabellenzusatz}',get_report_statistics_default_tz()) = ds_column_list_label.table_name
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


create or replace view view_readtable_report_statistics_from_fragment as
with recursive
base_tables as (
    select
        t.id as table_id,
        t.table_template,
        t.position
    from report_statistics_tables t
),
root_table as (
    select
        bt.table_id,
        bt.table_template,
        bt.position
    from base_tables bt
    order by bt.position, bt.table_id
    limit 1
),
join_conditions as (
    select
        jf.table_id_left,
        jf.table_id_right,
        group_concat(
            concat(
                tl.table_template, '.', jf.field_id_left,
                ' = ',
                tr.table_template, '.', jf.field_id_right
            )
            order by jf.field_id_left, jf.field_id_right
            separator ' and '
        ) as join_condition
    from report_statistics_tables_join_fields jf
    join base_tables tl
        on tl.table_id = jf.table_id_left
    join base_tables tr
        on tr.table_id = jf.table_id_right
    group by jf.table_id_left, jf.table_id_right
),
edges as (
    select
        j.table_id_left,
        j.table_id_right,
        ifnull(j.jointype, 'join') as jointype,
        ifnull(jc.join_condition, '') as join_condition
    from report_statistics_tables_join j
    left join join_conditions jc
        on jc.table_id_left = j.table_id_left
        and jc.table_id_right = j.table_id_right
),
reachable as (
    select
        rt.table_id,
        cast(rt.table_id as char(4000)) as path,
        0 as depth
    from root_table rt

    union all

    select
        case
            when e.table_id_left = r.table_id then e.table_id_right
            else e.table_id_left
        end as table_id,
        concat(
            r.path,
            ',',
            case
                when e.table_id_left = r.table_id then e.table_id_right
                else e.table_id_left
            end
        ) as path,
        r.depth + 1 as depth
    from reachable r
    join edges e
        on e.table_id_left = r.table_id
        or e.table_id_right = r.table_id
    where find_in_set(
        case
            when e.table_id_left = r.table_id then e.table_id_right
            else e.table_id_left
        end,
        r.path
    ) = 0
),
node_depth as (
    select
        r.table_id,
        min(r.depth) as depth
    from reachable r
    group by r.table_id
),
join_candidates as (
    select
        child.table_id as child_table_id,
        parent.table_id as parent_table_id,
        e.jointype,
        e.join_condition,
        parent.depth as parent_depth,
        child.depth as child_depth,
        bt_parent.position as parent_position,
        bt_child.position as child_position,
        row_number() over (
            partition by child.table_id
            order by parent.depth, bt_parent.position, parent.table_id
        ) as rn
    from node_depth parent
    join edges e
        on e.table_id_left = parent.table_id
        or e.table_id_right = parent.table_id
    join node_depth child
        on child.table_id = case
            when e.table_id_left = parent.table_id then e.table_id_right
            else e.table_id_left
        end
    join base_tables bt_parent
        on bt_parent.table_id = parent.table_id
    join base_tables bt_child
        on bt_child.table_id = child.table_id
    where child.table_id <> parent.table_id
      and child.depth >= parent.depth
),
chosen_joins as (
    select
        jc.child_table_id,
        jc.parent_table_id,
        jc.jointype,
        jc.join_condition,
        jc.child_depth,
        jc.child_position
    from join_candidates jc
    where jc.rn = 1
)
select
    rt.table_id as root_table_id,
    rt.table_template as root_table_template,
    concat(
        'from ',
        rt.table_template,
        ifnull(
            concat(
                ' ',
                group_concat(
                    concat(
                        cj.jointype,
                        ' ',
                        bt.table_template,
                        case
                            when cj.join_condition <> '' then concat(' on ', cj.join_condition)
                            else ''
                        end
                    )
                    order by cj.child_depth, cj.child_position, cj.child_table_id
                    separator ' '
                )
            ),
            ''
        )
    ) as from_fragment
from root_table rt
left join chosen_joins cj
    on 1 = 1
left join base_tables bt
    on bt.table_id = cj.child_table_id
group by
    rt.table_id,
    rt.table_template
;
