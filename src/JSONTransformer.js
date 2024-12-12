const
    assert      = require('@fua/core.assert'),
    is          = require('@fua/core.is'),
    Transformer = require('./Transformer.js');

module.exports = function JSONTransformer(options = {}) {
    const transformer = Transformer(options.id || '');

    transformer.use(function (source, output, next) {
        try {
            if (is.object(source)) source = JSON.stringify(source);
            assert(is.string(source), 'expected input to be a string');
            output = JSON.parse(source);
            assert(is.object(output), 'expected output to be json');
            next(null, output);
        } catch (err) {
            next(err);
        }
    });

    return transformer;
}
