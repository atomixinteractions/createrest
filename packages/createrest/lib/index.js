import pluralize from 'pluralize'
import { createRestInstanceSymbol } from './symbol'

/**
 * @desc Controller object for `crud()` method {@link RestRoutes}
 * @since 0.9.0
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
 * @desc Controller object for `resources()` method. See {@link Maker.resources}
 * @since 0.9.0
 * @typedef {object} ResourcesController
 * @property {function} [beforeEach]  Hook will invoke before each handler in controller
 * @property {function} [afterEach]  Hook will invoke before after handler in controller
 * @property {function} [index]
 * @property {function} [create]
 * @property {function} [read]
 * @property {function} [update]
 * @property {function} [patch]
 * @property {function} [destroy]
 */

/**
 * Check is correct routes passed
 * @public
 * @since 0.7.0
 * @function
 * @param {RestRoutes} routes
 * @return {boolean}
 */
export const isCreateRestInstance = routes => routes[createRestInstanceSymbol] === true

/**
 * @desc Routes object
 * @protected
 * @typedef {object} RestRoutes
 * @property {Symbol} Symbol(createRestInstanceSymbol)
 * @property {object[]} before
 * @property {object[]} after
 * @property {object} scoped
 * @property {object} local
 */

/**
 * @class Maker
 * @protected
 */
export class Maker {
  /**
   * @private
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
   * @private
   * Build routes ast
   */
  build() {
    const scoped = {}
    Object.keys(this.ctx.scoped).forEach((name) => {
      scoped[name] = this.ctx.scoped[name].build()
    })
    return Object.assign({}, this.ctx, { scoped, [createRestInstanceSymbol]: true })
  }

  /**
   * Add middlewares before request handler to current scope and all child scope
   * @param {...function} list List of the middlewares
   *
   * @example
   * const beforeHandler = () => console.log('before')
   * const getHandler = () => console.log('get')
   *
   * createRest(root => {
   *   root.beforeEach(beforeHandler)
   *   // GET /demo    beforeHandler(); getHandler()
   *   root.get('/demo', getHandler)
   * })
   * // Output:
   * // > before
   * // > get
   * @example <caption>With variable count</caption>
   * const handle1 = () => console.log('handle1')
   * const handle2 = () => console.log('handle2')
   *
   * createRest(root => {
   *   root.beforeEach(handle1, handle2)
   *   // same as
   *   root.beforeEach(handle1)
   *   root.beforeEach(handle2)
   * })
   */
  beforeEach(...list) {
    this.ctx.before = this.ctx.before.concat(list.filter(ln => !!ln))
  }

  /**
   * Add middlewares after request handler to current scope and all child scope
   * @param {...function} list List of the middlewares
   * @example
   * const getHandler = () => console.log('get')
   * const afterHandler = () => console.log('after')
   *
   * createRest(root => {
   *   root.afterEach(afterHandler)
   *   // GET /demo    getHandler(); afterHandler()
   *   root.get('/demo', getHandler)
   * })
   * // Output:
   * // > get
   * // > after
   * @example <caption>You can combine beforeEach and afterEach</caption>
   * const getHandler = () => console.log('get foo')
   * const deleteHandler = () => console.log('DELETE requested')
   * const before1 = () => console.log('That is before 1')
   * const before2 = () => console.log('Second before')
   * const after = () => console.log('Just after request')
   *
   * const routes = createRest(root => {
   *   root.beforeEach(before1, before2)
   *   root.afterEach(after)
   *
   *   // GET /foo    before1(); before2(); getHandler(); after()
   *   root.get('/foo', getHandler)
   *
   *   root.scope('bar', bar => {
   *     // DELETE /bar/baz    before1(); before2(); deleteHandler(); after()
   *     bar.delete('/baz', deleteHandler)
   *   })
   * })
   * // Output on GET /foo request:
   * // > That is before 1
   * // > Second before
   * // > get foo
   * // > Just after request
   *
   * // Output on DELETE /bar/baz
   * // > That is before 1
   * // > Second before
   * // > DELETE requested
   * // > Just after request
   */
  afterEach(...list) {
    this.ctx.after = this.ctx.after.concat(list.filter(ln => !!ln))
  }

