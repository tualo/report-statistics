Ext.define('Tualo.reportStatistics.lazy.models.PivotConfigurator', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.tualo-reportstatistics-pivotconfigurator',
    requires: [
        'Tualo.reportStatistics.lazy.model.Preset'
    ],
    data: {
        vorlage: -1,
        vorlageName: null,
        startdate: (new Date()).getDate() == 1 ? (new Date()) : new Date((new Date()).getFullYear(), (new Date()).getMonth(), 1),
        stopdate: new Date(),
        datetype: 'buchungsdatum',
        preset: null,
    },
    formulas: {
        title: function (get) {
            let title = '';
            let datetype = get('datetype');
            let startdate = get('startdate');
            let stopdate = get('stopdate');
            let vorlageName = get('vorlageName');
            if (vorlageName) {
                title += vorlageName + ' - ';
            }
            if (datetype == 'belegdatum') {
                title += 'Belegdatum';
            } else if (datetype == 'buchungsdatum') {
                title += 'Buchungsdatum';
            } else if (datetype == 'zeitraum_bis') {
                title += 'Zeitraum bis';
            }
            title += ': ';
            title += Ext.util.Format.date(startdate, 'd.m.Y');
            title += ' - ';
            title += Ext.util.Format.date(stopdate, 'd.m.Y');
            return title;
        }
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
    }
});