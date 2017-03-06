
class BaseRouter {
  constructor(parent) {
    this.parent = parent
    this.routes = {}
  }

  createSimpleRoute(method, route, originOptions) {
    const options = Object.assign({}, {
      methodName: route,
    }, originOptions)
    this.router[method + ':' + router] = options
  }

  get(route, options) {
    this.createSimpleRoute('get', route, options)
  }

  post(route, options) {
    this.createSimpleRoute('post', route, options)
  }

  put(route, options) {
    this.createSimpleRoute('put', route, options)

    if (!options.noPatch) {
      this.patch(route, options)
    }
  }

  patch(route, options) {
    this.createSimpleRoute('patch', route, options)
  }

  delete(route, options) {
    this.createSimpleRoute('delete', route, options)
  }
}

class RestifiedRouter {
  constructor() {
    this.router = new BaseRouter(this)
  }

  root(callback) {
    callback(this.router)
  }

  controller(controller) {
    this.controller = controller
  }

  expressMidleware() {
  }

  printRoutes(from, root = '/') {
    const origRouter = from || this.router
    Object.keys(origRouter.routes)
      .forEach(router => {
        const [method, route] = router.split(':')
        const options = origRouter.routes[router]

        console.log(method.toUpperCase(), root + route, options)
      })
  }
}

module.exports = function restified() {
  return new RestifiedRouter()
}