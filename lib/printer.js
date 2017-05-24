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

  return `${method.toUpperCase()} ${path} -> ${handlersNames}`
}

/**
 * @memberof printer
 * @param {Object} routes
 */
export function printRoutes(routes, realPrint = true) {
  const flat = flattenRoutes(routes)
  const lines = []

  Object.keys(flat)
    .forEach(path => {
      const methods = flat[path]

      Object.keys(methods).forEach(method => {
        lines.push(print(path, method, methods[method]))
      })
    })

  if (realPrint) {
    // eslint-disable-next-line no-console
    console.log(lines.join('\n'))
  }

  return lines
}
