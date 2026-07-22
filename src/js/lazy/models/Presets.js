Ext.define('Tualo.reportStatistics.lazy.models.Presets', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.tualo_reportstatistics_presets',
    requires: [
        'Tualo.reportStatistics.lazy.model.Preset'
    ],
    data: {
        documentId: null,
        tablename: null,
        record: null
    },
    formulas: {

    },
    stores: {

        datetypes: {
            fields: ['id', 'name'],
            data: [
                { "id": "belegdatum", "name": "Belegdatum" },
                { "id": "buchungsdatum", "name": "Buchungsdatum" },
                { "id": "zeitraum_bis", "name": "Zeitraum bis" }
            ]
        },
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
                    totalProperty: 'total'
                }
            },
            listeners: {
                load: 'onReportTypesLoad'
            }
        },
        presets: {
            pageSize: 25000,
            autoLoad: true,
            model: 'Tualo.reportStatistics.lazy.model.Preset',

            proxy: {
                type: 'ajax',
                actionMethods: {
                    create: 'POST',
                    read: 'GET',
                    update: 'PATCH',
                    destroy: 'DELETE'
                },
                timeout: 600000,
                url: './report-statistics/presets',
                reader: {
                    type: 'json',
                    rootProperty: 'data',
                    totalProperty: 'total',

                }
            },
            listeners: {
                load: 'onPresetsLoad'
            }
        }
    }
});