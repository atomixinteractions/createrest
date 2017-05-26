
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
    this.ctx.before = this.ctx.before.concat(list.filter(ln => !!ln))
  }

  after(...list) {
    this.ctx.after = this.ctx.after.concat(list.filter(ln => !!ln))
  }

  scope(name, creator) {
    if (typeof name !== 'string') {
      throw new Error('Name of the scope should be string!')
    }
    if (name.length === 0 || name.indexOf('/') !== -1) {
      throw new Error('Name of the scope should be a word')
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
  method(method, _listeners) {
    let name = ''
    let listeners = _listeners
    if (typeof listeners[0] === 'string') {
      name = listeners.splice(0, 1)[0]
    }
    name = name.replace(/^\//gm, '')

    if (name.indexOf('/') !== -1) {
      throw new Error('Path should not be deep')
    }
    if (listeners.length === 0) {
      throw new Error('Maybe you forget to add listener?')
    }

    listeners = listeners.filter(e => typeof e === 'function')

    // if added undefined listeners
    if (listeners.length === 0) return

    if (name !== '') {
      let scoped = this.ctx.scoped[name]
      if (!scoped) {
        scoped = new Maker()
        this.ctx.scoped[name] = scoped
      }

      scoped.local(method, listeners)
    }
    else {
      this.local(method, listeners)
    }
  }

  /**
   * @param {string} [name]
   * @param {...function[]} listeners
   */
  post(...listeners) {
    this.method('POST', listeners)
  }

  /**
   * @param {string} [name]
   * @param {...function[]} listeners
   */
  get(...listeners) {
    this.method('GET', listeners)
  }

  /**
   * @param {string} [name]
   * @param {...function[]} listeners
   */
  put(...listeners) {
    this.method('PUT', listeners)
  }

  /**
   * @param {string} [name]
   * @param {...function[]} listeners
   */
  delete(...listeners) {
    this.method('DELETE', listeners)
  }

  /**
   * @param {string} [name]
   * @param {...function[]} listeners
   */
  patch(...listeners) {
    this.method('PATCH', listeners)
  }

  /**
   *
   * @param {string} name
   * @param {object|function} controller
   * @param {object} options
   */
  resource(name, controller, options = {}) {
    if (!name || name.length === 0) {
      throw new Error('Resource should be named')
    }

    if (typeof controller === 'undefined') {
      return
    }

    const methods = {
      read: 'get',
      create: 'post',
      update: 'put',
      destroy: 'delete',
    }
    const methodsList = Object.keys(methods)

    /**
     * @var {Array<[string, string]>} usedList [[handlerName, httpMethod], ...]
     */
    let usedList = []

    if (Array.isArray(options.only)) {
      usedList = options.only
    }
    else if (Array.isArray(options.except)) {
      usedList = methodsList
        .filter(handlerName => !options.except.includes(handlerName))
    }
    else {
      usedList = methodsList
    }

    this.scope(name, r => {
      r.before(controller.beforeEach)
      r.after(controller.afterEach)

      usedList
        .filter(handler => methodsList.includes(handler))
        .map(handler => [handler, methods[handler]])
        .forEach(([handler, httpMethod]) => {
          r[httpMethod](controller[handler])
        })
    })
  }
}

/**
 *
 * @param {function} creator
 */
export function createRest(creator) {
  const ctx = new Maker('')
  creator(ctx)
  return ctx.build()
}

export { flattenRoutes } from './flatten'
export { printRoutes } from './printer'

