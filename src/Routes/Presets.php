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
                $sql = 'select id,name,datetype,datefrom,dateuntil,description,tz from rn_statistik_configs';
                App::result('data', $db->direct($sql));
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
                if (count($set) == 0) throw new \Exception('No fields to update');
                $sql = 'update rn_statistik_configs set ' . implode(',', $set) . ' where id=' . $db->escape_string($input['id']);
                $db->direct($sql);


                App::result('success', true);
            } catch (\Exception $e) {
                App::result('success', false);
                App::result('message', $e->getMessage());
            }
        }, ['patch'], true);
    }
}
