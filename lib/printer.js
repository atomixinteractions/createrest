import { flattenRoutes } from './flatten'

/**
 * @namespace printer
 */

/**
 * @memberof printer
 * @param {string} path
 * @param {string} method
 * @param {Function[]} handlers
 */
function print(path, method, handlers) {
  const handlersNames = handlers.map(handler => `${handler ? handler.name : '<function>'}()`).join(', ')

  /* eslint-disable no-console */
  console.log(method.toUpperCase(), path, '->', handlersNames)
  /* eslint-enable no-console */
}

/**
 * @memberof printer
 * @param {Object} routes
 */
export function printRoutes(routes) {
  const flat = flattenRoutes(routes)

  Object.keys(flat)
    .forEach(path => {
      const ro = flat[path]
      print(path, ro.method, ro.listeners)
    })
}
