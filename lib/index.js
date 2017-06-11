import { createRestInstanceSymbol } from './symbol'

/**
 * @desc Simple object for `resource()`
 * @typedef {object} ResourceController
 * @property {function} [beforeEach] Called before each request
 * @property {function} [afterEach] Called after each request
 * @property {function} [read] Handle GET /name
 * @property {function} [create] Handle POST /name
 * @property {function} [update] Handle PUT /name
 * @property {function} [destroy] handle DELETE /name
 * @example
 * const DemoController = {
 *   beforeEach(req, res, next) {
 *     // any checks here
 *     next()
 *   },
 *   create(req, res, next) {
 *     context.makeDemo.create(req.params)
 *     res.json({ complete: true })
 *     next()
 *   },
 *   afterEach(req, res, next) {
 *     // close your resources here
 *     context.db.close()
 *   }
 * }
 */

/**
 * Check is correct routes passed
 * @public
 * @function
 * @param {RestRoutes} routes
 * @return {boolean}
 */
export const isCreateRestInstance = routes => routes[createRestInstanceSymbol] === true

/**
 * @desc Routes object
 * @typedef {object} RestRoutes Foo bar
 */

/**
 * @class Maker
 * @protected
 */
export class Maker {
  /**
   * @ignore
   */
  constructor() {
    /**
     * @ignore
     */
    this.ctx = {
      before: [],
      after: [],
      scoped: {},
      local: {},
    }
  }

  /**
   * @ignore
   * Build routes ast
   */
  build() {
    const scoped = {}
    Object.keys(this.ctx.scoped).forEach(name => {
      scoped[name] = this.ctx.scoped[name].build()
    })
    return Object.assign({}, this.ctx, { scoped, [createRestInstanceSymbol]: true })
  }

  /**
   * Add middlewares before request handler to current scope
   * @param {...function[]} list List of the middlewares
   *
   * @example
   * createRest(r => {
   *   r.before(() => console.log(1))
   *   r.before(() => console.log(2), () => console.log(3))
   * })
   */
  before(...list) {
    this.ctx.before = this.ctx.before.concat(list.filter(ln => !!ln))
  }

  /**
   * Add middlewares before request handler to current scope.
   *
   * Alias for {before}
   * @param {...function[]} list List of the middlewares
   * @alias before
   *
   * @example
   * createRest(r => {
   *   r.before(() => console.log(1))
   *   r.before(() => console.log(2), () => console.log(3))
   * })
   */
  beforeEach(...list) {
    this.before(...list)
  }

  /**
   * Add middlewares after request handler to current scope
   * @param {...function[]} list List of the middlewares
   * @example
   * createRest(r => {
   *   r.after(() => console.log(3))
   *   r.after(() => console.log(2), () => console.log(1))
   * })
   */
  after(...list) {
    this.ctx.after = this.ctx.after.concat(list.filter(ln => !!ln))
  }

  /**
   * Add middlewares after request handler to current scope.
   *
   * Alias for {after}
   * @param {...function[]} list List of the middlewares
   * @alias after
   *
   * @example
   * createRest(r => {
   *   r.after(() => console.log(3))
   *   r.after(() => console.log(2), () => console.log(1))
   * })
   */
  afterEach(...list) {
    this.after(...list)
  }

