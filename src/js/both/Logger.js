Ext.define('Tualo.reportStatistics.Logger', {
    singleton: true,
    log: function () {
        if (typeof console != 'undefined') {
            // console.log.apply(console, arguments);
        }
    }
})