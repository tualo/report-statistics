Ext.define('Tualo.reportStatistics.lazy.controller.PivotPanel', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.tualo-reportstatistics-panel',

    onBoxReady: function () {

        this.getView().down('#pivotgrid').setVisible(true);
        this.getView().down('#waitpanel').setVisible(false);



    }
});
