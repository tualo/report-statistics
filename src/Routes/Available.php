<?php

namespace Tualo\Office\ReportStatistics\Routes;

use Tualo\Office\Basic\TualoApplication as App;
use Tualo\Office\Basic\Route as BasicRoute;


class Available extends \Tualo\Office\Basic\RouteWrapper
{
    public static function register()
    {
        BasicRoute::add('/report-statistics/available', function ($matches) {
            App::contenttype('application/json');
            $db = App::get('session')->getDB();
            try {
                $json = file_get_contents(dirname(dirname(__FILE__)) . '/data/cnf/json/columns.json');
                $json = str_replace("Ext.tualo.PivotGridFunctionCount", "Tualo.reportStatistics.lazy.controlls.PivotGridFunctionCount", $json);
                $json = str_replace("Ext.tualo.PivotGridFunctionSum", "Tualo.reportStatistics.lazy.controlls.PivotGridFunctionSum", $json);
                $json = str_replace("Ext.tualo.PivotGridFunctionMin", "Tualo.reportStatistics.lazy.controlls.PivotGridFunctionMin", $json);
                $json = str_replace("Ext.tualo.PivotGridFunctionMax", "Tualo.reportStatistics.lazy.controlls.PivotGridFunctionMax", $json);
                $json = str_replace("Ext.tualo.PivotGridFunctionAverage", "Tualo.reportStatistics.lazy.controlls.PivotGridFunctionAverage", $json);

                $columnsDefinition = json_decode($json, true);


                App::result('data', $columnsDefinition);
                App::result('success', true);
            } catch (\Exception $e) {
                App::result('success', false);
                App::result('message', $e->getMessage());
            }
        }, ['get'], false);
    }
}
