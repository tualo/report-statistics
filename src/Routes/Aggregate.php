<?php

namespace Tualo\Office\ReportStatistics\Routes;

use Tualo\Office\Basic\TualoApplication as App;
use Tualo\Office\Basic\Route as BasicRoute;


class Aggregate extends \Tualo\Office\Basic\RouteWrapper
{
    public static function appendColumns(array $columns_def, array $hkeys, array $data): array
    {
        $found_index = -1;
        $txt = array_shift($hkeys);
        for ($i = 0, $m = count($columns_def); $i < $m; $i++) {
            if ($columns_def[$i]['text'] === $txt) {
                $found_index = $i;
                break;
            }
        }

        if ($found_index === -1) {
            $columns_def[] = array(
                'text' => $txt,
                'columns' => array()
            );
            $found_index = count($columns_def) - 1;
        }
        if (count($hkeys) === 0) {

            $columns_def[$found_index]['columns'] = $data;
        } else {
            //print_r($hkeys);
            //print_r($data);
            //echo $found_index;
            $sub = self::appendColumns($columns_def[$found_index]['columns'], $hkeys, $data);
            $columns_def[$found_index]['columns'] = $sub;
        }
        return $columns_def;
    }
    public static function getColumnsDefinition(): array
    {
        $json = file_get_contents(dirname(dirname(__FILE__)) . '/data/cnf/json/columns.json');
        $json = str_replace("Ext.tualo.PivotGridFunctionCount", "Tualo.reportStatistics.lazy.controlls.PivotGridFunctionCount", $json);
        $json = str_replace("Ext.tualo.PivotGridFunctionSum", "Tualo.reportStatistics.lazy.controlls.PivotGridFunctionSum", $json);
        $json = str_replace("Ext.tualo.PivotGridFunctionMin", "Tualo.reportStatistics.lazy.controlls.PivotGridFunctionMin", $json);
        $json = str_replace("Ext.tualo.PivotGridFunctionMax", "Tualo.reportStatistics.lazy.controlls.PivotGridFunctionMax", $json);
        $json = str_replace("Ext.tualo.PivotGridFunctionAverage", "Tualo.reportStatistics.lazy.controlls.PivotGridFunctionAverage", $json);

        return json_decode($json, true);
    }

    public static function getTablesDefinition(): array
    {
        $json = file_get_contents(dirname(dirname(__FILE__)) . '/data/cnf/json/tables.json');
        $json = str_replace("Ext.tualo.PivotGridFunctionCount", "Tualo.reportStatistics.lazy.controlls.PivotGridFunctionCount", $json);
        $json = str_replace("Ext.tualo.PivotGridFunctionSum", "Tualo.reportStatistics.lazy.controlls.PivotGridFunctionSum", $json);
        $json = str_replace("Ext.tualo.PivotGridFunctionMin", "Tualo.reportStatistics.lazy.controlls.PivotGridFunctionMin", $json);
        $json = str_replace("Ext.tualo.PivotGridFunctionMax", "Tualo.reportStatistics.lazy.controlls.PivotGridFunctionMax", $json);
        $json = str_replace("Ext.tualo.PivotGridFunctionAverage", "Tualo.reportStatistics.lazy.controlls.PivotGridFunctionAverage", $json);

        return json_decode($json, true);
    }

    public static function findColumnsDefinition($columnsDefinition, $dataIndex)
    {
        foreach ($columnsDefinition as $p) {
            if ($p['dataIndex'] == $dataIndex) {
                return $p;
            }
        }
        return null;
    }


    private static function columnExists($tablename, $columnname, $tz, $db)
    {
        $columnname = strtolower($columnname);
        $sql = "select count(1) c from ds_column where existsreal=1 and lower(table_name)=lower({table_name}) and column_name=lower({column_name})";
        $data = $db->singleValue($sql, [
            'table_name' => str_replace('{tabellenzusatz}', $tz, $tablename),
            'column_name' => $columnname
        ], 'c');
        return ($data > 0);
    }


