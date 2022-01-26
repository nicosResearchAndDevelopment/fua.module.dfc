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
            if (comments && rowStrArr[rowIndex].startsWith(comments)) continue;
            let row = [], valStrArr = rowStrArr[rowIndex].split(delimiter);
            for (let valIndex = 0; valIndex < valStrArr.length; valIndex++) {
                const
                    valStr = trim ? valStrArr[valIndex].trim() : valStrArr[valIndex],
                    quoted = valStr.length >= 2 && valStr.startsWith(quote) && valStr.endsWith(quote);
                row.push(quoted ? valStr.substr(1, valStr.length - 2) : valStr);
            }
            if (rowSize === null) rowSize = row.length;
            else if (rowSize !== row.length) return next(new Error(`expected ${rowIndex + 1}. row to have ${rowSize} entries'`));
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
