/**
 * @namespace printer
 */

/**
 * @memberof printer
 * @param {string[]} path
 * @param {string} method
 * @param {Function[]} handlers
 */
function print(path, method, handlers) {
  const handlersNames = handlers.map(handler => `${handler.name}()`).join(', ')

  console.log(method.toUpperCase(), path.join('/'), '->', handlersNames)
}

/**
 * @memberof printer
 * @param {Object} routes
 */
export function printRoutes(context, path = []) {
  const fullPath = path.concat(context.path)

  context.routes.forEach(route =>
    print(fullPath.concat(route.path), route.method, route.handlers)
  )

  context.childs.forEach(child =>
    printRoutes(child, fullPath)
  )
}