    public static function createTemporaryTable($columns, $rows, $values): string
    {
        $db = App::get('session')->getDB();
        $new_table_name = 'temporary_table_' . uniqid();

        $columnsDefinition = self::getColumnsDefinition();

        $createFields = array(array('dataIndex' => 'datenbasis'), array('dataIndex' => 'erweiterte_datenbasis'));
        foreach ($columns as $f) {

            $createFields[] = self::findColumnsDefinition($columnsDefinition, $f['dataIndex']);
        }

        foreach ($rows as $f) {

            $createFields[] = self::findColumnsDefinition($columnsDefinition, $f['dataIndex']);
        }

        foreach ($values as $f) {

            $createFields[] = self::findColumnsDefinition($columnsDefinition, $f['dataIndex']);
        }

        $_createFields = array();
        foreach ($createFields as $fld) {
            $type = 'varchar(255)';
            if ($fld['dataIndex'] == 'notizen') {
                $type = 'varchar(4000)';
            }
            if ($fld['dataIndex'] != 'belegnummer') {
                if (isset($fld['type'])) {
                    switch ($fld['type']) {
                        case 'number':
                            $type = 'decimal(25,5)';
                            break;
                        case 'date':
                            $type = 'date';
                            break;
                    }
                }
            }
            $_createFields[$fld['dataIndex']] = $type;
        }
        $_fld = '';
        foreach ($_createFields as $k => $t) {
            if ($_fld !== '') {
                $_fld .= ',';
            }
            $_fld .= $k . ' ' . $t;
        }

        $temp_create = 'create temporary table  ' . $new_table_name . ' (' . $_fld . ') ;';
        App::result('temp_create', $temp_create);
        $db->direct($temp_create);
        return $new_table_name;
    }


