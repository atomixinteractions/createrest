import test from 'ava'
import { createRest } from './index'

test('Base structure', t => {
  t.deepEqual(createRest(r => {}), {
    before: [],
    after: [],
    scoped: {},
    local: {},
  })
})
