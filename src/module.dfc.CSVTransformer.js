const
    util        = require('./module.dfc.util.js'),
    Transformer = require('./module.dfc.Transformer.js');

function CSVTransformer(options = {}) {

    const
        transformer  = Transformer(options.id || ''),
        headers      = !!(options.headers),
        delimiter    = options.delimiter || ',',
        rowDelimiter = options.rowDelimiter || '\n',
        quote        = options.quote || '"',
        comments     = options.comments || '',
        trim         = !!(options.trim);

    transformer.use(function (source, output, next) {
        if (!util.isString(source))
            return next(new Error('expected input to be a string'));
        next(null, {header: null, rows: []});
    });

    transformer.use(function (source, output, next) {
        let rowStrArr = source.split(rowDelimiter), rowSize = null;
        for (let rowIndex = 0; rowIndex < rowStrArr.length; rowIndex++) {
            const rowStr = rowStrArr[rowIndex];
            if (rowStr.length === 0) continue;
            if (comments && rowStr.startsWith(comments)) continue;
            let row = [], valStrArr = rowStr.split(delimiter);
            for (let valIndex = 0; valIndex < valStrArr.length; valIndex++) {
                let quoted = false;
                if (quote && valStrArr[valIndex].startsWith(quote)) {
                    for (let endIndex = valIndex + 1; endIndex < valStrArr.length; endIndex++) {
                        if (valStrArr[endIndex].endsWith(quote)) {
                            const valStr        = valStrArr.slice(valIndex, endIndex + 1).join('');
                            valStrArr[valIndex] = valStr.substr(1, valStr.length - 2);
                            valStrArr.splice(valIndex + 1, endIndex - valIndex);
                            quoted = true;
                            break;
                        }
                    }
                }
                if (trim && !quoted) row.push(valStrArr[valIndex].trim());
                else row.push(valStrArr[valIndex]);
            }
            if (rowSize === null) rowSize = row.length;
            else if (rowSize !== row.length) return next(new Error(`expected row (${rowIndex}) to have ${rowSize} entries, got ${row.length}'`));
            output.rows.push(row);
        }
        next();
    });

    transformer.use(function (source, output, next) {
        if (!(headers && output.rows.length > 0)) return next();
        output.header = output.rows.shift();
        for (let rowIndex = 0; rowIndex < output.rows.length; rowIndex++) {
            const rowArr = output.rows[rowIndex], rowObj = {};
            for (let valIndex = 0; valIndex < rowArr.length; valIndex++) {
                rowObj[output.header[valIndex]] = rowArr[valIndex];
            }
            output.rows[rowIndex] = rowObj;
        }
        next();
    });

    return transformer;

} // CSVTransformer

module.exports = CSVTransformer;
