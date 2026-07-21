Ext.define('Tualo.reportStatistics.lazy.controlls.DateFormulaField', {
    extend: 'Ext.form.field.Text',
    alias: ['widget.dateformula'],
    value: 'current,0,day',
    initComponent: function () {
        var me = this;
        this.xid = Ext.id();

        me.configstore = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data: [
                { "id": "current", "name": "aktueller Tag" },
                { "id": "fdiw", "name": "erster der Woche" },
                { "id": "fdim", "name": "erster des Monats" },
                { "id": "fdiq", "name": "erster des Quartals" },
                { "id": "fdiy", "name": "erster des Jahres" },
                { "id": "ldiw", "name": "letzter der Woche" },
                { "id": "ldim", "name": "letzter des Monats" },
                { "id": "ldiq", "name": "letzter des Quartals" },
                { "id": "ldiy", "name": "letzter des Jahres" }
            ]
        })

        me.configfuncstore = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data: [
                { "id": "day", "name": "Tag/ Tage" },
                { "id": "month", "name": "Monat/ Monate" },
                { "id": "year", "name": "Jahr/ Jahre" }
            ]
        })

        this.callParent(arguments);
        me.on('change', function () { var me = this; me.renderValue(); }, this);
    },
    onRender: function () {
        var me = this;
        me.callParent(arguments);
        me.renderValue();

        var btn = Ext.getDom(me.id + '-triggerBtn');
        btn.onclick = function (scp) { return function () { scp.onBtnClick.call(scp) } }(this);
    },
    renderValue: function () {
        var me = this;
        var val = me.getValue();
        var vals = val.split(',');
        if (vals.length == 3) {
            Ext.getDom(me.id + '-renderFld').innerHTML = me.configstore.getById(vals[0]).get('name') + ' addiere ' + vals[1] + ' ' + me.configfuncstore.getById(vals[2]).get('name');
        }
    },
    onBtnClick: function () {
        var me = this;
        var wnd = me.getConfigWindow();
        if (wnd.isHidden()) {
            var val = me.getValue();
            var vals = val.split(',');
            if (vals.length == 3) {
                wnd.getForm().setValues({
                    start: vals[0],
                    count: vals[1],
                    change: vals[2]
                })
            }

            wnd.show();
        } else {
            wnd.hide();
        }
    },
    getConfigWindow: function () {
        var me = this;
        if (typeof me.configWindow == 'undefined') {
            me.configWindow = Ext.create('Ext.form.Panel', {
                //renderTo: me.id + '-triggerBtn',

                bbar: [
                    '->',
                    {
                        scope: this,
                        text: 'OK',
                        handler: function () {
                            var me = this;
                            var vals = me.configWindow.getForm().getValues();
                            me.setValue(vals.start + ',' + vals.count + ',' + vals.change);
                            //console.log(Ext.getDom(me.id + '-renderFld'));
                            me.renderValue();
                            me.configWindow.hide();
                        }
                    }
                ],
                bodyPadding: 5,
                hidden: true,
                listeners: {
                    scope: this,
                    blur: function () {
                        //console.log('blured');
                    }
                },
                floating: true,
                width: me.getWidth(),
                height: 200,
                x: me.getEl().getX(),
                y: me.getEl().getY() + me.getHeight(),
                layout: 'anchor',
                defaults: {
                    anchor: '100%'
                },
                items: [
                    {
                        xtype: 'combobox',
                        fieldLabel: 'Ausgangsdatum',
                        store: me.configstore,
                        displayField: 'name',
                        valueField: 'id',
                        value: 'current',
                        name: 'start'
                    },
                    {
                        xtype: 'combobox',
                        fieldLabel: 'Ver&auml;nderung',
                        store: me.configfuncstore,
                        displayField: 'name',
                        valueField: 'id',
                        value: 'day',
                        name: 'change'
                    },
                    {
                        xtype: 'numberfield',
                        fieldLabel: 'Anzahl',
                        name: 'count',
                        value: 0
                    }
                ]
            });

        }
        return me.configWindow;
    },
    getSubTplMarkup: function (values) {
        var me = this;
        var childElCls = values.childElCls; // either '' or ' x-foo'
        var field = me.callParent(arguments);
        var button = '<button id="' + me.id + '-triggerBtn"><i class="fa-solid fa-clipboard-prescription"></i></button>';
        return [
            '<table width="100%" cellpadding="0" cellspacing="0">',
            '<tr>',
            '<td id="' + me.id + '-renderFld" style="font-size:0.99em;">',
            '&nbsp;',
            '</td>',
            '<td width="20">',
            button,
            '</td>',
            '</tr>',
            '</table>' + '<div style="display:none">' + field + '</div>'
        ].join('');
    }
})