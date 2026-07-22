<?php

namespace Tualo\Office\ReportStatistics\Routes;

use Tualo\Office\Basic\TualoApplication as App;
use Tualo\Office\Basic\Route as BasicRoute;
use Tualo\Office\ReportStatistics\Routes\Aggregate;


class Presets extends \Tualo\Office\Basic\RouteWrapper
{
    public static function register()
    {
        BasicRoute::add('/report-statistics/presets(/(?P<id>\d+))?', function ($matches) {
            App::contenttype('application/json');
            $db = App::get('session')->getDB();
            try {
                if (!isset($matches['id']) && isset($_GET['id'])) {
                    $matches['id'] = $_GET['id'];
                }
                if (isset($matches['id'])) {


                    $sql = 'select 
                        type, 
                        data
                    from rn_statistik_axis where rid={id}
                    group by rid,type';
                    $axis = $db->direct($sql, $matches, 'type');

                    $sql = 'select id,name,datetype,datefrom,dateuntil,description,tz from rn_statistik_configs where id={id}';
                    App::result('data', $db->singleRow($sql, $matches));

                    $sql = 'select id,name,datetype,datefrom,dateuntil,description,lower(tz) tz from rn_statistik_configs where id={id}';
                    $data = $db->singleRow($sql, $matches);

                    $columnsDefinition = Aggregate::getColumnsDefinition();
                    $_available = isset($axis['available']) ? json_decode($axis['available']['data'], true) : [];
                    $_rows = isset($axis['rows']) ? json_decode($axis['rows']['data'], true) : [];
                    $_columns = isset($axis['columns']) ? json_decode($axis['columns']['data'], true) : [];
                    $_values = isset($axis['values']) ? json_decode($axis['values']['data'], true) : [];

                    $available = [];
                    foreach ($_available as $a) {
                        $def = Aggregate::findColumnsDefinition($columnsDefinition, $a['dataIndex']);
                        if ($def === null) {
                            // throw new \Exception('Column definition not found for ' . $a);
                        } else {
                            $available[] = array_merge($def, $a);
                        }
                    }
                    $rows = [];
                    foreach ($_rows as $a) {
                        $def = Aggregate::findColumnsDefinition($columnsDefinition, $a['dataIndex']);
                        if ($def === null) {
                            // throw new \Exception('Column definition not found for ' . $a);
                        } else {
                            $rows[] = array_merge($def, $a);
                        }
                    }
                    $columns = [];
                    foreach ($_columns as $a) {
                        $def = Aggregate::findColumnsDefinition($columnsDefinition, $a['dataIndex']);
                        if ($def === null) {
                            // throw new \Exception('Column definition not found for ' . $a);
                        } else {
                            $columns[] = array_merge($def, $a);
                        }
                    }
                    $values = [];
                    foreach ($_values as $a) {
                        $def = Aggregate::findColumnsDefinition($columnsDefinition, $a['dataIndex']);
                        if ($def === null) {
                            // throw new \Exception('Column definition not found for ' . $a);
                        } else {
                            $values[] = array_merge($def, $a);
                        }
                    }

                    $data['axis'] = [
                        'available' => $available,
                        'rows' => $rows,
                        'columns' => $columns,
                        'values' => $values
                    ];

                    App::result('data', $data);
                } else {
                    $sql = '
                    with axis as (
                        select 
                            rid,
                            type, 
                            data

                        from 
                            rn_statistik_axis 
                        group by 
                            rid,
                            type
                    ),
                    axis_object as(
                        select 
                            id rid,
                            json_object(
                                "available", JSON_MERGE(axis_available.data,"[]"),
                                "rows", JSON_MERGE(axis_rows.data,"[]"),
                                "columns", JSON_MERGE(axis_columns.data,"[]"),
                                "values", JSON_MERGE(axis_values.data,"[]")
                            ) as data
                        from 
                            rn_statistik_configs 
                            join axis as axis_available on axis_available.rid=rn_statistik_configs.id and axis_available.type="available"
                            join axis as axis_rows on axis_rows.rid=rn_statistik_configs.id and axis_rows.type="rows"
                            join axis as axis_columns on axis_columns.rid=rn_statistik_configs.id and axis_columns.type="columns"
                            join axis as axis_values on axis_values.rid=rn_statistik_configs.id and axis_values.type="values"
                        group by id
                    )
                    select rn_statistik_configs.id,
                        rn_statistik_configs.name,
                        rn_statistik_configs.datetype,
                        rn_statistik_configs.datefrom,
                        rn_statistik_configs.dateuntil,
                        rn_statistik_configs.description,
                        lower(rn_statistik_configs.tz) tz,
                        axis_object.data
                    
                    from rn_statistik_configs 
                        left join 
                            axis_object on axis_object.rid=rn_statistik_configs.id';
                    $data = $db->direct($sql);
                    $result = [];
                    foreach ($data as $d) {
                        $d['axis'] = json_decode($d['data'], true);
                        unset($d['data']);
                        $result[] = $d;
                    }
                    App::result('data', $result);
                }
                App::result('success', true);
            } catch (\Exception $e) {
                App::result('success', false);
                App::result('message', $e->getMessage());
            }
        }, ['get'], true);


        BasicRoute::add('/report-statistics/presets', function ($matches) {
            App::contenttype('application/json');
            $db = App::get('session')->getDB();
            try {
                $input = json_decode(file_get_contents('php://input'), true);
                /*
                $sql = 'select id,name,datetype,datefrom,dateuntil,description,tz from rn_statistik_configs';
                App::result('data', $db->direct($sql));
                */
                if (!isset($input['id'])) throw new \Exception('Missing id');

                $flds = ['name', 'datetype', 'datefrom', 'dateuntil', 'description', 'tz'];
                $set = [];
                foreach ($flds as $f) {
                    if (isset($input[$f])) {
                        $set[] = $f . '= "' . $db->escape_string($input[$f]) . '"';
                    }
                }


                if ((count($set) == 0) && (!isset($input['axis']))) throw new \Exception('No fields to update');
                if (!(count($set) == 0)) {
                    $sql = 'update rn_statistik_configs set ' . implode(',', $set) . ' where id=' . $db->escape_string($input['id']);
                    $db->direct($sql);
                }
                if (isset($input['axis'])) {
                    $axis = $input['axis'];
                    $db->autocommit(false);
                    $db->direct('delete from rn_statistik_axis where rid={id}', $input);

                    $next_id = $db->singleValue('select ifnull(max(id),0) as id from rn_statistik_axis', [], 'id') + 1;
                    foreach (['available', 'rows', 'columns', 'values'] as $type) {
                        if (isset($axis[$type])) {
                            $string_data = json_encode($axis[$type]);

                            $db->direct('insert into rn_statistik_axis (id,rid,type,data) values ({id},{rid},{type},{data})', [
                                'id' => $next_id++,
                                'rid' => $input['id'],
                                'type' => $type,
                                'data' => $string_data
                            ]);
                        }
                    }
                    $db->commit();
                }


                App::result('success', true);
            } catch (\Exception $e) {
                App::result('success', false);
                App::result('message', $e->getMessage());
            }
        }, ['patch'], true);


        BasicRoute::add('/report-statistics/presets', function ($matches) {
            App::contenttype('application/json');
            $db = App::get('session')->getDB();
            try {
                $input = json_decode(file_get_contents('php://input'), true);
                if (!isset($input['id'])) throw new \Exception('Missing id');
                $sql = 'delete from rn_statistik_configs where id={id}';
                $db->direct($sql, $input);
                App::result('success', true);
            } catch (\Exception $e) {
                App::result('success', false);
                App::result('message', $e->getMessage());
            }
        }, ['delete'], true);
    }
}
