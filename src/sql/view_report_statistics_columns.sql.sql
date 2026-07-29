CREATE
OR REPLACE VIEW `view_report_statistics_columns` AS
select
    concat (
        `report_statistics_tables`.`name`,
        ' - ',
        `v`.`name`
    ) AS `text`,
    `v`.`data_index` AS `data_index`,
    `v`.`table_template` AS `table`,
    `v`.`table_id` AS `table_id`,
    `v`.`column_name` AS `column`,
    `v`.`align` AS `align`,
    `v`.`pivot_function` AS `pivot_function`,
    `v`.`func` AS `func`,
    `v`.`renderer` AS `renderer`,
    `v`.`data_type` AS `type`
from
    (
        `view_readtable_report_statistics_tables_columns` `v`
        join `report_statistics_tables` on (
            `report_statistics_tables`.`id` = `v`.`table_id`
            and `v`.`active` = 1
        )
    )