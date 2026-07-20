Ext.define('Tualo.reportStatistics.LazyLoader', {
    singleton: true,
    requires: [
        'Ext.Loader'
    ]
});
Ext.Loader.setPath('Tualo.reportStatistics.lazy', './jsreport-statistics');
