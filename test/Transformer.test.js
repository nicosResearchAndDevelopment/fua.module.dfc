const
    {describe, test} = require('mocha'),
    expect           = require('expect'),
    dfc              = require('../src/module.dfc.js');

describe('module.dfc.Transformer', function () {

    test('string transformation', async function () {

        const tf = dfc.Transformer('test');
        expect(tf.id).toBe('test');

        tf.use((source, output, next) => {
            if (source) next();
            else next(new Error('empty'));
        });

        tf.use((source, output, next) => {
            output = '>>' + output;
            next(null, output);
        });

        tf.use((source, output, next) => {
            output = output + '<<';
            next(null, output);
        });

        tf.lock();

        expect(await tf('test')).toBe('>>test<<');
        await expect(tf()).rejects.toThrow('empty');
        expect(() => tf.use((source, output, next) => next())).toThrow();

    });

    test('object transformation', async function () {

        const tf = dfc.Transformer('test');
        expect(tf.id).toBe('test');

        tf.use((source, output, next) => {
            if (source === output) next(null, {});
            else next();
        });

        tf.use((source, output, next) => {
            delete output.test;
            next();
        });

        tf.use((source, output, next) => {
            if (source.test) output.test2 = source.test;
            next(null, output);
        });

        tf.use((source, output, next) => {
            if (source.hello) output.hello = 'world!';
            next(null, output);
        });

        tf.lock();

        expect(await tf({test: 1})).toEqual({
            test2: 1
        });
        expect(await tf({test: 1}, {test: 2})).toEqual({
            test2: 1
        });
        expect(await tf({test: 2, hello: 'peter'})).toEqual({
            test2: 2,
            hello: 'world!'
        });

    });

    test('array transformation', async function () {

        const tf = dfc.Transformer('test');
        expect(tf.id).toBe('test');

        tf.use((source, output, next) => {
            if (Array.isArray(source)) next(null, {});
            else next(new Error('not an array'));
        });

        tf.use((source, output, next) => {
            for (let i = 0, max = source.length - 1; i <= max; i++) {
                output['i' + i] = source[i];
            }
            next();
        });

        tf.lock();

        expect(await tf([1, 2, 3])).toEqual({
            i0: 1, i1: 2, i2: 3
        });
        await expect(tf('test')).rejects.toThrow('not an array');

    });

});
