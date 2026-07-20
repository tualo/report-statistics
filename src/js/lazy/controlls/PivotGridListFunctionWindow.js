Ext.define('Tualo.reportStatistics.lazy.controlls.PivotGridListFunctionWindow', {
  alternativeClassName: 'Ext.tualo.PivotGridListFunctionWindow',
  extend: 'Ext.tree.Panel',
  anchor: '100%',
  floating: true,
  rootVisible: false,
  getValue: function () {
    var root = this.getStore().getRootNode();
    var selected_item = null;
    root.eachChild(function (item) {
      if (item.get("checked")) {
        selected_item = item.data.functionClassName;
      }
    }, this);
    return selected_item;
  },
  constructor: function (config) {
    var me = this,
      record = config.record,
      text = '',
      chlds = [];

    if (typeof config.listeners === 'undefined') {
      config.listeners = {};

    }
    config.listeners.scope = this;

    config.listeners.checkchange = function (node, checked, eOpts) {
      var me = this;
      var root = me.getStore().getRootNode();
      root.eachChild(function (item) {
        item.set('checked', false);
      });
      node.set('checked', true);
    }

    var allFunctions = Ext.ClassManager.getNamesByExpression('pivotfunction.*');
    var pv = record.get('pivotFunction');

    for (var x in allFunctions) {
      if (allFunctions[x] != 'pivotFunction.base') {
        var v = Ext.create(allFunctions[x], {});
        chlds.push({
          text: v.titleTemplate.replace('{text}', record.get('text')),
          functionClassName: allFunctions[x],
          leaf: true,
          checked: allFunctions[x] == pv
        });
      }
    }
    config.store = Ext.create('Ext.data.TreeStore', {
      root: {
        text: 'Alle/ Keine',
        expanded: true,
        children: chlds
      }
    });
    this.callParent([config]);
  },

  initComponent: function () {



    this.callParent(arguments);
  }
})
