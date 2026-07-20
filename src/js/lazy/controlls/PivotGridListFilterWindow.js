Ext.define('Tualo.reportStatistics.lazy.controlls.PivotGridListFilterWindow', {
  alternativeClassName: 'Ext.tualo.PivotGridListFilterWindow',
  extend: 'Ext.tree.Panel',
  anchor: '100%',
  floating: true,
  rootVisible: false,
  getValue: function () {

    var root = this.getStore().getRootNode();
    var r = this.getCheckedChilds(root);
    return r;
  },
  getCheckedChilds: function (node) {
    var result = [];
    var me = this;
    node.eachChild(function (item) {
      if (item.get("leaf")) {
        if (item.get("checked")) {
          result.push(item.get("text"));
        }
      } else {
        result = result.concat(me.getCheckedChilds(item));
      }
    })
    return result;
  },


  queryDistincts: async function (record) {
    var me = this,
      queryObject = {
        table: record.get('table'),
        dataIndex: record.get('dataIndex')
      };

    if (me.fireEvent('beforeQueryTableparts', queryObject) !== false) {
      console.log('queryDistincts', queryObject);
      let response = await fetch('./report-statistics/distincts', {
        method: 'POST',
        body: JSON.stringify(queryObject)
      });
      let json = await response.json();
      var columnsDefinition = json.data;
      var chlds = [];
      var hash = {};
      for (var i in columnsDefinition) {
        if ((typeof columnsDefinition[i].treevalue != 'undefined') || (columnsDefinition[i].treevalue == '')) {
          if (typeof hash[columnsDefinition[i].treevalue] == 'undefined') {
            hash[columnsDefinition[i].treevalue] = chlds.length;

            chlds.push({
              text: columnsDefinition[i].treevalue,
              leaf: false,
              children: [],
              checked: false
            });

          }

          chlds[hash[columnsDefinition[i].treevalue]].children.push({
            text: columnsDefinition[i].value,
            leaf: true,
            checked: false
          });

        } else {
          chlds.push({
            text: columnsDefinition[i].value,
            leaf: true,
            checked: false
          });
        }
      }

      this.store.setRoot({
        text: 'Alle/ Keine',
        expanded: true,
        children: chlds
      });
    }
  },
  constructor: function (config) {
    var me = this,
      record = config.record,
      text = '',
      chlds = [],
      hash = {},
      vals = [],
      filter = config.record.get('filter');

    //console.log(config.record.get('dataIndex'),vals);
    if (typeof config.listeners === 'undefined') {
      config.listeners = {};

    }
    config.listeners.scope = this;
    config.listeners.checkchange = function (node, checked, eOpts) {
      var me = this;

      if (checked) {
        me.checkItemsUp(node, checked)
      }

      node.eachChild(function (item) {
        item.set('checked', checked);
      });
      // ToDo. check up to root
    }

    console.log(config.record);

    /*
    config.grid.getDistinct(config.record.get('dataIndex'), [], true, function (vals) {

      if (typeof filter == 'undefined') {
        filter = [];
      }
      

      for (var i in vals) {
        if ((typeof record.get('renderer') !== 'undefined') && (typeof record.get('renderer').call == 'function')) {
          text = record.get('renderer').call(me, vals[i].value);

        } else {
          text = vals[i].value;
        }
        if (typeof vals[i].treeValue != 'undefined') {
          if (typeof hash[vals[i].treeValue] == 'undefined') {
            hash[vals[i].treeValue] = chlds.length;

            chlds.push({
              text: vals[i].treeValue,
              leaf: false,
              children: [],
              checked: filter.indexOf(vals[i].value) == -1 ? (filter.length == 0 ? true : false) : true
            });

          }

          chlds[hash[vals[i].treeValue]].children.push({
            text: text,
            leaf: true,
            checked: filter.indexOf(vals[i].value) == -1 ? (filter.length == 0 ? true : false) : true
          });

        } else {
          chlds.push({
            text: text,
            leaf: true,
            checked: filter.indexOf(vals[i].value) == -1 ? (filter.length == 0 ? true : false) : true
          });
        }
      }

      var store = Ext.create('Ext.data.TreeStore', {
        root: {
          text: 'Alle/ Keine',
          expanded: true,
          children: chlds
        }
      });
      me.bindStore(store);

    })

    */

    config.store = Ext.create('Ext.data.TreeStore', {
      root: {
        text: 'Alle/ Keine',
        expanded: true,
        children: chlds
      }
    });
    this.callParent([config]);
    this.queryDistincts(record);
  },

  unOrSelectAll: function () {
    var me = this;
    var node = me.getStore().getRootNode();
    var set = false;
    if (node.childNodes.length > 0) {
      if (node.childNodes[0].get('checked')) {
        set = false;
      } else {
        set = true;
      }

    }
    me.checkItemsDown(node, set);
    /*
    node.eachChild( function(item){
      item.set('checked',set);

    });
    */
  },
  checkItemsUp: function (node, checked) {
    if (node.parentNode !== null) {
      node.parentNode.set('checked', checked);
      this.checkItemsUp(node.parentNode, checked);
    }
  },
  checkItemsDown: function (node, checked) {
    var me = this;
    node.eachChild(function (item) {
      item.set('checked', checked);
      me.checkItemsDown(item, checked);
    });
  },
  initComponent: function () {



    this.callParent(arguments);
  }
})
