Ext.define('Tualo.reportStatistics.lazy.controlls.PivotGridFunctionAverage', {
	extend: 'Tualo.reportStatistics.lazy.controlls.PivotGridFunction',
	alias: 'pivotfunction.average',
	value: 0,
	count: 0,
	titleTemplate: 'Durchschnitt ({text})',
	calculate: function (value) {
		this.value += value;
		this.count += 1;
	},
	getValue: function () {
		return this.value / this.count;
	}
});