
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
                '`tbl_', tl.table_id,'`', '.', jf.field_id_left,
                ' = ',
               '`tbl_', tr.table_id,'`', '.', jf.field_id_right
                /*
                tl.table_template, '.', jf.field_id_left,
                ' = ',
                tr.table_template, '.', jf.field_id_right
                */
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
        rt.table_template ,
        ' as `tbl_', rt.table_id,'` ',
        ifnull(
            concat(
                ' ',
                group_concat(
                    concat(
                        cj.jointype,
                        ' ',
                        bt.table_template,
                        ' as `tbl_', bt.table_id,'` ',
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
