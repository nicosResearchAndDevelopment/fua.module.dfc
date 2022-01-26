const util = require('./module.dfc.util.js');

function Transformer(id = '') {
    util.assert(util.isString(id), `Transformer : expected id to be a string`, TypeError);

    let
        transformMethods = [],
        changeLocked     = false;

    async function transformer(source, output = source, next) {
        for (let method of transformMethods) {
            output = await new Promise((resolve, reject) => {
                const next = (err, result) => err ? reject(err) : resolve(util.isDefined(result) ? result : output);
                method.call(transformer, source, output, next);
            });
        }
        return util.isFunction(next) ? next(output) : output;
    } // transformer

    function useMethod(...methods) {
        util.assert(!changeLocked, `Transformer<${id}>.use : already locked`);
        util.assert(methods.every(util.isFunction), `Transformer<${id}>.use : expected method to be a function`, TypeError);
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

} // Transformer

module.exports = Transformer;
