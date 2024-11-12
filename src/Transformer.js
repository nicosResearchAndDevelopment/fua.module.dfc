const
    assert = require('@nrd/fua.core.assert'),
    is     = require('@nrd/fua.core.is');

module.exports = function Transformer(id = '') {
    assert(is.string(id), `Transformer : expected id to be a string`, TypeError);

    let
        transformMethods = [],
        changeLocked     = false;

    async function transformer(source, output = source, next) {
        for (let method of transformMethods) {
            output = await new Promise((resolve, reject) => {
                const next = (err, result) => err ? reject(err) : resolve(is.defined(result) ? result : output);
                method.call(transformer, source, output, next);
            });
        }
        return is.function(next) ? next(output) : output;
    } // transformer

    function useMethod(...methods) {
        assert(!changeLocked, `Transformer<${id}>.use : already locked`);
        assert(methods.every(is.function), `Transformer<${id}>.use : expected method to be a function`, TypeError);
        transformMethods.push(...methods);
        return transformer;
    } // useMethod

    function lockChanges() {
        changeLocked = true;
        return transformer;
    } // lockChanges

    Object.defineProperties(transformer, {
        id:   {value: id},
        use:  {value: useMethod},
        lock: {value: lockChanges}
    });

    return transformer;
}
