/**
 * @private
 */
const push = source => item => source.push(item)

/**
 * Create route with path as key
 * @private
 */
const createFlatten = ({ path, method, handlers }) => {
  console.log('\n\ncreateFlatten()', { path, method, handlers })
  const obj = {}
  obj[path] = { method, handlers }
  return obj
}

/**
 * @private
 * @param {Context} context
 * @return {Object[]} Array of a merged route objects with parent
 */
function flattenCurrentRoutes(context) {
  return context.routes.map(route => ({
    path: [context.path, route.path].join('/'),
    method: route.method,
    handlers: [].concat(context.before, route.handlers, context.after),
  }))
}

/**
 * @private
 */
function convertRoutes(context, parent) {
  console.log('\n\nconvertRoutes()', '<', context, '::', parent, '>')
  const result = []

  flattenCurrentRoutes(context).forEach(push(result))

  context.childs.map(child => convertRoutes(child, context))
    .forEach(push(result))

  return result
}

/**
 * Converts REST object from `createRest` to Key: Value object
 * When `Key` is a full URI, `Value` - is route definition
 * @param {Context} routes Exists REST object
 * @return {Object} kVRouteDefinition
 */
export function flattenRoutes(route) {
  return convertRoutes(route, { before: [], after: [], routes: [], childs: [], path: '' })
    .reduce((acc, curr) => Object.assign({}, acc, createFlatten(curr)), {})
}
