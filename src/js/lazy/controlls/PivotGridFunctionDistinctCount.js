Ext.define('Tualo.reportStatistics.lazy.controlls.PivotGridFunctionDistinctCount', {
  extend: 'Tualo.reportStatistics.lazy.controlls.PivotGridFunction',
  alias: 'pivotfunction.distinctcount',
  alternativeClassName: 'Ext.tualo.PivotGridFunctionDistinctCount',
  value: 0,
  titleTemplate: 'indiv. Anzahl ({text})',
  calculate: function (value) {
    this.value += 1;
  },
  getValue: function () {
    return this.value;
  }
});
