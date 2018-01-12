var util = require('../util');
var isoDateRe = /^([0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])(T(2[0-3]|[01][0-9]):([0-5][0-9])(:([0-5][0-9])(\.[0-9]+)?)?(Z|[\+\-](2[0-3]|[01][0-9]):([0-5][0-9]))?)?$/;
var isoDateFormats = [ "date", "datetime" ];
var isoDateSpecialDates = [ "yesterday", "current", "tomorrow" ];

function iso_date(params) {
    var min;
    var max;
    var format = "date";

    if ( arguments.length > 1 ) {
        min = getDateFromParams(params.min, "min");
        max = getDateFromParams(params.max, "max");
        if ( params.format === "datetime" ) format = params.format;
    }

    return function(value, params, outputArr) {
        if ( util.isNoValue(value) ) return;
        if (!util.isPrimitiveValue(value)) return 'FORMAT_ERROR';

        if (!(value+'').match(isoDateRe)) return 'WRONG_DATE';

        var epoch = Date.parse(value);
        if (!epoch && epoch !== 0 ) return 'WRONG_DATE';

        if ( min && epoch < min ) return 'DATE_TOO_LOW';
        if ( max && epoch > max ) return 'DATE_TOO_HIGH';

        var date = new Date(epoch);

        if ( format === "date" ) {
            outputArr.push(formatDate(date));
        } else {
            outputArr.push(date.toISOString());
        }
        
        return;
    }
}

function getDateFromParams(param, key) {
    if (!param) return;

    var matched = (param+'').match(isoDateRe);

    var i = isoDateSpecialDates.indexOf(param);

    var date;

    if ( i > -1 ) {
        date = new Date();
        date.setDate(date.getDate() + (i - 1));
    } else if (!matched ) {
        throw new Error('LIVR: wrong date in "' + key + '" parametr');
    } else {
        var epoch = Date.parse(param);

        if (!epoch && epoch !== 0) {
            throw new Error('LIVR: wrong date in "' + key + '" parametr');
        }
        
        date = new Date(epoch);
    }

    if (!matched || !matched[4]) {
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);

        if (key === 'max') {
            date.setDate(date.getDate() + 1);
            date.setTime(date.getTime() - 1);
        }
    } else if (matched[4] && (matched[10] === 'Z' || !matched[10])) {
        return date.getTime();
    }

    return date.getTime() - date.getTimezoneOffset() * 60 * 1000;
}

function formatDate(date) {
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth()+1).toString();
    var dd  = date.getDate().toString();
  
    var mmChars = mm.split('');
    var ddChars = dd.split('');
  
    return yyyy + '-' + (mmChars[1] ? mm : '0'+mmChars[0]) + '-' + (ddChars[1] ? dd : '0'+ddChars[0]);
  }

module.exports = iso_date;