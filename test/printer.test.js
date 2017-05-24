import test from 'ava'
import { createRest } from '../lib'
import { printRoutes } from '../lib/printer'

/* eslint-disable no-shadow */

const get = () => {}
const post = () => {}
const put = () => {}
const patch = () => {}
const destroy = () => {}
const before = () => {}
const after = () => {}

const make = (method, listeners = []) => ({
  method, listeners,
})

test('Simple with before/after', t => {
  t.deepEqual(
    printRoutes(createRest(r => {
      r.before(before)
      r.after(after)
      r.get(get)
      r.post('foo', post)
    }), false),
    [
      'GET / -> before(), get(), after()',
      'POST /foo/ -> before(), post(), after()',
    ]
  )
})

test('Scoped with before/after', t => {
  t.deepEqual(
    printRoutes(createRest(r => {
      r.before(before)
      r.after(after)
      r.get(get)
      r.post('foo', post)
      r.scope('bar', r => {
        r.before(before)
        r.after(after)
        r.put(() => {})
        r.delete('baz', destroy)
      })
    }), false),
    [
      'GET / -> before(), get(), after()',
      'POST /foo/ -> before(), post(), after()',
      'PUT /bar/ -> before(), before(), <function>(), after(), after()',
      'DELETE /bar/baz/ -> before(), before(), destroy(), after(), after()'
    ]
  )
})

test.todo('Real print to stdout')

// test('Real print to output', t => {
//   printRoutes(createRest(r => {
//     r.before(before)
//     r.after(after)
//     r.get(get)
//     r.post('foo', post)
//   }), false)
//   t.pass()
// })
