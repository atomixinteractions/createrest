const stringify = require('stringify-object')
const chalk = require('chalk')

const { createRest, flattenRoutes, printRoutes } = require('../dist')

/**
 *      ''
 *  '/foo'
 *
 *         'some'
 *  '/foo/some
 */

const exampleAT = {
  demo: {
    before: [],
    after: [],
    methods: {
      POST: [() => {}],
      PUT: [],
    },
    scoped: {
      foo: {
        before: [() => {}],
        after: [],
        methods: {
          POST: [() => {}],
          PUT: [],
        },
      },
    },
  },
}

// ========================================================================= //
// ========================================================================= //

const before1 = function before1() {
  console.log('before1()')
}
const before2 = function before2() {
  console.log('before2()')
}
const before3 = function before3() {
  console.log('before3()')
}
const after1 = function after1() {
  console.log('after1()')
}
const after2 = function after2() {
  console.log('after2()')
}
const after3 = function after3() {
  console.log('after3()')
}
const post1 = function post1() {
  console.log('post1()')
}
const get1 = function get1() {
  console.log('get1()')
}
const get2 = function get2() {
  console.log('get2()')
}
const put3 = function put3() {
  console.log('put3()')
}

const routes = createRest(e => {
  e.before(before1)
  e.after(after1)

  e.post('/', post1)

  e.scope('demo', e => {
    e.before(before2)
    e.after(after2)

    e.get('/', get1)
    e.get('/foo', get2)

    e.scope('bar', e => {
      e.before(before3)
      e.after(after3)

      e.put('/', put3)
    })
  })
})

const strf = (data, indent = '  ') => stringify(data, {
  indent,
  transform(obj, prop, original) {
    if (/^function/.test(original)) {
      return chalk.blue(
        original
          .replace(/\n+/mg, '')
          .replace(/\s+/mg, ' ')
          .replace(/^\w+\s+(\w+)\(\).*/mg, `$1()`)
      )
    }

    return original
  },
})

console.log(strf(routes))

const flat = flattenRoutes(routes)
Object.keys(flat).forEach(path => {
  const ro = flat[path]
  console.log(chalk.green(`${ro.method} ${path}`), ro.listeners.map(fn => `${fn.name}()`).join(', '))
})

printRoutes(routes)
