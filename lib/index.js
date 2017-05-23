
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
    if (typeof name !== 'string') {
      throw new Error('Path should be string')
    }
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
export function createRest(creator) {
  const ctx = new Maker('')
  creator(ctx)
  return ctx.build()
}

export { flattenRoutes } from './flatten'
export { printRoutes } from './printer'

