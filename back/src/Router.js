module.exports = () => {
    const routes = [];

    async function Router(source, output = source, next) {
        for(let route of routes) {
            output = await new Promise((resolve, reject) => {
                const next = (err, result) => err
                    ? reject(err)
                    : resolve(typeof result === 'undefined' ? output : result);
                route(source, output, next);
            });
        }

        return (typeof next === 'function')
            ? next(output) : output;
    }

    Object.defineProperty(Router, 'use', {
        value: function(...fns) {
            fns = fns.filter(fn => typeof fn === 'function');
            routes.push(...fns);
        }
    });

    return Router;
};