  /**
   * Add scoped address, before/after handlers and simple handlers.
   * Before/After handlers is inherits from parent scope.
   * Scopes don't merging. Use only one scope for unique path.
   *
   * @param {string} name Name of the scope
   * @param {function(r: Maker): undefined} creator
   * @throws {Error}
   * @throws {TypeError}
   * @example
   * createRest(r => {
   *   r.before(() => console.log(1))
   *   r.after(() => console.log(4))
   *
   *   r.scope('foo', r => {
   *     r.before(() => console.log(2))
   *     r.after(() => console.log(5))
   *
   *     r.get('bar', () => console.log(3))
   *   })
   * })
   */
  scope(name, creator) {
    if (typeof name !== 'string') {
      throw new TypeError('Name of the scope should be string!')
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
   *
   * @ignore
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
   *
   * @ignore
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
      throw new TypeError('Maybe you forget to add listener?')
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
   * Handle POST HTTP method with single or many handlers
   * @param {string} [name] Route path. Default is current scope
   * @param {...function} handlers List of http-handlers
   * @throws {Error} Path should not be deep
   * @throws {TypeError} Maybe you forget to add listener?
   * @example
   * createRest(r => {
   *   r.post('name', () => console.log('Handled post /name request'))
   *   r.post(() => console.log('Handled post / request'))
   *   r.post('create',
   *     (req, res, next) => next(),
   *     authorize('user'),
   *     () => console.log('Handled post /create with middlewares')
   *   )
   * })
   */
  post(name, ...handlers) {
    this.method('POST', [name, ...handlers])
  }

  /**
   * Handle GET HTTP method with single or many handlers
   * @param {string} [name] Route path. Default is current scope
   * @param {...function} handlers List of http-handlers
   * @throws {Error} Path should not be deep
   * @throws {TypeError} Maybe you forget to add listener?
   * @example
   * createRest(r => {
   *   r.get('name', () => console.log('Handled get /name request'))
   *   r.get(() => console.log('Handled get / request'))
   *   r.get('create',
   *     (req, res, next) => next(),
   *     authorize('user'),
   *     () => console.log('Handled get /create with middlewares')
   *   )
   * })
   */
  get(name, ...handlers) {
    this.method('GET', [name, ...handlers])
  }

  /**
   * Handle PUT HTTP method with single or many handlers
   * @param {string} [name] Route path. Default is current scope
   * @param {...function} handlers List of http-handlers
   * @throws {Error} Path should not be deep
   * @throws {TypeError} Maybe you forget to add listener?
   * @example
   * createRest(r => {
   *   r.put('name', () => console.log('Handled put /name request'))
   *   r.put(() => console.log('Handled put / request'))
   *   r.put('create',
   *     (req, res, next) => next(),
   *     authorize('user'),
   *     () => console.log('Handled put /create with middlewares')
   *   )
   * })
   */
  put(name, ...handlers) {
    this.method('PUT', [name, ...handlers])
  }

  /**
   * Handle DELETE HTTP method with single or many handlers
   * @param {string} [name] Route path. Default is current scope
   * @param {...function} handlers List of http-handlers
   * @throws {Error} Path should not be deep
   * @throws {TypeError} Maybe you forget to add listener?
   * @example
   * createRest(r => {
   *   r.delete('name', () => console.log('Handled delete /name request'))
   *   r.delete(() => console.log('Handled delete / request'))
   *   r.delete('create',
   *     (req, res, next) => next(),
   *     authorize('user'),
   *     () => console.log('Handled delete /create with middlewares')
   *   )
   * })
   */
  delete(name, ...handlers) {
    this.method('DELETE', [name, ...handlers])
  }

  /**
   * Handle PATCH HTTP method with single or many handlers
   * @param {string} [name] Route path. Default is current scope
   * @param {...function} handlers List of http-handlers
   * @throws {Error} Path should not be deep
   * @throws {TypeError} Maybe you forget to add listener?
   * @example
   * createRest(r => {
   *   r.patch('name', () => console.log('Handled patch /name request'))
   *   r.patch(() => console.log('Handled patch / request'))
   *   r.patch('create',
   *     (req, res, next) => next(),
   *     authorize('user'),
   *     () => console.log('Handled patch /create with middlewares')
   *   )
   * })
   */
  patch(name, ...handlers) {
    this.method('PATCH', [name, ...handlers])
  }

  /**
   * @desc Configure your `resource('name', controller, options)`
   * @typedef {object} resourceOptions
   * @property {string[]} [only] Keep only that handlers: `[read, create, update, destroy]`
   * @property {string[]} [except] Keep all except that handlers
   * @property {object} [methodNames] Change method names
   *
   * @example <caption>Usage with `only`</caption>
   * createRest(r => {
   *   r.resource('foo', FooController, { only: ['read'] })
   * })
   *
   * @example <caption>Usage with `except`</caption>
   * createRest(r => {
   *   r.resource('bar', BarController, { except: ['destroy', 'update'] })
   * })
   *
   * @example <caption>Method names</caption>
   * const Controller = {
   *   createDemo() {},
   *   updateMe() {},
   *   justExample() {},
   *   youDontNeedThis() {},
   * }
   * createRest(r => {
   *   r.resource('demo', Controller, { methodNames: {
   *     read: 'justExample', create: 'createDemo', update: 'updateMe', destroy: 'youDontNeedThis',
   *   }})
   * })
   */

  /**
   * Create CRUD methods for single resource.
   *
   * Resources not merging. Use only one resource for path.
   * @param {string} name Name of the resource. Create route path from
   * @param {ResourceController} controller Object with methods
   * @param {resourceOptions} [options={}] Options object
   * @example
   * const Controller = {
   *   read() {},
   *   create() {},
   *   update() {},
   *   destroy() {},
   *   beforeEach() {},
   *   afterEach() {},
   * }
   * const SecondCtrl = {
   *   read() {},
   *   update() {},
   * }
   * const routes = createRest(r => {
   *   r.resource('example', Controller)
   *   r.resource('demo', Controller, { only: ['create', 'read'] })
   *   r.resource('single', Controller, { except: ['destroy', 'create'] })
   * })
   * printRoutes(routes, true)
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

    const resolveMethodName = (handler, currentController) => options.methodNames && options.methodNames[handler]
      ? currentController[options.methodNames[handler]]
      : currentController[handler]

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
          r[httpMethod](resolveMethodName(handler, controller))
        })
    })
  }
}

/**
 * Create routes by sync callback
 * @param {function(r: Maker): null} creator Callback
 * @return {RestRoutes} Routes object
 */
export function createRest(creator) {
  if (typeof creator !== 'function') {
    throw new TypeError('Creator should be a function')
  }

  const ctx = new Maker('')
  creator(ctx)
  return ctx.build()
}

export { flattenRoutes } from './flatten'
export { printRoutes } from './printer'
