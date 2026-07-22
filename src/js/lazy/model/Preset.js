Ext.define('Tualo.reportStatistics.lazy.model.Preset', {
    extend: 'Ext.data.Model',
    clientIdProperty: '__clientid',
    proxy: {
        type: 'ajax',
        actionMethods: {
            create: 'POST',
            read: 'GET',
            update: 'PATCH',
            destroy: 'DELETE'
        },
        timeout: 600000,
        url: './report-statistics/presets',
        reader: {
            type: 'json',
            rootProperty: 'data',
            totalProperty: 'total',

        }
    },
    fields: [{
        dataIndex: 'id',
        type: 'int',
    }, {
        dataIndex: 'name',
        type: 'string',
    }, {
        dataIndex: 'datetype',
        type: 'string'
    }, {
        dataIndex: 'datefrom',
        type: 'string',
        convert: function (value, record) {
            if (Ext.isEmpty(value)) {
                return 'current,-7,day';
            }
            return value;
        }
    }, {
        dataIndex: 'dateuntil',

        type: 'string',
        convert: function (value, record) {
            if (Ext.isEmpty(value)) {
                return 'current,0,day';
            }
            return value;
        }
    }, {
        dataIndex: 'description',
        type: 'string',
        convert: function (value, record) {
            if (Ext.isEmpty(value)) {
                return '';
            }
            return value;
        }
    }, {
        dataIndex: 'tz',
        type: 'string',
        convert: function (value, record) {
            if (Ext.isEmpty(value)) {
                return '';
            }
            return value;
        }
    }, {
        dataIndex: 'axis',
        name: 'axis'
    }, {
        dataIndex: 'tz_data',
        name: 'tz_data',
        convert: function (value, record) {
            console.log('tz_data', record.data.tz, record);
            if (record.data.tz) {
                return record.data.tz.toLowerCase().split(',');
            } else {
                return [];
            }
        }
    }],
})