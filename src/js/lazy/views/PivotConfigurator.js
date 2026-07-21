Ext.define('Tualo.reportStatistics.lazy.views.PivotConfigurator', {
    extend: 'Ext.Panel',
    requires: [
        'Tualo.reportStatistics.lazy.controller.PivotConfigurator',
        'Tualo.reportStatistics.lazy.models.PivotConfigurator',
        'Tualo.reportStatistics.lazy.controlls.RemotePivotGrid',
        'Ext.grid.plugin.Exporter'
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
            xtype: 'panel',
            layout: 'fit',
            itemId: 'tualo-report-statistics-remote-pivotgrid-frame',
            title: 'Auswertung',
            tbar: [
                {
                    xtype: 'label',
                    text: 'Zeitraum: '
                },
                {
                    xtype: 'combobox',
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'id',
                    bind: {
                        value: '{datetype}',
                        store: '{datetypes}'
                    },


                }, {
                    xtype: 'datefield',
                    bind: {
                        value: '{startdate}'
                    },
                    format: 'd.m.Y'
                },
                '-', {
                    xtype: 'datefield',
                    bind: {
                        value: '{stopdate}'
                    },
                    format: 'd.m.Y'
                },
                '-',
                {
                    text: 'Aktualisieren',
                    handler: 'onUpdate'
                },
                '->',
                {
                    text: 'Excel',
                    handler: 'exportTo',
                    cfg: {
                        type: 'excel07',
                        ext: 'xlsx'
                    },
                    /*
                    handler: function () {
                        Ext.MessageBox.wait('Bitte warten ...');
                        //console.log(11);
                        //console.log(this.grid._data_columns);
                        var cols = this.grid.reconfigureRenderer(this.grid._data_columns);
                        var data = this.grid.getData();
                        var p = {
                            temporaryName: this.queryParams.temporaryName,
                            datetype: this.datetype.getValue(),
                            startdate: this.startdate.getValue(),
                            stopdate: this.stopdate.getValue(),
                            title: (this.vorlageName) ? this.vorlageName : '',
                            cols: Ext.JSON.encode(cols)
                        };
                        Ext.Ajax.request({
                            timeout: 600000,
                            url: url + '&sid=' + sid + '&cmp=' + cmp + '&TEMPLATE=NO&p=ajax/export',
                            params: p,
                            success: function (response) {
                                Ext.MessageBox.hide();
                                //alert(response.responseText);
                                var o = Ext.JSON.decode(response.responseText);
                                if (o.success) {
                                    //alert(o.file);
                                    notify_download(o.file);
                                }
                            },
                            failure: function () {
                                Ext.MessageBox.hide();
                                Ext.MessageBox.alert('Fehler', 'Die Anfrage konnte vom Server nicht bearbeitet werden');
                            }
                        });
                    }*/
                },
                {
                    text: 'Tab-Stopp-Datei',
                    handler: 'exportTo',
                    cfg: {
                        type: 'tsv',
                        ext: 'csv'
                    },
                    /*
                    handler: function () {
                        Ext.MessageBox.wait('Bitte warten ...');
                        //console.log(11);
                        //console.log(this.grid._data_columns);
                        var cols = this.grid.reconfigureRenderer(this.grid._data_columns);
                        var data = this.grid.getData();
                        var p = {
                            datetype: this.datetype.getValue(),
                            temporaryName: this.queryParams.temporaryName,
                            startdate: this.startdate.getValue(),
                            stopdate: this.stopdate.getValue(),
                            title: (this.vorlageName) ? this.vorlageName : '',
                            cols: Ext.JSON.encode(cols)
                        };
                        Ext.Ajax.request({
                            timeout: 600000,
                            url: url + '&sid=' + sid + '&cmp=' + cmp + '&TEMPLATE=NO&p=ajax/export.tab',
                            params: p,
                            success: function (response) {
                                Ext.MessageBox.hide();
                                //alert(response.responseText);
                                var o = Ext.JSON.decode(response.responseText);
                                if (o.success) {
                                    //alert(o.file);
                                    notify_download(o.file);
                                }
                            },
                            failure: function () {
                                Ext.MessageBox.hide();
                                Ext.MessageBox.alert('Fehler', 'Die Anfrage konnte vom Server nicht bearbeitet werden');
                            }
                        });
                    }
                        */
                },
                {
                    text: 'Vorlage',
                    scope: this,
                    // hidden: ((typeof request['locked'] !== 'undefined') && (request['locked'] == '1')),
                    handler: function () {

                        var wnd = Ext.create('Ext.cmp.cmp_rn_statistik.PreConfigWindow', {
                            width: Ext.getBody().getWidth() * 0.8,
                            height: Ext.getBody().getHeight() * 0.8,
                            parent: this
                        });
                        wnd.show();
                        wnd.load(vorlageid);

                    }
                }
            ],
            items: [

                {
                    itemId: 'tualo-report-statistics-remote-pivotgrid',
                    xtype: 'tualo-report-statistics-remote-pivotgrid',
                    title: 'Auswertung',
                    listeners: {
                        beforeQueryTableparts: 'beforeQueryTableparts'
                    }
                }
            ]
        }
    ]
});