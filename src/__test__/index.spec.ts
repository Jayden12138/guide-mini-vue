import { add } from '../index'

describe('setup test', () => {
    it('should pass', () => {
        expect(true).toBe(true)
        expect(add(1, 1)).toBe(2)
    })
})