    public static function fillTemporaryTable(string  $temporaryName, string  $tz, array $columns,  array $rows,  array $values,  array $available, string $dateType, string $startDate, string $stopDate): bool
    {
        $db = App::get('session')->getDB();
        $columnsDefinition = self::getColumnsDefinition();


        $having_filter = '';

        if ($dateType == 'belegdatum') {
            $dateType = 'datum';
        }

        $having_filter = 'blg_hdr_' . $tz . '.' . $dateType . '>=\'' . $startDate . '\' and ';
        $having_filter .= 'blg_hdr_' . $tz . '.' . $dateType . '<=\'' . $stopDate . '\' ';


        $columnsHash = array();
        foreach ($columnsDefinition as $key => $value) {
            $columnsHash[$value['dataIndex']] = $value['table'];
        }
        $uniqueIFields = array();
        $ifields = array();
        $fields = array();
        $usedTables = array();

        foreach ($columns as $f) {
            $usedTables[$columnsHash[$f['dataIndex']]] = true;

            if ($f['dataIndex'] == 'datenbasis') {
                if (isset($f['filter'])) {
                    $datenbasis_filter = $f['filter'];
                }
            } else if ($f['dataIndex'] == 'erweiterte_datenbasis') {
                if (isset($f['filter'])) {
                    $erweiterte_datenbasis_filter = $f['filter'];
                }
            } else {
                $x = self::findColumnsDefinition($columnsDefinition, $f['dataIndex']);
                if (isset($f['filter'])) {
                    if (count($f['filter']) > 0) {
                        for ($i = 0; $i < count($f['filter']); ++$i) {
                            $f['filter'][$i] = $db->escape_string($f['filter'][$i]);
                        }
                        if ($having_filter !== '') {
                            $having_filter .= ' and ';
                        }
                        if (!isset($x['func'])) {
                            $having_filter .= $x['table'] . '.' . $x['column'] . ' in (\'' . (implode('\',\'', $f['filter'])) . '\')';
                        } else {
                            $having_filter .= str_replace('{#}', $x['table'] . '.' . $x['column'], $x['func']) . ' in (\'' . (implode('\',\'', $f['filter'])) . '\')';
                        }

                        //$having_filter .= $x['table'].'.'.$x['column'].' in (\''.(implode($f['filter'], '\',\'')).'\')';
                    }
                }

                if (!isset($uniqueIFields[$x['dataIndex']])) {
                    $uniqueIFields[$x['dataIndex']] = true;
                    $ifields[] = $x['dataIndex'];
                    if (self::columnExists($x['table'], $x['column'], $tz, $db)) {
                        if (!isset($x['func'])) {
                            $x['func'] = '{#}';
                        }
                        $fields[] = str_replace('{#}', $x['table'] . '.' . $x['column'], $x['func']) . ' ' . $x['dataIndex'];
                        $tables[strtolower($x['table'])] = false;
                    } else {
                        App::result('debug_sql', $db->last_sql);
                        App::result('debug', $x['column']);
                        switch ($x['type']) {
                            case 'date':
                                $fields[] = '\'1970-01-01\' ' . $x['dataIndex'];
                                break;
                            case 'number':
                                $fields[] = '0 ' . $x['dataIndex'];
                                break;
                            default:
                                $fields[] = '\'\' ' . $x['dataIndex'];
                                break;
                        }
                    }
                }
            }
        }

        foreach ($rows as $f) {
            $usedTables[$columnsHash[$f['dataIndex']]] = true;
            if ($f['dataIndex'] == 'datenbasis') {
                if (isset($f['filter'])) {
                    $datenbasis_filter = $f['filter'];
                }
            } else if ($f['dataIndex'] == 'erweiterte_datenbasis') {
                if (isset($f['filter'])) {
                    $erweiterte_datenbasis_filter = $f['filter'];
                }
            } else {
                $x = self::findColumnsDefinition($columnsDefinition, $f['dataIndex']);
                if (isset($f['filter'])) {
                    if (count($f['filter']) > 0) {
                        for ($i = 0; $i < count($f['filter']); ++$i) {
                            $f['filter'][$i] = $db->escape_string($f['filter'][$i]);
                        }
                        if ($having_filter !== '') {
                            $having_filter .= ' and ';
                        }
                        if (!isset($x['func'])) {
                            $having_filter .= $x['table'] . '.' . $x['column'] . ' in (\'' . (implode('\',\'', $f['filter'])) . '\')';
                        } else {
                            $having_filter .= str_replace('{#}', $x['table'] . '.' . $x['column'], $x['func']) . ' in (\'' . (implode('\',\'', $f['filter'])) . '\')';
                        }

                        //$having_filter .= $x['table'].'.'.$x['column'].' in (\''.(implode($f['filter'], '\',\'')).'\')';
                    }
                }
                if (!isset($uniqueIFields[$x['dataIndex']])) {
                    $uniqueIFields[$x['dataIndex']] = true;
                    $ifields[] = $x['dataIndex'];
                    if (self::columnExists($x['table'], $x['column'], $tz, $db)) {
                        if (!isset($x['func'])) {
                            $x['func'] = '{#}';
                        }
                        $fields[] = str_replace('{#}', $x['table'] . '.' . $x['column'], $x['func']) . ' ' . $x['dataIndex'];
                        $tables[strtolower($x['table'])] = false;
                    } else {
                        switch ($x['type']) {
                            case 'date':
                                $fields[] = '\'1970-01-01\' ' . $x['dataIndex'];
                                break;
                            case 'number':
                                $fields[] = '0 ' . $x['dataIndex'];
                                break;
                            default:
                                $fields[] = '\'\' ' . $x['dataIndex'];
                                break;
                        }
                    }
                }
            }
        }

        foreach ($values as $f) {
            $usedTables[$columnsHash[$f['dataIndex']]] = true;
            if ($f['dataIndex'] == 'datenbasis') {
                if (isset($f['filter'])) {
                    $datenbasis_filter = $f['filter'];
                }
            } else if ($f['dataIndex'] == 'erweiterte_datenbasis') {
                if (isset($f['filter'])) {
                    $erweiterte_datenbasis_filter = $f['filter'];
                }
            } else {
                $x = self::findColumnsDefinition($columnsDefinition, $f['dataIndex']);
                if (isset($f['filter'])) {
                    if (count($f['filter']) > 0) {
                        for ($i = 0; $i < count($f['filter']); ++$i) {
                            $f['filter'][$i] = $db->escape_string($f['filter'][$i]);
                        }
                        if ($having_filter !== '') {
                            $having_filter .= ' and ';
                        }
                        if (!isset($x['func'])) {
                            $having_filter .= $x['table'] . '.' . $x['column'] . ' in (\'' . (implode('\',\'', $f['filter'])) . '\')';
                        } else {
                            $having_filter .= str_replace('{#}', $x['table'] . '.' . $x['column'], $x['func']) . ' in (\'' . (implode('\',\'', $f['filter'])) . '\')';
                        }

                        //$having_filter .= $x['table'].'.'.$x['column'].' in (\''.(implode($f['filter'], '\',\'')).'\')';
                    }
                }

                if (!isset($uniqueIFields[$x['dataIndex']])) {
                    $uniqueIFields[$x['dataIndex']] = true;
                    $ifields[] = $x['dataIndex'];
                    if (self::columnExists($x['table'], $x['column'], $tz, $db)) {
                        if (!isset($x['func'])) {
                            $x['func'] = '{#}';
                        }
                        $fields[] = str_replace('{#}', $x['table'] . '.' . $x['column'], $x['func']) . ' ' . $x['dataIndex'];
                        $tables[strtolower($x['table'])] = false;
                    } else {
                        switch ($x['type']) {
                            case 'date':
                                $fields[] = '\'1970-01-01\' ' . $x['dataIndex'];
                                break;
                            case 'number':
                                $fields[] = '0 ' . $x['dataIndex'];
                                break;
                            default:
                                $fields[] = '\'\' ' . $x['dataIndex'];
                                break;
                        }
                    }
                }
            }
        }



        foreach ($available as $f) {
            if ($f['dataIndex'] == 'datenbasis') {
                if (isset($f['filter'])) {
                    $datenbasis_filter = $f['filter'];
                }
            } else if ($f['dataIndex'] == 'erweiterte_datenbasis') {
                if (isset($f['filter'])) {
                    $erweiterte_datenbasis_filter = $f['filter'];
                }
            } else {
                $x = self::findColumnsDefinition($columnsDefinition, $f['dataIndex']);
                if (isset($f['filter'])) {
                    if (count($f['filter']) > 0) {
                        $usedTables[$columnsHash[$f['dataIndex']]] = true;
                        for ($i = 0; $i < count($f['filter']); ++$i) {
                            $f['filter'][$i] = $db->escape_string($f['filter'][$i]);
                        }
                        if ($having_filter !== '') {
                            $having_filter .= ' and ';
                        }
                        if (!isset($x['func'])) {
                            $having_filter .= $x['table'] . '.' . $x['column'] . ' in (\'' . (implode('\',\'', $f['filter'])) . '\')';
                        } else {
                            $having_filter .= str_replace('{#}', $x['table'] . '.' . $x['column'], $x['func']) . ' in (\'' . (implode('\',\'', $f['filter'])) . '\')';
                        }

                        //$having_filter .= $x['table'].'.'.$x['column'].' in (\''.(implode($f['filter'], '\',\'')).'\')';
                    }
                }
            }
            //$fields[]=$x['dataIndex'];
        }


        if ($having_filter === '') {
            $having_filter = ' true ';
        }


        $insert = '';

        $from = array();
        $tablesDefinition = self::getTablesDefinition();

        $tempDefinition = array();
        for ($i = 0; $i < count($tablesDefinition); ++$i) {
            if (isset($tables[strtolower($tablesDefinition[$i]['table'])])) {
                if (isset($usedTables[strtolower($tablesDefinition[$i]['table'])])) {
                    $tempDefinition[] = $tablesDefinition[$i];
                }
            }
        }

        $runs = 3;
        while ($runs >= 0) {
            $intermediaTables = array();
            foreach ($tempDefinition as $definition) {
                foreach ($definition['tables'] as $joinTable) {
                    if ((!isset($tables[strtolower($joinTable['table'])]))) {
                        $intermediaTables[strtolower($joinTable['table'])] = false;
                    }
                }
            }

            for ($i = 0; $i < count($tablesDefinition); ++$i) {
                if (isset($intermediaTables[strtolower($tablesDefinition[$i]['table'])])) {
                    $tempDefinition[] = $tablesDefinition[$i];
                    $tables[strtolower($tablesDefinition[$i]['table'])] = true;
                }
            }
            //print_r($intermediaTables);
            --$runs;
        }

        $tables[strtolower('blg_hdr_' . $tz)] = true;
        $tempDefinition = array();
        for ($i = 0; $i < count($tablesDefinition); ++$i) {
            if (isset($tables[strtolower($tablesDefinition[$i]['table'])])) {
                $tempDefinition[] = $tablesDefinition[$i];
            }
        }

        foreach ($tablesDefinition as $definition) {
            $on = array();
            foreach ($definition['tables'] as $joinTable) {
                $on[] = $joinTable['on'];
            }

            $from[] = $definition['table'] . ((count($on) > 0) ? (' on ' . implode(' and ', $on)) : '');
        }


        $config = $db->singleRow('select * from blg_config where tabellenzusatz={tabellenzusatz}', ['tabellenzusatz' => $tz]);
        $insert = 'insert into ' . $temporaryName . ' (datenbasis,erweiterte_datenbasis,' . implode(',', $ifields) . ') select \'Beleg\' datenbasis, concat(\'Beleg - \',\'' . $tz . '\') erweiterte_datenbasis,' . implode(',', $fields) . ' from ' . implode(' join ', $from) . ' ' . ' where ' . $having_filter;
        $insert = str_replace('{IDCOLUMN}', $config['bezug_id'], $insert);
        $insert = str_replace('{DSTABELLE}', $config['adress_bezug'], $insert);
        $insert = str_replace('{BLGTABELLE}', $config['adress_bezug'], $insert);
        $insert = str_replace('{tabellenzusatz}', $tz, $insert);
        $insert = str_replace('{bw}', $config['bw_faktor'], $insert);
        $insert = str_replace('{lf}', $config['lager_faktor'], $insert);
        $insert = str_replace('{tabellenzusatz_uc}', strtoupper($tz), $insert);
        // $insert = str_replace('{datumfeld}', $datumfeld, $insert);

        App::result('temp_fields', $fields);
        App::result('temp_insert', $insert);
        $db->direct($insert);
        return true;
    }


