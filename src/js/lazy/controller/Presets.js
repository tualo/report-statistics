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

    onReportTypesLoad: function (store, records, successful, operation, eOpts) {
        this.loadPreset();
    },
    onPresetsLoad: function (store, records, successful, operation, eOpts) {
        this.loadPreset();
    },

    loadPreset: function () {
        let vm = this.getViewModel(),
            view = this.getView(),
            store = vm.getStore('presets'),
            types = vm.getStore('reportTypes'),
            grid = view.getComponent('presets-grid');

        if (store.isLoading() || types.isLoading()) {
            console.log('Preset load skipped due to store loading');
            return;
        }

        if (!Ext.isEmpty(vm.get('documentId'))) {
            let record = store.findRecord('id', vm.get('documentId'));
            if (record) {
                if (!Ext.isEmpty(vm.get('axisData'))) {
                    record.set('axis', vm.get('axisData'));
                }
                if (!Ext.isEmpty(vm.get('reportTypes'))) {
                    // console.log('Setting reportTypes for preset ', record.get('tz'));
                    // record.set('tz', vm.get('reportTypes').join(','));
                }
                grid.getSelectionModel().select(record);
            }
        }
    },

    onSavePreset: function () {
        let vm = this.getViewModel(),
            record = vm.get('record');

        if (record) {
            record.save({
                success: function (rec, operation) {
                    console.log('Preset saved', rec, operation);
                    if (!Ext.isEmpty(vm.get('axisData'))) {
                        Ext.getApplication().showStage(Ext.getCmp(vm.get('parentId')));
                        Ext.getApplication().removeView(Ext.getCmp(this.getView().getId()));

                    } else {
                        Ext.History.back();
                    }
                },
                failure: function (rec, operation) {
                    console.error('Preset save failed', rec, operation);
                }
            });
        } else {
            console.warn('No preset selected to save');
        }
    },

    onCancelPreset: function () {
        let vm = this.getViewModel();

        if (!Ext.isEmpty(vm.get('axisData'))) {
            Ext.getApplication().showStage(Ext.getCmp(vm.get('parentId')));
            Ext.getApplication().removeView(Ext.getCmp(this.getView().getId()));

        } else {
            Ext.History.back();
        }
    },

    onDeletePreset: function () {
        let vm = this.getViewModel(),
            record = vm.get('record');

        if (record) {
            Ext.MessageBox.confirm('Löschen', 'Möchten Sie die Vorlage wirklich löschen?', function (btn) {
                if (btn === 'yes') {
                    this.deletePreset(record);
                }
            }, this);
        } else {
            console.warn('No preset selected to delete');
        }
    },

    deletePreset: function (record) {
        let vm = this.getViewModel();
        record.erase({
            success: function (rec, operation) {
                console.log('Preset deleted', rec, operation);
                vm.set('record', null);
            },
            failure: function (rec, operation) {
                console.error('Preset delete failed', rec, operation);
            }
        });
    }
});
