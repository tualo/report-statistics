Ext.define('Tualo.reportStatistics.lazy.controller.Presets', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.tualo_reportstatistics_presets',

    onBoxReady: function () {
        console.log('onBoxReady', 'tualo_reportstatistics_presets');


    },

    onPresetSelect: function (grid, record, index, eOpts) {
        console.log('onPresetSelect', grid, record, index, eOpts);
        this.getViewModel().set('record', record);
    },
    onPresetsLoad: function (store, records, successful, operation, eOpts) {
        let vm = this.getViewModel(),
            view = this.getView(),
            grid = view.getComponent('presets-grid');

        if (!Ext.isEmpty(vm.get('documentId'))) {
            let record = store.findRecord('id', vm.get('documentId'));
            if (record) {
                grid.getSelectionModel().select(record);
            }
        }
        console.log('Presets loaded', store, records, successful, operation, eOpts);

    },
    onSavePreset: function () {
        let vm = this.getViewModel(),
            record = vm.get('record');

        if (record) {
            record.save({
                success: function (rec, operation) {
                    console.log('Preset saved', rec, operation);
                },
                failure: function (rec, operation) {
                    console.error('Preset save failed', rec, operation);
                }
            });
        } else {
            console.warn('No preset selected to save');
        }
    }
});
