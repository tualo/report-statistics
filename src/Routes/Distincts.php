<?php

namespace Tualo\Office\ReportStatistics\Routes;

use Tualo\Office\Basic\TualoApplication as App;
use Tualo\Office\Basic\Route as BasicRoute;


class Distincts extends \Tualo\Office\Basic\RouteWrapper
{
    public static function register()
    {
        BasicRoute::add('/report-statistics/distincts', function ($matches) {
            App::contenttype('application/json');
            try {

                $db = App::get('session')->getDB();
                $json = file_get_contents(dirname(dirname(__FILE__)) . '/data/cnf/json/columns.json');
                $json = str_replace("Ext.tualo.PivotGridFunctionCount", "Tualo.reportStatistics.lazy.controlls.PivotGridFunctionCount", $json);
                $json = str_replace("Ext.tualo.PivotGridFunctionSum", "Tualo.reportStatistics.lazy.controlls.PivotGridFunctionSum", $json);
                $json = str_replace("Ext.tualo.PivotGridFunctionMin", "Tualo.reportStatistics.lazy.controlls.PivotGridFunctionMin", $json);
                $json = str_replace("Ext.tualo.PivotGridFunctionMax", "Tualo.reportStatistics.lazy.controlls.PivotGridFunctionMax", $json);
                $json = str_replace("Ext.tualo.PivotGridFunctionAverage", "Tualo.reportStatistics.lazy.controlls.PivotGridFunctionAverage", $json);

                $columnsDefinition = json_decode($json, true);


                $input = json_decode(file_get_contents('php://input'), true);
                if (is_null($input)) throw new \Exception("Error Processing Request", 1);

                $sqls = [];
                foreach ($columnsDefinition as  $column) {
                    if (isset($input['dataIndex']) && ($input['dataIndex'] == $column['dataIndex'])) {
                        if (isset($column['filterList'])) {
                            $filterList = $column['filterList'];
                            $sql = 'select ' . (isset($filterList['treeValue']) ? '`' . $filterList['treeValue'] . '`' : '""') . ' as treevalue, `' . $filterList['valueColumn'] . '` as value from ' . $filterList['table'] . '  ';
                            $sqls[] = $sql;
                        } else {
                            foreach ($input['reportTypes'] as $reportType) {
                                $sql = "select '' treevalue, `" . $column['dataIndex'] . "` as value from " . str_replace('{tabellenzusatz}', $reportType, $column['table']) . " group by `" . $column['dataIndex'] . "` ";
                                $sqls[] = $sql;
                            }
                        }
                    }
                }

                App::result('sqls', $sqls);
                $data = $db->direct("select distinct treeValue,value from (" . implode(" union ", $sqls) . ") as subquery");
                App::result('data', $data);
                App::result('success', true);
            } catch (\Exception $e) {
                App::result('success', false);
                App::result('message', $e->getMessage());
            }
        }, ['post'], true);
    }
}
