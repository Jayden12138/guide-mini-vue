import { effect, isReactive, reactive, isProxy } from '../src';

describe('reactive', () => {
    it('happy path', () => {
        const original = { foo: 1 }
        const observed = reactive(original)
        expect(observed).not.toBe(original)
        expect(observed.foo).toBe(1)
        expect(isReactive(observed)).toBe(true)
        expect(isReactive(original)).toBe(false)
        expect(isProxy(observed)).toBe(true)
    })

    it('should observe basic properties', () => {
        let dummy
        const obj = reactive({ prop: 1 })
        effect(() => { dummy = obj.prop })
        expect(dummy).toBe(1)
        obj.prop = 2
        expect(dummy).toBe(2)
    });

    test('nested reactives', () => {
      const original = {
        nested: {
          foo: 1,
        },
        array: [{ bar: 2 }],
      };
      const observed = reactive(original);
      expect(isReactive(observed.nested)).toBe(true);
      expect(isReactive(observed.array)).toBe(true);
      expect(isReactive(observed.array[0])).toBe(true);
    });
})