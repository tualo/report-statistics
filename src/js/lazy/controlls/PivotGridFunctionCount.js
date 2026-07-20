Ext.define('Tualo.reportStatistics.lazy.controlls.PivotGridFunctionCount', {
	extend: 'Tualo.reportStatistics.lazy.controlls.PivotGridFunction',
	alternativeClassName: 'Ext.tualo.PivotGridFunctionCount',
	alias: 'pivotfunction.count',
	value: 0,
	titleTemplate: 'Anzahl ({text})',
	calculate: function (value) {
		this.value += 1;
	},
	getValue: function () {
		return this.value;
	}
});