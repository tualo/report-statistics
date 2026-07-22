
Ext.define('Tualo.reportStatistics.lazy.views.PivotPanel', {
    extend: 'Ext.Panel',
    requires: [
        'Tualo.reportStatistics.lazy.controller.PivotPanel',
        'Tualo.reportStatistics.lazy.models.PivotPanel',
        'Tualo.reportStatistics.lazy.views.PivotConfigurator'
    ],

    alias: 'widget.tualo-reportstatistics-panel',
    controller: 'tualo-reportstatistics-panel',
    viewModel: {
        type: 'tualo-reportstatistics-panel'
    },


    config: {
        documentId: null
    },
    onBoxReady: function () {

        Tualo.reportStatistics.Logger.log('onBoxReady', 'tualo-reportstatistics-panel');
        this.getController().onBoxReady();
    },

    applyDocumentId: function (id) {
        console.log('PivotPanel: Document ID applied to:', id);
        this.getViewModel().set('documentId', id);

        return id;
    },




    layout: 'fit',
    items: [
        {
            hidden: false,
            xtype: 'panel',
            itemId: 'waitpanel',
            layout: {
                type: 'vbox',
                align: 'center'
            },
            items: [
                {
                    xtype: 'component',
                    cls: 'lds-container',
                    html: '<div class="lds-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>'
                        + '<div><h3>Pivot wird erstellt</h3>'
                        + '<span>Einen Moment bitte ...</span></div>'
                }
            ]
        },
        {
            hidden: true,
            xtype: 'tualo-reportstatistics-pivotconfigurator',
            itemId: 'pivotgrid',
            bind: {
                documentId: '{documentId}'
            }
        }
    ],
    listeners: {
        boxready: 'onBoxReady'
    }
});