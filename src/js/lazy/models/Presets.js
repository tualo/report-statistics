Ext.define('Tualo.reportStatistics.lazy.models.Presets', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.tualo_reportstatistics_presets',
    requires: [
        //  'Tualo.reportStatistics.lazy.controlls.PivotGridAxisModel',
        //  'Tualo.reportStatistics.lazy.controlls.models.PivotGridFilters'
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
                    totalProperty: 'total',
                    listeners: {
                        scope: this
                    }
                }
            }
        },
        presets: {
            pageSize: 25000,
            autoLoad: true,
            fields: [{
                dataIndex: 'id',
                name: 'id'
            }, {
                dataIndex: 'name',
                name: 'name'
            }, {
                dataIndex: 'datetype',
                name: 'datetype'
            }, {
                dataIndex: 'datefrom',
                name: 'datefrom'
            }, {
                dataIndex: 'dateuntil',
                name: 'dateuntil'
            }, {
                dataIndex: 'description',
                name: 'description'
            }, {
                dataIndex: 'tz',
                name: 'tz'
            }, {
                dataIndex: 'tz_data',
                name: 'tz_data',
                convert: function (value, record) {
                    console.log('tz_data', record.get('tz'), record);
                    if (record.get('tz')) {
                        return record.get('tz').toLowerCase().split(',');
                    } else {
                        return [];
                    }
                }
            }],
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