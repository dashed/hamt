"use strict";
const hamt = require('../hamt');
const assert = require('chai').assert;

describe('modify', () => {
    it('should update entry in single map', () => {
        const h = hamt.set('a', 3, hamt.empty);
        const h1 = hamt.modify(x => x * 2, 'a', h);

        assert.strictEqual(6, hamt.get('a', h1));
        assert.strictEqual(3, hamt.get('a', h));
    });

    it('should work on with method calls', () => {
        const h = hamt.empty.set('a', 3);
        const h1 = h.modify('a', x => x * 2);

        assert.strictEqual(6, h1.get('a'));
        assert.strictEqual(3, h.get('a'));
    });


    it('should insert into empty map', () => {
        const h = hamt.empty.modify('a', _ => 10);
        assert.strictEqual(10, hamt.get('a', h));
    });

    // TODO: remove
    // it('should call `f` with zero args on insert', () => {
    //     const h = hamt.modify(function(x) {
    //         assert.strictEqual(0, arguments.length);
    //         assert.strictEqual(undefined, x);
    //     }, 'a',  hamt.empty);
    // });

    it('should insert if no value in map matches', () => {
        const h = hamt.empty.set('a', 3).set('b', 5);
        const h1 = hamt.modify(_ => 10, 'c', h);

        assert.strictEqual(3, hamt.get('a', h1));
        assert.strictEqual(5, hamt.get('b', h1));
        assert.strictEqual(10, hamt.get('c', h1));

        assert.strictEqual(3, hamt.get('a', h));
        assert.strictEqual(5, hamt.get('b', h));
        assert.strictEqual(undefined, hamt.get('c', h));
    });

    it('should modify collision values correctly', () => {
        const h1 = hamt.empty
            .modifyHash(0, 'a', () => 3)
            .modifyHash(0, 'b', () => 5);

        const h3 = h1.modifyHash(0, 'a', x => x * 2);
        assert.strictEqual(6, h3.getHash(0, 'a'));
        assert.strictEqual(5, h3.getHash(0, 'b'));

        const h4 = h3.modifyHash(0, 'b', x => x * 2);
        assert.strictEqual(6, h4.getHash(0, 'a'));
        assert.strictEqual(10, h4.getHash(0, 'b'));

        // Non existant
        const h5 = h4.modifyHash(0, 'c', _ => 100);
        assert.strictEqual(6, h5.getHash(0, 'a'));
        assert.strictEqual(10, h5.getHash(0, 'b'));
        assert.strictEqual(100, h5.getHash(0, 'c'));
    });

    it('should provide defaultValue to `f` if entry does not exist on empty map', () => {
        // TODO: complete
    });

    it('should provide defaultValue to `f` if entry does not exist on non-empty map', () => {

        const NOT_SET = {};
        const h = hamt.set('a', 3, hamt.empty);

        const identity = (x) => {
            assert.strictEqual(x, NOT_SET);
            return x;
        };

        const h1 = hamt.modify(identity, 'b', h, NOT_SET);
    });

    it('should perform edit when defaultValue is what you return from `f` if entry does not exist on empty map', () => {

        const NOT_SET = {};
        const h = hamt.empty;

        const identity = (x) => {
            assert.strictEqual(x, NOT_SET);
            return x;
        };

        const h2 = h.modify('a', identity, NOT_SET);

        assert.strictEqual(false, h === h2);

    });

    it('does not return new map when new value is the same as old value', () => {

        const NOT_SET = {};
        const h = hamt.empty;

        const identity = (x) => {
            assert.strictEqual(x, NOT_SET);
            return x;
        };

        const h2 = h.modify('a', identity, NOT_SET);

        assert.strictEqual(false, h === h2);
        assert.strictEqual(h2, h2.modify('a', identity));

    });
});