  /**
   * Add scoped address, before/after handlers and simple handlers.<br/>
   * Before/After handlers is inherits from parent scope.<br/>
   * Scopes with the same name will be merged
   *
   * @param {string} name Name of the scope
   * @param {function(scope: Maker): void} creator
   * @throws {Error} "Name of the scope should be a word"
   * @throws {TypeError} "Name of the scope should be string!"
   * @return {void}
   * @since 0.2.0
   * @example
   * const before1 = () => console.log('before1')
   * const before2 = () => console.log('before2')
   * const after1 = () => console.log('after1')
   * const after2 = () => console.log('after2')
   * const bazHandler = () => console.log('baz')
   * const barHandler = () => console.log('bar')
   *
   * createRest(root => {
   *   root.beforeEach(before1)
   *   root.afterEach(after1)
   *
   *   // POST /baz   before1(); bazHandler(); after1()
   *   root.post('baz', bazHandler)
   *
   *   root.scope('foo', foo => {
   *     foo.beforeEach(before2)
   *     foo.afterEach(after2)
   *
   *     // GET /foo/bar   before1(); before2(); barHandler(); after2(); after1()
   *     foo.get('bar', barHandler)
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

    const scopedCtx = this.ctx.scoped[name] || new Maker()
    creator(scopedCtx)
    this.ctx.scoped[name] = scopedCtx
  }

  /**
   * Add HTTP method listeners to local
   *
   * @private
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
   * @param {Function[]} listeners
   */
  method(method, _listeners) {
    let name = ''
    let listeners = _listeners
    if (typeof listeners[0] === 'string') {
      [name] = listeners.splice(0, 1)
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
   * createRest(root => {
   *   root.post('name', () => console.log('Handled post /name request'))
   *   root.post(() => console.log('Handled post / request'))
   *   root.post('create',
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
   * @desc Configure your `crud('name', controller, options)` <br /> See {@link Maker.crud}
   * @typedef {object} crudOptions
   * @property {string[]} [only] Keep only that handlers: `read`, `create`, `update`, `destroy`
   * @property {string[]} [except] Keep all except that handlers
   * @property {object} [methodNames] Change method names
   * @since 0.9.0
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
   * Add CRUD methods for single resource. <br/>
   * CRUD methods not merging. __Use only one crud for path.__
   * @param {string} name Name of the resource. Create route path from
   * @param {CrudController} controller Object with methods
   * @param {crudOptions} [options={}] Options object
   * @param {function(scope: Maker): void} [creator=null] Scoped creator function
   * @since 0.9.0
   * @example <caption>Simple</caption>
   * const Controller = {
   *   read() {},
   *   create() {},
   *   update() {},
   *   destroy() {},
   *   beforeEach() {},
   *   afterEach() {},
   * }
   * const routes = createRest(root => {
   *   // GET /example     read()
   *   // POST /example    create()
   *   // PUT /example     update()
   *   // DELETE /example  destroy()
   *   root.crud('example', Controller)
   * })
   * @example <caption>Only/Except option</caption>
   * const Controller = {
   *   read() {},
   *   create() {},
   *   update() {},
   *   destroy() {},
   *   beforeEach() {},
   *   afterEach() {},
   * }
   * const routes = createRest(root => {
   *   // GET /demo    read()
   *   // POST /demo   create()
   *   root.crud('demo', Controller, { only: ['create', 'read'] })
   *
   *   // GET /single     read()
   *   // PUT /single     update()
   *   root.crud('single', Controller, { except: ['destroy', 'create'] })
   * })
   * @example <caption>With scope</caption>
   * const routes = createRest(root => {
   *   // GET /example
   *   // POST /example
   *   // PUT /example
   *   // DELETE /example
   *   root.crud('example', Controller, {}, example => {
   *     // GET /example/demo
   *     example.get('/demo', () => {})
   *   })
   * })
   */
  crud(name, controller, options = {}, creator = null) {
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

    const resolveMethodName = (handler, currentController) =>
      options.methodNames && options.methodNames[handler]
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

    this.scope(name, (scope) => {
      scope.beforeEach(controller.beforeEach)
      scope.afterEach(controller.afterEach)

      usedList
        .filter(handler => methodsList.includes(handler))
        .map(handler => [handler, methods[handler]])
        .forEach(([handler, httpMethod]) => {
          scope[httpMethod](resolveMethodName(handler, controller))
        })

      if (creator) {
        creator(scope)
      }
    })
  }

  /**
   * Configure your `resources('name', controller, options)`
   * <br/> You can't use `except` and `only` at the same time
   * <br/> Available handlers: `index`, `read`, `create`, `update`, `patch`, `destroy`
   * @typedef {object} resourcesOptions
   * @property {string[]} [only] Keep only that handlers
   * @property {string[]} [except] Keep all except that handlers
   * @property {string} [memberId] Change :memberId in the URI
   * @since 0.9.0
   *
   * @example <caption>Usage with `only`</caption>
   * createRest(root => {
   *   // GET /books          -> index()
   *   // GET /books/:bookId  -> read()
   *   root.resources('books', BooksController, { only: ['read', 'index'] })
   * })
   *
   * @example <caption>Usage with `except`</caption>
   * createRest(root => {
   *   // GET /songs              -> index()
   *   // POST /songs             -> create()
   *   // GET /songs/:songId      -> read()
   *   // PATCH /songs/:songId    -> patch()
   *   root.resources('songs', SongsController, { except: ['destroy', 'update'] })
   * })
   *
   * @example <caption>With beforeEach afterEach methods</caption>
   * const Controller = {
   *   beforeEach() {},
   *   afterEach() {},
   *   create() {},
   *   read() {},
   * }
   * // If controller no methods, no handlers creates
   *
   * createRest(root => {
   *   // GET /demo   beforeEach(); read(); afterEach()
   *   // POST /demo  beforeEach(); create(); afterEach()
   *   root.crud('demo', Controller)
   * })
   *
   * @example <caption>Member ID renaming</caption>
   * createRest(root => {
   *   // GET /images            -> index()
   *   // POST /images           -> create()
   *   // GET /images/:imgid     -> read()
   *   // PUT /images/:imgid     -> update()
   *   // PATCH /images/:imgid   -> patch()
   *   // DELETE /images/:imgid  -> destroy()
   *   root.resources('images', ImagesController, { memberId: 'imgid' })
   * })
   */

  /**
   * Add index, create, read, update, patch, remove methods to manage resource <br/>
   * See {@link ResourcesController} and {@link resourcesOptions}
   * @param {string} name Name of the resources. Path created from. Example: `books`
   * @param {ResourcesController} controller Object with methods
   * @param {resourcesOptions} [options={}] Options for resources
   * @param {function(scope: Maker): void} [creator=null] Scoped creator function
   * @return {void}
   * @throws {Error} "Resources should be named"
   * @throws {Error} "You can't use 'except' and 'only' options at the same time"
   * @throws {TypeError} "Controller should be object"
   *
   * @example <caption>Full example</caption>
   * createRest(root => {
   *   // GET /users             -> index()
   *   // POST /users            -> create()
   *   // GET /users/:userId     -> read()
   *   // PUT /users/:userId     -> update()
   *   // PATCH /users/:userId   -> patch()
   *   // DELETE /users/:userId  -> destroy()
   *   root.resources('users', UsersController)
   * })
   */
  resources(name, controller, options = {}, creator = null) {
    /**
     * index : get /
     * create : post /
     * read : get /:id
     * update : put /:id
     * patch : patch /:id
     * remove : delete /:id
     */
    if (!name || name.length === 0) {
      throw new Error('Resources should be named')
    }

    if (!controller || typeof controller !== 'object') {
      throw new TypeError('Controller should be object')
    }

    if (typeof options === 'function') {
      /* eslint-disable no-param-reassign */
      creator = options
      options = {}
      /* eslint-enable no-param-reassign */
    }

    if (options.only && options.except) {
      throw new Error('You can\'t use \'except\' and \'only\' options at the same time')
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

    this.scope(name, (scope) => {
      scope.beforeEach(controller.beforeEach)
      scope.afterEach(controller.afterEach)

      if (checkMethod('index')) {
        scope.get('/', controller.index)
      }

      if (checkMethod('create')) {
        scope.post('/', controller.create)
      }

      scope.scope(`:${memberId}`, (member) => {
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

      if (creator) {
        creator(scope)
      }
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
