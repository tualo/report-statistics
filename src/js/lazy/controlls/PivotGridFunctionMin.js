Ext.define('Tualo.reportStatistics.lazy.controlls.PivotGridFunctionMin', {
	extend: 'Tualo.reportStatistics.lazy.controlls.PivotGridFunction',
	alias: 'pivotfunction.min',
	alternativeClassName: 'Ext.tualo.PivotGridFunctionMin',
	value: null,
	titleTemplate: 'Minimum ({text})',
	calculate: function (value) {

		if (this.value == null) {
			this.value = value;
		} else {
			if (this.value > value) {
				this.value = value;
			}
		}
	},
	getValue: function () {
		return this.value;
	}
});