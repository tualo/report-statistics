Ext.define('Tualo.reportStatistics.lazy.controlls.PivotGridFunctionMax', {
	extend: 'Tualo.reportStatistics.lazy.controlls.PivotGridFunction',
	alias: 'reportpivotfunction.max',
	alternativeClassName: 'Ext.tualo.PivotGridFunctionMax',
	value: null,
	titleTemplate: 'Maximum ({text})',
	calculate: function (value) {
		if (this.value == null) {
			this.value = value;
		} else {
			if (this.value < value) {
				this.value = value;
			}
		}
	},
	getValue: function () {
		return this.value;
	}
});