Ext.define('Tualo.reportStatistics.lazy.views.PivotConfigurator', {
    extend: 'Ext.Panel',
    requires: [
        'Tualo.reportStatistics.lazy.controller.PivotConfigurator',
        'Tualo.reportStatistics.lazy.models.PivotConfigurator',
        'Tualo.reportStatistics.lazy.controlls.RemotePivotGrid',
        'Tualo.reportStatistics.lazy.DateCalculator',
        'Tualo.reportStatistics.lazy.controlls.DateFormulaField',
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


    config: {
        documentId: null
    },

    applyDocumentId: function (id) {
        this.getViewModel().set('documentId', id);
        this.reorgPresets();
        return id;
    },

    updateDocumentId: function (id) {
        this.getViewModel().set('documentId', id);
        this.reorgPresets();
        return id;
    },

    _lastQueryTime: null,
    reorgPresets: function () {
        let me = this,
            vm = this.getViewModel(),
            documentId = vm.get('documentId'),
            preset = vm.get('preset');

        if ((!Ext.isEmpty(documentId)) && (documentId < 0)) {
            preset = Ext.create('Tualo.reportStatistics.lazy.model.Preset', {
                name: 'Neue Vorlage',
                datetype: 'buchungsdatum',
                datefrom: 'current,-7,day',
                dateuntil: 'current,0,day',
                description: '',
                tz: '',
                axis: {
                    rows: [],
                    columns: [],
                    values: []
                }
            });
            vm.set('preset', preset);

            me.setupPreset(preset);

        } else if (Ext.isEmpty(preset)) {
            preset = Ext.create('Tualo.reportStatistics.lazy.model.Preset', {
                id: documentId,
            });

            if ((this._lastQueryTime === null) || (Date.now() - this._lastQueryTime) > 1000) {
                this._lastQueryTime = Date.now();
                preset.load({
                    success: function (record, operation) {
                        console.log('Preset loaded for documentId:', documentId, record);
                        vm.set('preset', record);
                        me.setupPreset(record);
                    },
                    failure: function (record, operation) {
                        console.error('Failed to load preset for documentId:', documentId);
                    }
                });
            }
        }

        // vm.set('preset', preset);
        /*
        console.log('PivotConfigurator: Document ID reorgPresets:', documentId);
        if ((this._lastQueryTime === null) || (Date.now() - this._lastQueryTime) > 1000) {
            this._lastQueryTime = Date.now();
            console.log('PivotConfigurator: Document ID reorgPresets:', documentId);
            let fn = async () => {
                let response = await fetch('./report-statistics/presets/' + documentId);
                let data = await response.json();
                this.setupPreset(data.data);
            };
            fn();
        } else {
            console.log('PivotConfigurator: Document ID reorgPresets:', documentId, 'skipped due to throttling');
        }
            */

    },

    setupPreset: function (preset) {
        let vm = this.getViewModel(),
            reportTypes = vm.get('reportTypes'),
            documentId = vm.get('documentId'),
            pivotGrid = this.down('tualo-report-statistics-remote-pivotgrid');

        vm.set('vorlage', preset.get('id'));
        vm.set('vorlageName', preset.get('name'));
        vm.set('datetype', preset.get('datetype'));
        vm.set('startdate', Tualo.reportStatistics.lazy.DateCalculator.calculate(preset.get('datefrom')));
        vm.set('stopdate', Tualo.reportStatistics.lazy.DateCalculator.calculate(preset.get('dateuntil')));
        vm.set('description', preset.get('description'));
        vm.set('tz', preset.get('tz'));

        let tabellenzusaetze = preset.get('tz').split(',').map(function (item) {
            return item.trim().toLowerCase();
        });

        reportTypes.each(function (record) {
            if (tabellenzusaetze.indexOf(record.get('tabellenzusatz').toLowerCase()) >= 0) {
                record.set('checked', true);
            } else {
                record.set('checked', false);

            }
            record.commit();
        });

        pivotGrid.setAxisData('rows', preset.get('axis').rows);
        pivotGrid.setAxisData('columns', preset.get('axis').columns);
        pivotGrid.setAxisData('values', preset.get('axis').values);

    },
    bind: {
        title: '{title}'
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

                },
                {
                    text: 'Tab-Stopp-Datei',
                    handler: 'exportTo',
                    cfg: {
                        type: 'tsv',
                        ext: 'csv'
                    },
                },
                {
                    text: 'Vorlage',
                    // hidden: ((typeof request['locked'] !== 'undefined') && (request['locked'] == '1')),
                    handler: 'onOpenPreset'
                }
            ],
            items: [

                {
                    itemId: 'tualo-report-statistics-remote-pivotgrid',
                    xtype: 'tualo-report-statistics-remote-pivotgrid',
                    //title: 'Auswertung',
                    listeners: {
                        beforeQueryTableparts: 'beforeQueryTableparts'
                    }
                }
            ]
        }, {
            collapsible: true,
            region: 'east',
            split: true,
            width: 400,
            minWidth: 200,
            maxWidth: 400,
            collapsed: true,
            title: 'Berichtsvorlage',
            xtype: 'form',
            bbar: [
                {
                    text: 'Löschen',
                    handler: 'onDeletePreset'
                },
                {
                    text: 'Abbrechen',
                    handler: 'onCancelPreset'
                },
                '->',
                {
                    text: 'Speichern',
                    handler: 'onSavePreset'
                }
            ],
            items: [
                {
                    // Fieldset in Column 1 - collapsible via toggle button
                    xtype: 'fieldset',
                    columnWidth: 0.5,
                    title: 'Allgemein',
                    collapsible: false,
                    defaultType: 'textfield',
                    defaults: { anchor: '100%' },
                    layout: 'anchor',
                    items: [{
                        name: 'id',
                        xtype: 'hidden',
                        // value: vorlageid
                        bind: {
                            value: '{preset.id}'
                        }
                    }, {
                        fieldLabel: 'Name',
                        name: 'name',
                        // value: vorlagename
                        bind: {
                            value: '{preset.name}'
                        }
                    }, {
                        fieldLabel: 'Beschreibung',
                        name: 'description',
                        xtype: 'textarea',
                        // value: vorlagebeschreibung
                        bind: {
                            value: '{preset.description}'
                        }
                    }]
                },
                {
                    // Fieldset in Column 1 - collapsible via toggle button
                    xtype: 'fieldset',
                    columnWidth: 0.5,
                    title: 'Datum',
                    collapsible: false,
                    defaultType: 'textfield',
                    defaults: { anchor: '100%' },
                    layout: 'anchor',
                    items: [
                        {
                            fieldLabel: 'Datumsfeld',
                            queryMode: 'local',
                            displayField: 'name',
                            valueField: 'id',
                            bind: {
                                value: '{preset.datetype}',
                                store: '{datetypes}'
                            },
                            xtype: 'combobox',
                            name: 'datetype',
                            listeners: {
                                scope: this,
                                blur: function () {
                                    //this.grid.getStore().loadPage(1);
                                }
                            }
                        },
                        {
                            fieldLabel: 'Datum von',
                            name: 'datefrom',
                            xtype: 'dateformula',
                            bind: {
                                value: '{preset.datefrom}'
                            }
                        }, {
                            fieldLabel: 'Datum bis',
                            name: 'dateuntil',
                            xtype: 'dateformula',
                            bind: {
                                value: '{preset.dateuntil}'
                            },
                        }]
                }
            ]

        }
    ]
});