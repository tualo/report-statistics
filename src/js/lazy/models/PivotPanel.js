Ext.define('Tualo.reportStatistics.lazy.models.PivotPanel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.tualo-reportstatistics-panel',
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
            pageSize: 25000,
            // model: 'Tualo.reportStatistics.lazy.controlls.PivotGridAxisModel',
            proxy: {
                type: 'ajax',
                actionMethods: {
                    create: 'POST',
                    read: 'GET',
                    update: 'PATCH',
                    destroy: 'DELETE'
                },
                timeout: 600000,
                url: './report-pivot/aggregate',
                reader: {
                    type: 'json',
                    rootProperty: 'data',
                    totalProperty: 'total',
                    listeners: {
                        scope: this
                    }
                }
            }
        }


    }
});