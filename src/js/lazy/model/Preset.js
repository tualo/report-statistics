Ext.define('Tualo.reportStatistics.lazy.model.Preset', {
    extend: 'Ext.data.Model',
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
        name: 'id'
    }, {
        dataIndex: 'name',
        name: 'name'
    }, {
        dataIndex: 'datetype',
        name: 'datetype'
    }, {
        dataIndex: 'datefrom',
        name: 'datefrom'
    }, {
        dataIndex: 'dateuntil',
        name: 'dateuntil'
    }, {
        dataIndex: 'description',
        name: 'description'
    }, {
        dataIndex: 'tz',
        name: 'tz'
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