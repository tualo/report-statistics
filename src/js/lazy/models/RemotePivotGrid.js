Ext.define('Tualo.reportStatistics.lazy.models.RemotePivotGrid', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.tualo-report-statistics-remote-pivotgrid',
    requires: [
        //  'Tualo.reportStatistics.lazy.controlls.PivotGridAxisModel',
        //  'Tualo.reportStatistics.lazy.controlls.models.PivotGridFilters'
    ],
    data: {
        documentId: null,
        tablename: null
    },
    formulas: {

    },
    stores: {
        aggregate: {
            type: 'json',
            pageSize: 25000,
            proxy: {
                type: 'ajax',
                timeout: 600000,
                actionMethods: {
                    create: 'POST',
                    read: 'POST',
                    update: 'PATCH',
                    destroy: 'DELETE'
                },
                url: './report-statistics/aggregate',
                reader: {
                    type: 'json',
                    rootProperty: 'data',
                    totalProperty: 'total',
                }
            },
            listeners: {
                scope: 'controller',
                beforeload: 'onBeforeStoreLoad',
                load: 'onLoad',
                metachange: 'onMetaChanged',
            }
        }
    }
});
