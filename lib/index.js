
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
  method(method, listeners) {
    let name = ''
    if (typeof listeners[0] === 'string') {
      name = listeners.splice(0, 1)[0]
    }
    name = name.replace(/^\//gm, '')

    if ((name.match(/\//g) || []).length > 1) {
      throw new Error('Path should not be deep')
    }
    if (listeners.length === 0) {
      throw new Error('Maybe you forget to add listener?')
    }

    if (name !== '') {
      let scoped = this.ctx.scoped[name]
      if (!scoped) {
        scoped = new Maker()
        this.ctx.scoped[name] = scoped
      }

      scoped.local(method, listeners)
    }

    this.local(method, listeners)
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

