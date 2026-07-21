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
            },
            tbar: [
                {
                    xtype: 'label',
                    text: 'Zeitraum: '
                },
                this.datetype = Ext.create('Ext.form.field.ComboBox', {
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'id',
                    value: 'buchungsdatum',
                    // store: this.typestore,
                    listeners: {
                        scope: this,
                        blur: function () {
                            //this.grid.getStore().loadPage(1);
                        }
                    }
                }),
                this.startdate = Ext.create('Ext.form.field.Date', {
                    value: new Date(),
                    format: 'd.m.Y',
                    listeners: {
                        scope: this,
                        blur: function () {
                            //this.grid.getStore().loadPage(1);
                        }
                    }
                }),
                '-',
                this.stopdate = Ext.create('Ext.form.field.Date', {
                    value: new Date(),
                    format: 'd.m.Y',
                    listeners: {
                        scope: this,
                        blur: function () {

                        }
                    }
                }),
                '-',
                {
                    scope: this,
                    text: 'Aktualisieren',
                    handler: function () {
                        this.aggregateData();
                        //this.grid.getStore().loadPage(1);
                    }
                },
                '->',
                {
                    text: 'Excel',
                    scope: this,
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
                            cols: Ext.JSON.encode(cols)/*,
              data: Ext.JSON.encode(data)*/
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
                    }
                },
                {
                    text: 'Tab-Stopp-Datei',
                    scope: this,
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
                            cols: Ext.JSON.encode(cols)/*,
              data: Ext.JSON.encode(data)*/
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