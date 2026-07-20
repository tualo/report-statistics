Ext.define('Tualo.reportStatistics.lazy.views.PivotConfigurator', {
    extend: 'Ext.Panel',
    requires: [
        'Tualo.reportStatistics.lazy.controller.PivotConfigurator',
        'Tualo.reportStatistics.lazy.models.PivotConfigurator',
        'Tualo.reportStatistics.lazy.controlls.RemotePivotGrid'
    ],

    alias: 'widget.tualo-reportstatistics-pivotconfigurator',
    controller: 'tualo-reportstatistics-pivotconfigurator',
    viewModel: {
        type: 'tualo-reportstatistics-pivotconfigurator'
    },

    layout: {
        type: 'border',
        align: 'stretch'
    },


    items: [
        {
            region: 'west',
            collapsible: true,
            split: true,
            width: 300,
            minWidth: 200,
            maxWidth: 400,
            xtype: 'grid',
            columns: [
                {
                    xtype: 'checkcolumn',
                    dataIndex: 'checked',
                    width: 50,
                    text: 'Auswahl'
                },
                {
                    text: 'Belegart',
                    dataIndex: 'name',
                    flex: 1
                }
            ],
            bind: {
                store: '{reportTypes}'
            },
            title: 'Belegarten',
        },
        {
            region: 'center',
            itemId: 'tualo-report-statistics-remote-pivotgrid',
            xtype: 'tualo-report-statistics-remote-pivotgrid',
            title: 'Auswertung',
            listeners: {
                beforeQueryTableparts: function (queryObject) {
                    queryObject.__seen_by_tualo_reportstatistics_pivotconfigurator = true;
                    let reportTypes = [];
                    this.up('tualo-reportstatistics-pivotconfigurator').getViewModel().getStore('reportTypes').each(function (rec) {
                        if (rec.get('checked')) {
                            reportTypes.push(rec.get('tabellenzusatz'));
                        }
                    });
                    if (reportTypes.length == 0) {
                        this.up('tualo-reportstatistics-pivotconfigurator').getViewModel().getStore('reportTypes').each(function (rec) {
                            reportTypes.push(rec.get('tabellenzusatz'));
                        });
                    }
                    queryObject.reportTypes = reportTypes;
                }
                // this.fireEvent('beforeQueryTableparts', queryObject);
            }
        },
        /*{
            region: 'east',
            collapsible: true,
            split: true,
            width: 300,
            minWidth: 200,
            maxWidth: 400,
            xtype: 'panel',
            title: 'Konfiguration',
        },*/
    ]
});