import avaTest from 'ava'
import { createRest } from '../lib'
import { printRoutes } from '../lib/printer'


const get = () => {}
const post = () => {}
const put = () => {}
const patch = () => {}
const destroy = () => {}
const beforeEach = () => {}
const afterEach = () => {}

const make = (method, listeners = []) => ({
  method, listeners,
})

avaTest('Outputs beforeEach/afterEach', test => {
  test.deepEqual(
    printRoutes(createRest(root => {
      root.beforeEach(beforeEach)
      root.afterEach(afterEach)
      root.get(get)
      root.post('foo', post)
    }), false),
    [
      'GET / -> beforeEach(), get(), afterEach()',
      'POST /foo/ -> beforeEach(), post(), afterEach()',
    ]
  )
})

avaTest('Outputs scoped routes with beforeEach/afterEach', test => {
  test.deepEqual(
    printRoutes(createRest(root => {
      root.beforeEach(beforeEach)
      root.afterEach(afterEach)
      root.get(get)
      root.post('foo', post)
      root.scope('bar', bar => {
        bar.beforeEach(beforeEach)
        bar.afterEach(afterEach)
        bar.put(() => {})
        bar.delete('baz', destroy)
      })
    }), false),
    [
      'GET / -> beforeEach(), get(), afterEach()',
      'POST /foo/ -> beforeEach(), post(), afterEach()',
      'PUT /bar/ -> beforeEach(), beforeEach(), <function>(), afterEach(), afterEach()',
      'DELETE /bar/baz/ -> beforeEach(), beforeEach(), destroy(), afterEach(), afterEach()'
    ]
  )
})

avaTest.todo('Real print to stdout')

avaTest('Real print to output', test => {
  printRoutes(createRest(root => {
    root.beforeEach(beforeEach)
    root.afterEach(afterEach)
    root.get(get)
    root.post('foo', post)
  }))
  // TODO: check real print
  test.pass()
})
