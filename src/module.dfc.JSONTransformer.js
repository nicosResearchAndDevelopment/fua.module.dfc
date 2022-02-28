const
    util        = require('./module.dfc.util.js'),
    Transformer = require('./module.dfc.Transformer.js');

function JSONTransformer(options = {}) {

    const
        transformer = Transformer(options.id || '');

    transformer.use(function (source, output, next) {
        try {
            if (util.isObject(source))
                source = JSON.stringify(source);
            if (!util.isString(source))
                throw new Error('expected input to be a string');
            output = JSON.parse(source);
            if (!util.isObject(output))
                throw new Error('expected output to be json');
            next(null, output);
        } catch (err) {
            next(err);
        }
    });

    return transformer;

} // JSONTransformer

module.exports = JSONTransformer;
