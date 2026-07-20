Ext.define('Tualo.reportStatistics.lazy.controlls.PivotGridNumberFilterWindow', {
  extend: 'Ext.form.Panel',
  anchor: '100%',
  floating: true,
  getValue: function () {
    var o = this.getForm().getValues();
    var r = {};
    for (var i in o) {
      if (o[i] != '') {
        r[i] = 1 * o[i];
      }
    }
    return r;
  },
  constructor: function (config) {
    var me = this,
      record = config.record,
      filter = config.record.get('number_filter');

    config.filter = filter;
    this.callParent([config]);
  },
  initComponent: function () {



    this.callParent(arguments);
    this.getForm().setValues(this.filter);
  },
  items: [
    {
      xtype: 'numberfield',
      name: 'smaller',
      fieldLabel: '&lt;',
      allowBlank: true,
      value: ""
    },
    {
      xtype: 'numberfield',
      name: 'greater',
      fieldLabel: '&gt;',
      allowBlank: true,
      value: ""
    },
    {
      xtype: 'numberfield',
      name: 'equal',
      fieldLabel: '=',
      allowBlank: true,
      value: ""
    }
  ]
});
