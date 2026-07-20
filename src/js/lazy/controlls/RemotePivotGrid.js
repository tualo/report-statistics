
Ext.define('Tualo.reportStatistics.lazy.controlls.RemotePivotGrid', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.tualo-report-statistics-remote-pivotgrid',
    /**
    * @cfg {String} fieldText Title for the field configuration-gird.
    */
    fieldText: 'Felder',
    /**
    * @cfg {String} columnsText Title for the column configuration-gird.
    */
    columnsText: 'Spalten',
    /**
    * @cfg {String} rowsText Title for the row configuration-gird.
    */
    rowsText: 'Zeilen',
    /**
    * @cfg {String} valuesText Title for the values configuration-gird.
    */
    valuesText: 'Werte',
    /**
    * @cfg {String} waitText The text show in the loading mask.
    */
    waitText: 'Bitte warten ...',
    /**
    * @cfg {Number} sequencePageSize The chunk size for calculating sequencly the pivot data.
    */
    sequencePageSize: 1000,
    /**
    * @cfg {Boolean} showAxisConfiguration True if the axis configuration should be shown.
    */
    showAxisConfiguration: true,
    /**
    * @cfg {String} axisConfigPosition show the axis configuration on the left 'west' or right 'east' (default) side.
    */
    axisConfigPosition: 'east',



    requires: [
        'Ext.grid.Panel',
        'Tualo.reportStatistics.lazy.model.AxisModel',
        'Tualo.reportStatistics.lazy.controlls.PivotGridAxis',
        'Tualo.reportStatistics.lazy.controlls.PivotGridFunctionSum',
        'Tualo.reportStatistics.lazy.controlls.PivotGridFunctionCount',
        'Tualo.reportStatistics.lazy.controlls.PivotGridFunctionAverage',
        'Tualo.reportStatistics.lazy.controlls.PivotGridFunctionDistinctCount',
        'Tualo.reportStatistics.lazy.controlls.PivotGridFunctionMin',
        'Tualo.reportStatistics.lazy.controlls.PivotGridFunctionMax'
    ],
    setAxisData: function (axis, data) {

        var grid = this.down('#pivotgrid-configuration-axes-' + axis);
        console.log('setAxisData', axis, data, grid);
        grid.getStore().loadData(data);
    },
    layout: 'border',
    items: [
        {
            xtype: 'grid',
            region: 'center',
            layout: 'fit',
        }, {
            itemId: 'pivotgrid-configuration',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            collapsible: true,
            split: true,
            region: 'east',
            width: 400,
            minWidth: 200,
            maxWidth: 600,
            xtype: 'panel',

            title: 'Konfiguration',
            items: [
                {
                    itemId: 'pivotgrid-configuration-axes',
                    flex: 1,
                    xtype: 'panel',
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },

                    items: [
                        {
                            itemId: 'pivotgrid-configuration-axes-available',
                            flex: 1,
                            text: 'Felder',
                            xtype: 'tualo-reportstatistics-pivotgridaxis',
                            // itemId: 'pivotgrid-left',
                            border: true,
                            flex: 1,
                            showFunction: false,
                            showFilter: true,
                            listeners: {

                                beforeQueryTableparts: function (queryObject) {
                                    queryObject.__seen_by_remote_pivot_grid = true;
                                    console.log('beforeQueryTableparts', queryObject);
                                    this.up('tualo-report-statistics-remote-pivotgrid').fireEvent('beforeQueryTableparts', queryObject);
                                }
                            },
                            store: {

                                pageSize: 25000,
                                model: 'Tualo.reportStatistics.lazy.model.AxisModel',
                                autoLoad: true,
                                proxy: {
                                    type: 'ajax',
                                    actionMethods: {
                                        create: 'POST',
                                        read: 'GET',
                                        update: 'PATCH',
                                        destroy: 'DELETE'
                                    },
                                    timeout: 600000,
                                    url: './report-statistics/available',
                                    reader: {
                                        type: 'json',
                                        rootProperty: 'data',
                                        totalProperty: 'total',
                                        listeners: {
                                            scope: this
                                        }
                                    }
                                }/*,
                                listeners: {
                                    load: 'onAvailableColumnsLoad'
                                }*/
                            }
                            // showNumberFilter: true
                        },
                        {
                            flex: 1,
                            xtype: 'tualo-reportstatistics-pivotgridaxis',
                            itemId: 'pivotgrid-configuration-axes-columns',
                            border: true,
                            text: 'Spalten',
                            showFunction: false,
                            showFilter: true,
                            store: {

                                type: 'json',
                                model: 'Tualo.reportStatistics.lazy.model.AxisModel',
                                reader: {
                                    type: 'json',
                                    rootProperty: 'data'
                                }
                            }
                            // showNumberFilter: true
                        }
                    ],
                },
                {
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    xtype: 'panel',
                    flex: 1,
                    items: [
                        {
                            flex: 1,
                            xtype: 'tualo-reportstatistics-pivotgridaxis',
                            itemId: 'pivotgrid-configuration-axes-rows',
                            text: 'Zeilen',
                            border: true,
                            showFunction: false,
                            showFilter: true,
                            store: {

                                type: 'json',
                                model: 'Tualo.reportStatistics.lazy.model.AxisModel',
                                reader: {
                                    type: 'json',
                                    rootProperty: 'data'
                                }
                            }
                            // showNumberFilter: true
                        },
                        {
                            flex: 1,
                            xtype: 'tualo-reportstatistics-pivotgridaxis',
                            itemId: 'pivotgrid-configuration-axes-values',
                            text: 'Werte',
                            border: true,
                            showFunction: true,
                            showFilter: false,
                            store: {

                                type: 'json',
                                model: 'Tualo.reportStatistics.lazy.model.AxisModel',
                                reader: {
                                    type: 'json',
                                    rootProperty: 'data'
                                }
                            }
                            // showNumberFilter: true
                        }
                    ],
                }
            ]
        }
    ]
});
