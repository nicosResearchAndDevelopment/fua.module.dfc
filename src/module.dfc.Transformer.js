const util = require('./module.dfc.util.js');

function Transformer(id = '') {
    util.assert(util.isString(id), `Transformer : expected id to be a string`, TypeError);

    const transformMethods = [];

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
        util.assert(methods.every(util.isFunction), `Transformer<${id}>.use : expected method to be a function`, TypeError);
        transformMethods.push(...methods);
    } // useMethod

    Object.defineProperties(transformer, {
        id:  {value: id},
        use: {value: useMethod}
    });

    return transformer;

} // Transformer

module.exports = Transformer;
