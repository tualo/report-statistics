Ext.define('Tualo.reportStatistics.lazy.model.AxisModel', {
	extend: 'Ext.data.Model',
	fields: [
		{ name: 'text', type: 'string' },
		{ name: 'dataIndex', type: 'string' },
		{ name: 'phprenderer', type: 'string' },
		{ name: 'pivotFunction', type: 'string' },
		{ name: 'align', type: 'string' },
		{ name: 'datafilter' },
		{ name: 'number_filter' },
		{ name: 'renderer' }
	]
});