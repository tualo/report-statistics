Ext.define('Tualo.routes.reportStatistics.Viewer', {
    statics: {
        load: async function () {
            return [
                {
                    name: 'Bericht Statistik Viewer',
                    path: '#report-statistics(/:{id})'
                }
            ]
        }
    },
    url: 'report-statistics(/:{id})',
    handler: {

        action: function (values) {
            if (!values.id) values.id = 'current';
            Ext.getApplication().addView('Tualo.reportStatistics.lazy.views.PivotPanel', {
                documentId: values.id,
            });
        },
        before: function (values, action) {
            action.resume();

        },


    }
});

Ext.define('Tualo.routes.reportStatistics.Presets', {
    statics: {
        load: async function () {
            return [
                {
                    name: 'Bericht Statistik Presets',
                    path: '#report-statistics-presets(/:{id})'
                }
            ]
        }
    },
    url: 'report-statistics-presets(/:{id})',
    handler: {

        action: function (values) {
            if (!values.id) values.id = 'current';
            Ext.getApplication().addView('Tualo.reportStatistics.lazy.views.Presets', {
                documentId: values.id,
            });
        },
        before: function (values, action) {
            action.resume();

        },


    }
});