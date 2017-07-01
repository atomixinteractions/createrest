import pluralize from 'pluralize'
import { createRestInstanceSymbol } from './symbol'

/**
 * @desc Simple object for `crud()`
 * @typedef {object} CrudController
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
   *   r.beforeEach(() => console.log(1))
   *   r.beforeEach(() => console.log(2), () => console.log(3))
   * })
   */
  beforeEach(...list) {
    this.ctx.before = this.ctx.before.concat(list.filter(ln => !!ln))
  }

  /**
   * Add middlewares after request handler to current scope
   * @param {...function[]} list List of the middlewares
   * @example
   * createRest(r => {
   *   r.afterEach(() => console.log(3))
   *   r.afterEach(() => console.log(2), () => console.log(1))
   * })
   */
  afterEach(...list) {
    this.ctx.after = this.ctx.after.concat(list.filter(ln => !!ln))
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
   *   r.beforeEach(() => console.log(1))
   *   r.afterEach(() => console.log(4))
   *
   *   r.scope('foo', r => {
   *     r.beforeEach(() => console.log(2))
   *     r.afterEach(() => console.log(5))
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
   * createRest(root => {
   *   root.get('name', () => console.log('Handled get /name request'))
   *   root.get(() => console.log('Handled get / request'))
   *   root.get('create',
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
   * createRest(root => {
   *   root.put('name', () => console.log('Handled put /name request'))
   *   root.put(() => console.log('Handled put / request'))
   *   root.put('create',
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
   * createRest(root => {
   *   root.delete('name', () => console.log('Handled delete /name request'))
   *   root.delete(() => console.log('Handled delete / request'))
   *   root.delete('create',
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
   * createRest(root => {
   *   root.patch('name', () => console.log('Handled patch /name request'))
   *   root.patch(() => console.log('Handled patch / request'))
   *   root.patch('create',
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
   * @desc Configure your `crud('name', controller, options)`
   * @typedef {object} crudOptions
   * @property {string[]} [only] Keep only that handlers: `[read, create, update, destroy]`
   * @property {string[]} [except] Keep all except that handlers
   * @property {object} [methodNames] Change method names
   *
   * @example <caption>Usage with `only`</caption>
   * createRest(root => {
   *   root.crud('foo', FooController, { only: ['read'] })
   * })
   *
   * @example <caption>Usage with `except`</caption>
   * createRest(root => {
   *   root.crud('bar', BarController, { except: ['destroy', 'update'] })
   * })
   *
   * @example <caption>Method names</caption>
   * const Controller = {
   *   createDemo() {},
   *   updateMe() {},
   *   justExample() {},
   *   youDontNeedThis() {},
   * }
   * createRest(root => {
   *   root.crud('demo', Controller, { methodNames: {
   *     read: 'justExample', create: 'createDemo', update: 'updateMe', destroy: 'youDontNeedThis',
   *   }})
   * })
   */

  /**
   * Add CRUD methods for single resource.
   *
   * CRUD methods not merging. Use only one crud for path.
   * @param {string} name Name of the resource. Create route path from
   * @param {CrudController} controller Object with methods
   * @param {crudOptions} [options={}] Options object
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
   * const routes = createRest(root => {
   *   root.crud('example', Controller)
   *   root.crud('demo', Controller, { only: ['create', 'read'] })
   *   root.crud('single', Controller, { except: ['destroy', 'create'] })
   * })
   * printRoutes(routes, true)
   */
  crud(name, controller, options = {}) {
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

    this.scope(name, scope => {
      scope.beforeEach(controller.beforeEach)
      scope.afterEach(controller.afterEach)

      usedList
        .filter(handler => methodsList.includes(handler))
        .map(handler => [handler, methods[handler]])
        .forEach(([handler, httpMethod]) => {
          scope[httpMethod](resolveMethodName(handler, controller))
        })
    })
  }

  /**
   * @desc Configure your `resources('name', controller, options)`
   * @typedef {object} resourcesOptions
   * @property {string[]} [only] Keep only that handlers: `[index, read, create, update, patch, destroy]`
   * @property {string[]} [except] Keep all except that handlers
   * @property {string} [memberId] Change :memberId in the URI
   *
   * @example <caption>Usage with `only`</caption>
   * createRest(root => {
   *   root.resources('books', BooksController, { only: ['read', 'index'] })
   * })
   * // GET /books          -> index()
   * // GET /books/:bookId  -> read()
   *
   * @example <caption>Usage with `except`</caption>
   * createRest(root => {
   *   root.resources('songs', SongsController, { except: ['destroy', 'update'] })
   * })
   * // GET /songs              -> index()
   * // POST /songs             -> create()
   * // GET /songs/:songId      -> read()
   * // PATCH /songs/:songId    -> patch()
   *
   * @example <caption>Member ID renaming</caption>
   * createRest(root => {
   *   root.resources('images', ImagesController, { memberId: 'imgid' })
   * })
   * // GET /images            -> index()
   * // POST /images           -> create()
   * // GET /images/:imgid     -> read()
   * // PUT /images/:imgid     -> update()
   * // PATCH /images/:imgid   -> patch()
   * // DELETE /images/:imgid  -> destroy()
   */

  /**
   * Add index, create, read, update, patch, remove methods to manage resource
   * @param {string} name Name of the resources. Path created from. Example: `books`
   * @param {ResourcesController} controller Object with methods
   * @param {resourcesOptions} [options={}] Options for crud
   *
   * @example <caption>Full example</caption>
   * createRest(root => {
   *   root.resources('users', UsersController)
   * })
   * // GET /users             -> index()
   * // POST /users            -> create()
   * // GET /users/:userId     -> read()
   * // PUT /users/:userId     -> update()
   * // PATCH /users/:userId   -> patch()
   * // DELETE /users/:userId  -> destroy()
   */
  resources(name, controller, options = {}) {
    /**
     * index : get /
     * create : post /
     * read : get /:id
     * update : put /:id
     * patch : patch /:id
     * remove : delete /:id
     */
    if (!name || name.length === 0) {
      throw new Error('Crud should be named')
    }

    if (typeof controller !== 'object') {
      return undefined
    }

    if (options.only && options.except) {
      throw new Error(`You can't use 'except' and 'only' options at the same time`)
    }

    const noMethodsSlicingOption = (!options.only || options.only.length === 0)
      && (!options.except || options.except.length === 0)

    /**
     * Check method existing in options `only` or `except`
     * @param {string} methodName
     * @private
     */
    const checkMethod = methodName =>
      noMethodsSlicingOption
      || (options.only && options.only.length && options.only.includes(methodName))
      || (options.except && options.except.length && !options.except.includes(methodName))

    const memberId = options.memberId || `${pluralize.singular(name)}Id`

    this.scope(name, scope => {
      scope.beforeEach(controller.beforeEach)
      scope.afterEach(controller.afterEach)

      if (checkMethod('index')) {
        scope.get('/', controller.index)
      }

      if (checkMethod('create')) {
        scope.post('/', controller.create)
      }

      scope.scope(`:${memberId}`, member => {
        if (checkMethod('read')) {
          member.get('/', controller.read)
        }

        if (checkMethod('update')) {
          member.put('/', controller.update)
        }

        if (checkMethod('patch')) {
          if (controller.patch) {
            member.patch('/', controller.patch)
          }
          else if (checkMethod('update')) {
            member.patch('/', controller.update)
          }
          else {
            // no PATCH /:id add
          }
        }

        if (checkMethod('destroy')) {
          member.delete('/', controller.destroy)
        }
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
