Ext.define('Tualo.reportStatistics.lazy.controlls.PivotGridFunctionSum', {
	extend: 'Tualo.reportStatistics.lazy.controlls.PivotGridFunction',
	alias: 'pivotfunction.sum',
	alternativeClassName: 'Ext.tualo.PivotGridFunctionSum',
	value: 0,
	titleTemplate: 'Summe ({text})',
	calculate: function (value) {
		this.value += value;
	},
	getValue: function () {
		return this.value;
	}
});