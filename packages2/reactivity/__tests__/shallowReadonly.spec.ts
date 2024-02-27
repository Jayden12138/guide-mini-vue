import { isReadonly, shallowReadonly } from "../src"
import { vi } from 'vitest'

describe('shallowReadonly', () => {

    it('happy path', () => {
        const original = { foo: 1, bar: { baz: 2 } }
        const observed = shallowReadonly(original)
        expect(observed).not.toBe(original)
        expect(observed.foo).toBe(1)
        expect(isReadonly(observed)).toBe(true)
        expect(isReadonly(observed.bar)).toBe(false);
    })

        it('should not allow reassignment', () => {
          console.warn = vi.fn();
          const original = { foo: 1 };
          const observed = shallowReadonly(original);
          observed.foo = 2;
          expect(console.warn).toHaveBeenCalled();
        });
})