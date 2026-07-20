Ext.define('Tualo.reportStatistics.lazy.controlls.PivotGridFunction', {
	value: 0,
	alias: 'pivotfunction.base',
	titleTemplate: '{text}',
	calculate: function (value) {
		this.value += value;
	},
	getValue: function () {
		return this.value;
	}
});