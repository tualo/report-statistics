Ext.define('Tualo.reportStatistics.lazy.DateCalculator', {
    singleton: true,
    calculate: function (str) {
        var idate = new Date();
        var date = new Date();
        if (typeof str == 'undefined') {
            return date;
        }
        var vals = str.split(',');
        var type = vals[0];
        var step = vals[1];
        var steptype = vals[2];
        switch (type) {
            case 'fdiw':
                date = Ext.Date.add(date, Ext.Date.DAY, (-1 * (Ext.Date.format(idate, 'N') * 1 - 1)));
                break;
            case 'ldiw':
                date = Ext.Date.add(date, Ext.Date.DAY, (7 - (Ext.Date.format(idate, 'N') * 1)));
                break;
            case 'fdim':
                date = Ext.Date.getFirstDateOfMonth(idate);
                break;
            case 'ldim':
                date = Ext.Date.getLastDateOfMonth(idate);
                break;
            case 'fdiq':
                date = Ext.Date.getFirstDateOfMonth(idate);
                var mt = Ext.Date.format(idate, 'n') * 1;
                if (mt < 4) {
                    date = Ext.Date.parse(Ext.Date.format(idate, 'Y') + '-01-01', 'Y-m-d');
                } else if (mt < 7) {
                    date = Ext.Date.parse(Ext.Date.format(idate, 'Y') + '-04-01', 'Y-m-d');
                } else if (mt < 10) {
                    date = Ext.Date.parse(Ext.Date.format(idate, 'Y') + '-07-01', 'Y-m-d');
                } else { // erster Quartal
                    date = Ext.Date.parse(Ext.Date.format(idate, 'Y') + '-10-01', 'Y-m-d');
                }
                break;
            case 'ldiq':
                date = Ext.Date.getFirstDateOfMonth(idate);
                var mt = Ext.Date.format(idate, 'n') * 1;
                if (mt < 4) { // erster Quartal
                    date = Ext.Date.parse(Ext.Date.format(idate, 'Y') + '-01-01', 'Y-m-d');
                } else if (mt < 7) { // erster Quartal
                    date = Ext.Date.parse(Ext.Date.format(idate, 'Y') + '-04-01', 'Y-m-d');
                } else if (mt < 10) { // erster Quartal
                    date = Ext.Date.parse(Ext.Date.format(idate, 'Y') + '-07-01', 'Y-m-d');
                } else { // erster Quartal
                    date = Ext.Date.parse(Ext.Date.format(idate, 'Y') + '-10-01', 'Y-m-d');
                }
                date = Ext.Date.add(date, Ext.Date.MONTH, 2);
                date = Ext.Date.getLastDateOfMonth(date);
                break;
            case 'fdiy':
                date = Ext.Date.parse(Ext.Date.format(idate, 'Y') + '-01-01', 'Y-m-d');
                break;
            case 'ldiy':
                date = Ext.Date.parse(Ext.Date.format(idate, 'Y') + '-12-31', 'Y-m-d');
                break;
            default:
                // current
                break;
        }
        switch (steptype) {
            case 'day':
                date = Ext.Date.add(date, Ext.Date.DAY, step * 1);
                break;
            case 'month':
                date = Ext.Date.add(date, Ext.Date.MONTH, step * 1);
                break;
            case 'year':
                date = Ext.Date.add(date, Ext.Date.YEAR, step * 1);
                break;
        }
        // post processing for last combinations
        if (steptype == 'month') {
            switch (type) {
                case 'ldim':
                case 'ldiq':
                case 'ldiy':
                    date = Ext.Date.getLastDateOfMonth(date);
                    break;
            }
        }
        return date;
    }
});