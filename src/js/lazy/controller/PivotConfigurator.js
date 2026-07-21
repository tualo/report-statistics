Ext.define('Tualo.reportStatistics.lazy.controller.PivotConfigurator', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.tualo-reportstatistics-pivotconfigurator',

    onUpdate: function () {
        console.log('onUpdate');
        let grid = this.getView().down('#tualo-report-statistics-remote-pivotgrid');
        grid.aggregateData();
    },


    exportTo: function (btn) {
        let vm = this.getView().getViewModel();
        let grid = this.getView().down('#tualo-report-statistics-remote-pivotgrid').down('#pivotgrid-grid');
        var cfg = Ext.merge({
            title: vm.get('title') || 'Export',
            fileName: (vm.get('title') || 'Export') + '.' + (btn.cfg.ext || btn.cfg.type)
        }, btn.cfg);

        grid.saveDocumentAs(cfg);
    },

    onBeforeDocumentSave: function (view) {
        this.timeStarted = Date.now();
        view.mask('Document is prepared for export. Please wait ...');
        Ext.log('export started');
    },

    onDocumentSave: function (view) {
        view.unmask();
        Ext.log('export finished; time passed = ' + (Date.now() - this.timeStarted));
    },

    beforeQueryTableparts: function (queryObject) {
        let vm = this.getView().getViewModel();

        let reportTypes = [];
        vm.getStore('reportTypes').each(function (rec) {
            if (rec.get('checked')) {
                reportTypes.push(rec.get('tabellenzusatz'));
            }
        });
        if (reportTypes.length == 0) {
            vm.getStore('reportTypes').each(function (rec) {
                reportTypes.push(rec.get('tabellenzusatz'));
            });
        }
        queryObject.dateType = vm.get('datetype');
        queryObject.startDate = Ext.util.Format.date(vm.get('startdate'), 'Y-m-d');
        queryObject.stopDate = Ext.util.Format.date(vm.get('stopdate'), 'Y-m-d');

        queryObject.reportTypes = reportTypes;

    }
});