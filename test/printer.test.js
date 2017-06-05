import avaTest from 'ava'
import { createRest } from '../lib'
import { printRoutes } from '../lib/printer'


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

avaTest('Outputs before/after', test => {
  test.deepEqual(
    printRoutes(createRest(root => {
      root.before(before)
      root.after(after)
      root.get(get)
      root.post('foo', post)
    }), false),
    [
      'GET / -> before(), get(), after()',
      'POST /foo/ -> before(), post(), after()',
    ]
  )
})

avaTest('Outputs scoped routes with before/after', test => {
  test.deepEqual(
    printRoutes(createRest(root => {
      root.before(before)
      root.after(after)
      root.get(get)
      root.post('foo', post)
      root.scope('bar', bar => {
        bar.before(before)
        bar.after(after)
        bar.put(() => {})
        bar.delete('baz', destroy)
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

avaTest.todo('Real print to stdout')

avaTest('Real print to output', test => {
  printRoutes(createRest(root => {
    root.before(before)
    root.after(after)
    root.get(get)
    root.post('foo', post)
  }))
  // TODO: check real print
  test.pass()
})
