<?php

namespace Tualo\Office\ReportStatistics\Routes;

use Tualo\Office\Basic\TualoApplication as App;
use Tualo\Office\Basic\Route as BasicRoute;


class Presets extends \Tualo\Office\Basic\RouteWrapper
{
    public static function register()
    {
        BasicRoute::add('/report-statistics/presets', function ($matches) {
            App::contenttype('application/json');
            $db = App::get('session')->getDB();
            try {
                $sql = 'select id,name from rn_statistik_configs';
                App::result('data', $db->direct($sql));
                App::result('success', true);
            } catch (\Exception $e) {
                App::result('success', false);
                App::result('message', $e->getMessage());
            }
        }, ['get'], false);
    }
}
