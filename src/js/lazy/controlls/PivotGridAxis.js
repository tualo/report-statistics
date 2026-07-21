Ext.define('Tualo.reportStatistics.lazy.controlls.PivotGridAxis', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.tualo-reportstatistics-pivotgridaxis',
  requires: [
    'Ext.tree.Panel',
    'Tualo.reportStatistics.lazy.controlls.PivotGridListFilterWindow',
    'Tualo.reportStatistics.lazy.controlls.PivotGridListFilterWindow',
    'Tualo.reportStatistics.lazy.controlls.PivotGridListFunctionWindow',
    'Tualo.reportStatistics.lazy.controlls.PivotGridNumberFilterWindow'
  ],

  flex: 1,

  selectText: 'ausw&auml;hlen',
  unselectText: 'aufheben',
  unfilteredText: '<span style="opacity:0.4">Ungefiltert</span>',
  applyFilterText: 'Anwenden',
  clearFilterText: 'nicht Filtern',
  cancelFilterText: 'Abbrechen',

  constructor: function (config) {
    config.columns = [
      {
        text: config.text,
        dataIndex: 'text',
        flex: 1
      },
      {
        text: (config.textFunction) ? config.textFunction : 'Funktion',
        dataIndex: 'pivotFunction',
        flex: 1,
        hidden: (config.showFunction) ? !config.showFunction : true,
        renderer: function (v, m, rec) {
          try {
            var c = Ext.create(v, {});
            return c.titleTemplate.replace('{text}', rec.get('text'));
          } catch (e) {
            return v;
          }
        }
      },
      {
        text: (config.textFilter) ? config.textFilter : 'Filter',
        dataIndex: 'filter',
        flex: 1,
        hidden: (config.showFilter) ? !config.showFilter : true,
        renderer: function (v) {
          if (typeof v == 'undefined') {
            return this.unfilteredText;
          } else {
            return (v.length == 0) ? this.unfilteredText : v;
          }
        }
      },
      {
        text: (config.textFilter) ? config.textFilter : 'Filter',
        dataIndex: 'number_filter', flex: 1,
        hidden: (config.showNumberFilter) ? !config.showNumberFilter : true,
        renderer: function (v) {
          if (typeof v == 'undefined') {
            return this.unfilteredText;
          } else {
            var txt = [];
            if (typeof v.equal === 'number') {
              txt.push("= " + v.equal);
            }

            if (typeof v.smaller === 'number') {
              txt.push("&lt; " + v.smaller);
            }

            if (typeof v.greater === 'number') {
              txt.push("&gt; " + v.greater);
            }
            return txt.join(' und ');
          }
        }
      }
    ];
    this.showFunction = (config.showFunction) ? config.showFunction : false;
    this.showFilter = (config.showFilter) ? config.showFilter : false;
    this.showNumberFilter = (config.showNumberFilter) ? config.showNumberFilter : false;
    this.callParent([config]);
  },

  initComponent: function () {
    this.viewConfig = {
      plugins: {
        ptype: 'gridviewdragdrop',
        dragGroup: this.xid + '-Columns',
        dropGroup: this.xid + '-Columns'
      },
      listeners: {
        scope: this,
        beforedrop: this.onBeforeDrop,
        drop: this.onDropped,
        //itemdblclick: this.onItemdblclick,
        celldblclick: this.onCelldblclick
      }
    }
    this.callParent(arguments);
    this.on('render', function () {
      //this.getStore().sort('text', 'ASC');
    }, this);
    //console.log(this.model,this.getStore().getRange());
  },
  onCelldblclick: function (gr, td, cellIndex, record, tr, rowIndex, e, eOpts) {
    //onItemdblclick: function(th,record,item,index,e,eOpts){
    var me = this;
    var c = 0;

    /*
    console.log('dblclick', gr, td, cellIndex, record, tr, rowIndex, e, eOpts);
    // finding the pivot-grid
    while ((typeof o._pvtGrid == 'undefined') && (c < 20)) {
      o = o.up();
      c++;
    }

    if (typeof o._pvtGrid != 'undefined') {
      grid = o;
      */

    if (me.showFunction || me.showFilter || me.showNumberFilter) {
      var chlds = [],
        filter = [],
        hash = {},
        type = "",
        title = "";



      clickedIndex = gr.getHeaderCt().getHeaderAtIndex(cellIndex).dataIndex;
      switch (clickedIndex) {
        case "number_filter":
          type = 'Tualo.reportStatistics.lazy.controlls.PivotGridNumberFilterWindow';
          title = "Werte-Filter";
          break;
        case "pivotFunction":
          type = 'Tualo.reportStatistics.lazy.controlls.PivotGridListFunctionWindow';
          title = "Funktionen";
          break;
        case "filter":
          type = 'Tualo.reportStatistics.lazy.controlls.PivotGridListFilterWindow';
          title = "Filter";
          break;
        default:
          type = 'Tualo.reportStatistics.lazy.controlls.PivotGridListFilterWindow';
          title = "Filter";
      }

      me.configWindow = Ext.create(type, {
        title: title,
        width: me.getWidth() * 0.99,
        height: me.getHeight() * 0.99,
        x: me.getEl().getX() + me.getWidth() * 0.005,
        y: me.getEl().getY() + me.getHeight() * 0.005,
        record: record,
        listeners: {
          scope: me,
          beforeQueryTableparts: function (queryObject) {
            me.fireEvent('beforeQueryTableparts', queryObject);
          }
        },
        // grid: grid,
        tbar: [
          {
            scope: me,
            hidden: (!me.showFilter) && (!me.showNumberFilter),
            text: me.unselectText + '/' + me.selectText,
            handler: function () {


              if (type == 'Tualo.reportStatistics.lazy.controlls.PivotGridListFilterWindow') {
                //me.configWindow.record.set('filter',[]);
                me.configWindow.unOrSelectAll();
              }
              if (type == 'Tualo.reportStatistics.lazy.controlls.PivotGridNumberFilterWindow') {
                //me.configWindow.record.set('number_filter',{});
              }
              //me.configWindow.hide();

              //Ext.destroy(me.configWindow);
              //me.fireEvent('changed',[me]);

            }
          }

        ],
        bbar: [

          {
            scope: me,
            hidden: (!me.showFilter) && (!me.showNumberFilter),
            text: me.clearFilterText,
            handler: function () {
              if (type == 'Tualo.reportStatistics.lazy.controlls.PivotGridListFilterWindow') {
                me.configWindow.record.set('filter', []);
              }
              if (type == 'Tualo.reportStatistics.lazy.controlls.PivotGridNumberFilterWindow') {
                me.configWindow.record.set('number_filter', {});
              }
              me.configWindow.hide();

              Ext.destroy(me.configWindow);
              me.fireEvent('changed', [me]);

            }
          },
          {
            scope: me,
            //hidden: !me.showFilter,
            text: me.cancelFilterText,
            handler: function () {
              me.configWindow.hide();
              Ext.destroy(me.configWindow);
              me.fireEvent('changed', [me]);
            }
          },
          '->',
          {
            scope: me,
            text: me.applyFilterText,
            handler: function () {
              //console.log("**",type);

              if (type == 'Tualo.reportStatistics.lazy.controlls.PivotGridListFilterWindow') {
                me.configWindow.record.set('filter', []);
              }
              if (type == 'Tualo.reportStatistics.lazy.controlls.PivotGridNumberFilterWindow') {
                me.configWindow.record.set('number_filter', {});
              }

              if (type == 'Tualo.reportStatistics.lazy.controlls.PivotGridListFilterWindow') {
                //console.log('***',me.configWindow.getValue());
                record.set('filter', me.configWindow.getValue());
              }
              if (type == 'Tualo.reportStatistics.lazy.controlls.PivotGridNumberFilterWindow') {
                record.set('number_filter', me.configWindow.getValue());
              }
              if (type == 'Tualo.reportStatistics.lazy.controlls.PivotGridListFunctionWindow') {
                record.set('pivotFunction', me.configWindow.getValue());
              }

              me.configWindow.hide();
              Ext.destroy(me.configWindow);
            }
          }
        ]
      });
      me.configWindow.show();

    }
  },
  onBeforeDrop: function (node, data, overModel, dropPosition, dropHandlers, eOpts) {
    return this.fireEvent('beforedrop', [node, data, overModel, dropPosition, dropHandlers, eOpts]);
  },
  onDropped: function (node, data, dropRec, dropPosition) {
    var dropOn = dropRec ? ' ' + dropPosition + ' ' + dropRec.get('name') : ' on empty view';
    console.log('Dropped ' + data.records[0].get('text') + dropOn);
    if (this.fireEvent('drop', [node, data, dropRec, dropPosition])) {
      if (this.appendable !== true) {
        console.log('Appendable is false, so we remove the record from the source store');
      } else {
        console.log('Appendable is true, so we keep the record in the source store');
      }
      return this.fireEvent('changed', [this]);
    } else {
      return false;
    }
  }
});
