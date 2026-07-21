Ext.define('Tualo.reportStatistics.lazy.views.Presets', {
    extend: 'Ext.Panel',
    requires: [
        'Tualo.reportStatistics.lazy.controller.Presets',
        'Tualo.reportStatistics.lazy.models.Presets',
        'Tualo.reportStatistics.lazy.controlls.DateFormulaField'
    ],

    alias: 'widget.tualo_reportstatistics_presets',
    controller: 'tualo_reportstatistics_presets',
    viewModel: {
        type: 'tualo_reportstatistics_presets'
    },
    layout: {
        type: 'hbox',
        align: 'stretch',
    },
    title: 'Vorlagen',
    config: {
        documentId: null
    },
    applyDocumentId: function (id) {
        console.log('PivotPanel: Document ID applied to:', id);
        this.getViewModel().set('documentId', id);
        return id;
    },
    items: [
        {
            xtype: 'grid',
            itemId: 'presets-grid',
            flex: 0.7,
            columns: [
                { text: 'Name', dataIndex: 'name', flex: 1 }
            ],
            bind: {
                store: '{presets}',
                selection: '{record}'
            },
            listeners: {
                select: 'onPresetSelect'
            }
        }, {
            title: 'Aktuelle Berichtsvorlage',
            xtype: 'form',
            flex: 0.3,
            bbar: [
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
                            value: '{record.id}'
                        }
                    }, {
                        name: 'columnsconf',
                        xtype: 'hidden',
                        value: ''
                    }, {
                        name: 'rowsconf',
                        xtype: 'hidden',
                        value: ''
                    }, {
                        name: 'valuesconf',
                        xtype: 'hidden',
                        value: ''
                    }, {
                        fieldLabel: 'Name',
                        name: 'name',
                        // value: vorlagename
                        bind: {
                            value: '{record.name}'
                        }
                    }, {
                        fieldLabel: 'Beschreibung',
                        name: 'description',
                        xtype: 'textarea',
                        // value: vorlagebeschreibung
                        bind: {
                            value: '{record.description}'
                        }
                    }, {
                        xtype: 'tagfield',
                        fieldLabel: 'Belegarten',
                        bind: {
                            value: '{record.tz_data}',
                            store: '{reportTypes}'
                        },
                        displayField: 'name',
                        valueField: 'tabellenzusatz',
                        name: 'tz',
                        //  value: this.parent.blg.getTZ().join(',')
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
                                value: '{record.datetype}',
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
                                value: '{record.datefrom}'
                            }
                        }, {
                            fieldLabel: 'Datum bis',
                            name: 'dateuntil',
                            xtype: 'dateformula',
                            bind: {
                                value: '{record.dateuntil}'
                            },
                        }]
                }
            ]
        }
    ]

});