<?php

namespace Tualo\Office\ReportStatistics\Routes;

use Tualo\Office\Basic\TualoApplication as App;
use Tualo\Office\Basic\Route as BasicRoute;


class ReportTypes extends \Tualo\Office\Basic\RouteWrapper
{
    public static function register()
    {
        BasicRoute::add('/report-statistics/report-types', function ($matches) {
            App::contenttype('application/json');
            $db = App::get('session')->getDB();
            try {

                App::result('data', $db->direct('select 0=1 checked,id,lower(tabellenzusatz) tabellenzusatz,name from blg_config order by name'));
                App::result('success', true);
            } catch (\Exception $e) {
                App::result('success', false);
                App::result('message', $e->getMessage());
            }
        }, ['get'], false);
    }
}
