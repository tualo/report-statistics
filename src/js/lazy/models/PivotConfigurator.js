Ext.define('Tualo.reportStatistics.lazy.models.PivotConfigurator', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.tualo-reportstatistics-pivotconfigurator',
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
        reportTypes: {
            pageSize: 25000,
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
                url: './report-statistics/report-types',
                reader: {
                    type: 'json',
                    rootProperty: 'data',
                    totalProperty: 'total',
                    listeners: {
                        scope: this
                    }
                }
            }
        },
    }
});