Ext.define('Tualo.reportStatistics.lazy.controller.RemotePivotGrid', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.tualo-report-statistics-remote-pivotgrid',

    onMetaChanged: function (pr, meta, eOpts) {
        console.log('onMetaChanged', meta);
        this.reconfigureColumns(meta.columns);

    },


    columnRendererMap: {}, //stores original column definition, for later adding renderer, align and so on
    headlineRendererMap: {}, //stores original column definition, for later adding renderer, align and so on


    reconfigureRenderer: function (columns) {
        //console.log(columns);
        for (var i in columns) {
            if (typeof this.headlineRendererMap[columns[i].dataIndex] !== 'undefined') {
                //columns[i].text = this.headlineRendererMap[columns[i].dataIndex](columns[i].text);
            }
            if (typeof this.columnRendererMap[columns[i].dataIndex] !== 'undefined') {
                columns[i].renderer = this.columnRendererMap[columns[i].dataIndex];
            }
            if (typeof columns[i].columns !== 'undefined') {
                columns[i].columns = this.reconfigureRenderer(columns[i].columns);
            }
        }
        return columns;
    },
    reconfigureColumns: function (columns) {
        var me = this.getView().getComponent('pivotgrid-grid');
        if (columns) {
            me.headerCt.removeAll();
            //console.log(this.columnRendererMap);
            columns = this.reconfigureRenderer(columns);
            //console.log(columns);
            me.headerCt.add(columns);
            // this._chartColumns = columns;
            //this.reconfigureAxes(columns);
            //this.chart.refresh();
        }
        me.getView().refresh();
    },

    onBeforeStoreLoad: function (store, option, eOpt) {
        console.log('onBeforeStoreLoad', store, option, eOpt);
        var params = option.getParams();
        if (typeof params === 'undefined') { params = {}; }
        try {
            console.log('beforeload', params);
            option.setParams(params);

        } catch (e) {

        }
        return true;


    },
    onLoad: function (store, records, successful, eOpts) {
        console.log('onLoad', store, records, successful, eOpts);
    }
});