    public static function getData(array $available, array $columns, array $rows, array $values, array $reportTypes, string $dateType, string $startDate, string $stopDate): array
    {
        $db = App::get('session')->getDB();

        /*
        $json = file_get_contents(dirname(dirname(__FILE__)) . '/data/cnf/json/columns.json');
        $json = str_replace("Ext.tualo.PivotGridFunctionCount", "Tualo.reportStatistics.lazy.controlls.PivotGridFunctionCount", $json);
        $json = str_replace("Ext.tualo.PivotGridFunctionSum", "Tualo.reportStatistics.lazy.controlls.PivotGridFunctionSum", $json);
        $json = str_replace("Ext.tualo.PivotGridFunctionMin", "Tualo.reportStatistics.lazy.controlls.PivotGridFunctionMin", $json);
        $json = str_replace("Ext.tualo.PivotGridFunctionMax", "Tualo.reportStatistics.lazy.controlls.PivotGridFunctionMax", $json);
        $json = str_replace("Ext.tualo.PivotGridFunctionAverage", "Tualo.reportStatistics.lazy.controlls.PivotGridFunctionAverage", $json);

        $columnsDefinition = json_decode($json, true);
        */
        $agregation_fields = array();
        $top_field_list = '';
        $columnsDefinition = array();
        $fieldsDefinition = array();
        $having_def = array();
        $leftFields = array();

        foreach ($rows as $l) {
            $item = array(
                'dataIndex' => $l['dataIndex']
            );
            if (isset($l['rendererMap'])) {
                $item['rendererMap'] = $l['rendererMap'];
            }
            if (isset($l['align'])) {
                $item['align'] = $l['align'];
            }
            if (isset($l['text'])) {
                $item['text'] = $l['text'];
            }
            $columnsDefinition[] = $item;

            $fitem = array(
                'name' => $l['dataIndex']
            );
            $fieldsDefinition[] = $fitem;
            //fieldsDefinition.push(fitem);

            $leftFields[] = $l['dataIndex'];
        }

        foreach ($columns as $t) {
            $top_field = $t['dataIndex'];
            if ($top_field_list !== '') {
                $top_field_list .= ',';
            }
            $top_field_list .= $top_field;
        }

        $temporaryName =  self::createTemporaryTable($columns, $rows, $values);
        for ($i = 0; $i < count($reportTypes); $i++) {
            $tz = $reportTypes[$i];
            self::fillTemporaryTable($temporaryName, $tz, $columns, $rows, $values, $available,  $dateType,  $startDate,  $stopDate);
        }
        $top_sql = 'select  ' . $top_field_list . ' from ' . $temporaryName . ' group by ' . $top_field_list . ' ';
        $top_field_data = $db->direct($top_sql);
        App::result('top_field_data', $top_field_data);



        $sumColumns = array();
        $sumHeader = array();

        $tree = array();
        $columns_def = array();


        for ($i = 0; $i < count($top_field_data); $i++) {
            $item = array();
            $rows = $top_field_data[$i];
            $condition = '';
            $xtxt = array();

            $dColumn = array();
            foreach ($rows as $k => $v) {
                if ($condition != '') {
                    $condition .= ' and ';
                }
                $condition .= $k . ' = \'' . $v . '\' ';
                $xtxt[] = $v;
                $item['text'] = $v;
                $dColumn[] = $v;
                $ci = array(
                    'text' => $v,
                    'columns' => array()
                );
            }

            $subColumns = array();
            foreach ($values as $v) {
                $summaryType = '';
                $summaryRenderer = '';
                $txt = 'sum(case when (' . $condition . ') THEN ' . $v['dataIndex'] . ' END) ' . ' FLD_' . count($agregation_fields);
                switch ($v['pivotFunction']) {
                    case 'Tualo.reportStatistics.lazy.controlls.PivotGridFunctionSum2Digits':
                        $txt = 'round( sum(case when (' . $condition . ') THEN ' . $v['dataIndex'] . ' END), 2) ' . ' FLD_' . count($agregation_fields);
                        $summaryType = 'sum';
                        $summaryRenderer = 'deValueRenderer';
                        break;

                    case 'Tualo.reportStatistics.lazy.controlls.PivotGridFunctionSum':
                        $txt = 'round( sum(case when (' . $condition . ') THEN ' . $v['dataIndex'] . ' END), 5) ' . ' FLD_' . count($agregation_fields);
                        $summaryType = 'sum';
                        $summaryRenderer = 'deValueRenderer';
                        break;

                    case 'Tualo.reportStatistics.lazy.controlls.PivotGridFunctionMax':
                        $txt = 'max(case when (' . $condition . ') THEN ' . $v['dataIndex'] . ' END) ' . ' FLD_' . count($agregation_fields);
                        $summaryType = 'max';
                        $summaryRenderer = 'deValueRenderer';
                        break;
                    case 'Tualo.reportStatistics.lazy.controlls.PivotGridFunctionMin':
                        $txt = 'min(case when (' . $condition . ') THEN ' . $v['dataIndex'] . ' END) ' . ' FLD_' . count($agregation_fields);
                        $summaryType = 'min';
                        $summaryRenderer = 'deValueRenderer';
                        break;
                    case 'Tualo.reportStatistics.lazy.controlls.PivotGridFunctionCount':
                        $txt = 'count(case when (' . $condition . ') THEN ' . $v['dataIndex'] . ' END) ' . ' FLD_' . count($agregation_fields);
                        $summaryType = 'sum';
                        $summaryRenderer = 'deValueRenderer';
                        break;
                    case 'Tualo.reportStatistics.lazy.controlls.PivotGridFunctionDistinctCount':
                        $txt = 'count(distinct  case when (' . $condition . ') THEN ' . $v['dataIndex'] . ' END) ' . ' FLD_' . count($agregation_fields);
                        $summaryType = 'sum';
                        $summaryRenderer = 'deValueRenderer';
                        break;
                    case 'Tualo.reportStatistics.lazy.controlls.PivotGridFunctionAverage':
                        $txt = 'avg(case when (' . $condition . ') THEN ' . $v['dataIndex'] . ' END) ' . ' FLD_' . count($agregation_fields);
                        $summaryType = 'avg';
                        $summaryRenderer = 'deValueRenderer';
                        break;
                }

                $subitem = array(
                    'dataIndex' => 'fld_' . count($agregation_fields),
                    'align' => $v['align'],
                    'renderer' => $v['renderer'],
                    'width' => 150,
                    'text' => $v['text'] //xtxt.join(' - ')
                );
                if ($summaryType != '') {
                    $subitem['summaryType'] = $summaryType;
                    $subitem['summaryRenderer'] = $summaryRenderer;
                }

                if (isset($v['number_filter'])) {
                    if (isset($v['number_filter']['smaller'])) {
                        $having_def[] = 'fld_' . count($agregation_fields) . " < " . floatval($v['number_filter']['smaller']);
                    }
                    if (isset($v['number_filter']['greater'])) {
                        $having_def[] = 'fld_' . count($agregation_fields) . " > " . floatval($v['number_filter']['greater']);
                    }
                    if (isset($v['number_filter']['equal'])) {
                        $having_def[] = 'fld_' . count($agregation_fields) . " = " . floatval($v['number_filter']['equal']);
                    }
                }
                if (!isset($sumColumns[$v['dataIndex']])) {
                    $sumColumns[$v['dataIndex']] = array();
                }
                $sumColumns[$v['dataIndex']][] = str_replace(' FLD_' . count($agregation_fields), '', $txt);
                $sumHeader[$v['dataIndex']] = array('text' => $v['text']);

                //postMessage({command:'log',data: values[v] });
                if (isset($v['rendererMap'])) {
                    $sumHeader[$v['dataIndex']]['rendererMap'] = $v['rendererMap'];
                    $subitem['rendererMap'] = $v['rendererMap'];
                }
                $subColumns[] = $subitem;
                $fitem = array(
                    'name' => 'fld_' . count($agregation_fields)
                );


                $fieldsDefinition[] = ($fitem);
                $agregation_fields[] = ($txt);
            }
            $columns_def = self::appendColumns($columns_def, $dColumn, $subColumns);
        }


        for ($ctreeIndex = 0; $ctreeIndex < count($columns_def); $ctreeIndex++) {
            $columnsDefinition[] = ($columns_def[$ctreeIndex]);
        }
        $gIndex = 0;
        $sum_fields = array();
        foreach ($sumColumns as $key => $arr) {
            $d = array(
                'text' => 'Gesamt (' . $sumHeader[$key]['text'] . ')',
                'dataIndex' => 'gsm_' . $gIndex,
                'align' => 'right',
                'summaryType' => 'sum',
                'summaryRenderer' => 'deValueRenderer',
                'renderer' => 'deValueRenderer',
            );
            if (isset($sumHeader[$key]['rendererMap'])) {
                $d['rendererMap'] = $sumHeader[$key]['rendererMap'];
            }

            $columnsDefinition[] = $d;
            $fieldsDefinition[] = array(
                'name' => 'gsm_' . $gIndex,
                'type' => 'number'
            );
            $sum_fields[] = '(IFNULL(' . implode(',0) + IFNULL(', $arr) . ',0)) ' . 'gsm_' . $gIndex;
            $gIndex++;
        }

        App::result('sum_fields', $sum_fields);
        App::result('sumColumns', $sumColumns);


        $d = array();
        foreach ($columnsDefinition as $col) {
            if (isset($col['columns'])) {
                if (count($col['columns']) == 1) {
                    $d[] =  $col['columns'][0];
                    $d[count($d) - 1]['text'] = $col['text'] . ' ' . $col['columns'][0]['text'];
                } else {
                    $d[] = $col;
                }
            } else {
                $d[] = $col;
            }
        }
        $columnsDefinition = $d;


        App::result('metaData', [
            'columns' => $columnsDefinition,
            'fields' => $fieldsDefinition,
            'idProperty' => '__rowid__',
            'messageProperty' => 'msg',
            'rootProperty' => 'data'
        ]);

        if (count($agregation_fields) > 0) {

            $pivot_sql = 'select ' . implode(',', $leftFields) . ', ' . implode(',', $agregation_fields) . ', ' . implode(',', $sum_fields) . '  from ' . $temporaryName;
            $pivot_sql .= ' group by ' . implode(',', $leftFields) . ' ';
            if (count($having_def) > 0) {
                $pivot_sql .= ' having ' . implode(' and ', $having_def);
            }
            $pivot_data = $db->direct($pivot_sql);
            return $pivot_data;
        }



        // App::result('distinct', $distinct);

        return [];
    }

    public static function register()
    {
        BasicRoute::add('/report-statistics/aggregate', function ($matches) {
            App::contenttype('application/json');
            $db = App::get('session')->getDB();
            try {

                $available = json_decode($_POST['available'], true);
                $columns = json_decode($_POST['columns'], true);
                $rows = json_decode($_POST['rows'], true);
                $values = json_decode($_POST['values'], true);
                $reportTypes = json_decode($_POST['reportTypes'], true);

                $dateType = $_POST['dateType'];
                $startDate = $_POST['startDate'];
                $stopDate = $_POST['stopDate'];
                $data = self::getData($available, $columns, $rows, $values, $reportTypes, $dateType, $startDate, $stopDate);

                App::result('data', $data);
                App::result('success', true);
            } catch (\Exception $e) {
                App::result('success', false);
                App::result('message', $e->getMessage());
            }
        }, ['post'], false);
    }
}
