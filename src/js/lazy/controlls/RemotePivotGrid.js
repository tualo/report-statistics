
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


    controller: 'tualo-report-statistics-remote-pivotgrid',
    viewModel: {
        type: 'tualo-report-statistics-remote-pivotgrid'

    },
    requires: [
        'Ext.grid.Panel',
        'Tualo.reportStatistics.lazy.controller.RemotePivotGrid',
        'Tualo.reportStatistics.lazy.models.RemotePivotGrid',
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
    onAxisChanged: function (grid, type) {
        let queryObject = {};
        queryObject.available = this.down('#pivotgrid-configuration-axes-available').getStore().getData().items.map(function (rec) {
            return rec.data;
        });
        queryObject.columns = this.down('#pivotgrid-configuration-axes-columns').getStore().getData().items.map(function (rec) {
            return rec.data;
        });
        queryObject.rows = this.down('#pivotgrid-configuration-axes-rows').getStore().getData().items.map(function (rec) {
            return rec.data;
        });
        queryObject.values = this.down('#pivotgrid-configuration-axes-values').getStore().getData().items.map(function (rec) {
            return rec.data;
        });

        if (type) {
            queryObject.changedType = type;
        }

        if (this.fireEvent('beforeQueryTableparts', queryObject)) {
            console.log('onAxisChanged', queryObject);
            this.getViewModel().getStore('aggregate').load({
                params: {
                    // available: JSON.stringify(queryObject.available),
                    columns: JSON.stringify(queryObject.columns),
                    rows: JSON.stringify(queryObject.rows),
                    values: JSON.stringify(queryObject.values)
                }
            });
        }
    },
    layout: 'border',
    items: [
        {
            xtype: 'grid',
            itemId: 'pivotgrid-grid',
            region: 'center',
            layout: 'fit',
            bind: {
                store: '{aggregate}',
            }

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
                                changed: function (grid) {
                                    this.up('tualo-report-statistics-remote-pivotgrid').onAxisChanged(grid, 'available');
                                },
                                beforeQueryTableparts: function (queryObject) {
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
                            listeners: {
                                changed: function (grid) {
                                    this.up('tualo-report-statistics-remote-pivotgrid').onAxisChanged(grid, 'columns');
                                },
                            },
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
                            listeners: {
                                changed: function (grid) {
                                    this.up('tualo-report-statistics-remote-pivotgrid').onAxisChanged(grid, 'rows');
                                },
                            },
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
                            listeners: {
                                changed: function (grid) {
                                    this.up('tualo-report-statistics-remote-pivotgrid').onAxisChanged(grid, 'values');
                                },
                            },
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
