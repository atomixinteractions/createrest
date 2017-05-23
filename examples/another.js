const stringify = require('stringify-object')
const chalk = require('chalk')

class Maker {
  constructor() {
    this.ctx = {
      before: [],
      after: [],
      scoped: {},
      local: {},
    }
  }

  build() {
    const scoped = {}
    Object.keys(this.ctx.scoped).forEach(name => {
      scoped[name] = this.ctx.scoped[name].build()
    })
    return Object.assign({}, this.ctx, { scoped })
  }

  before(...list) {
    this.ctx.before = this.ctx.before.concat(list)
  }

  after(...list) {
    this.ctx.after = this.ctx.after.concat(list)
  }

  scope(name, creator) {
    if (name.indexOf('/') !== -1) {
      throw new Error('Name of the scope should be simple string!')
    }

    const scopedCtx = new Maker()
    creator(scopedCtx)
    this.ctx.scoped[name] = scopedCtx
  }
  /**
   * Add HTTP method listeners to local
   * @param {string} method
   * @param {function[]} listeners
   */
  local(method, listeners) {
    // if listeners for that methods exists, simple merge
    if (this.ctx.local[method]) {
      this.ctx.local[method] = this.ctx.local[method].concat(listeners)
    }
    else {
      this.ctx.local[method] = listeners
    }
  }

  /**
   * Handle method creator
   * @param {string} name
   * @param {string} method
   * @param {function[]} listeners
   */
  method(name, method, listeners) {
    if (name.indexOf('/') !== 0) {
      throw new Error('Path should start from /')
    }
    if (name.match(/\//g).length > 1) {
      throw new Error('Path should not be deep')
    }
    if (listeners.length === 0) {
      throw new Error('Maybe you forget to add listener?')
    }

    if (name === '/') {
      return this.local(method, listeners)
    }

    const absName = name.replace('/', '')
    let scoped = this.ctx.scoped[absName]
    if (!scoped) {
      scoped = new Maker()
      this.ctx.scoped[absName] = scoped
    }
    scoped.local(method, listeners)
  }

  post(name, ...listeners) {
    this.method(name, 'POST', listeners)
  }
  get(name, ...listeners) {
    this.method(name, 'GET', listeners)
  }
  put(name, ...listeners) {
    this.method(name, 'PUT', listeners)
  }
  delete(name, ...listeners) {
    this.method(name, 'DELETE', listeners)
  }
  patch(name, ...listeners) {
    this.method(name, 'PATCH', listeners)
  }
}

/**
 *
 * @param {function} creator
 */
function createRest(creator) {
  const ctx = new Maker('')
  creator(ctx)
  return ctx.build()
}

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

function _flattenRoutes(routes, prefix, parent) {
  const list = {}

  Object.keys(routes.local).forEach(method => {
    const localName = prefix === '/' ? '/' : `${prefix}/`
    list[localName] = {
      method,
      listeners: [].concat(
        parent.before,
        routes.before,
        routes.local[method],
        routes.after,
        parent.after
      ),
    }
  })

  Object.keys(routes.scoped).forEach(scope => {
    const scoped = routes.scoped[scope]
    const listeners = _flattenRoutes(scoped, `${prefix}/${scope}`, {
      before: parent.before.concat(routes.before),
      after: routes.after.concat(parent.after),
    })
    Object.assign(list, listeners)
  })

  return list
}

function flattenRoutes(routes) {
  return _flattenRoutes(routes, '', { before: [], after: [] })
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

