import { isCreateRestInstance } from './index'

/**
 * Recursive flatten
 * @private
 * @param {RestRoutes} routes Routes object from `createRest()`
 * @param {string} prefix Add prefix to each route path
 * @param {RestRoutes} parent Parent routes
 */
function flattenize(routes, prefix, parent) {
  const list = {}

  Object.keys(routes.local).forEach((method) => {
    const localName = prefix === '' ? '/' : `${prefix}/`

    if (!list[localName]) {
      list[localName] = {}
    }
    list[localName][method] = [].concat(
      parent.before,
      routes.before,
      routes.local[method],
      routes.after,
      parent.after
    )
  })

  Object.keys(routes.scoped).forEach((scope) => {
    const scoped = routes.scoped[scope]
    const listeners = flattenize(scoped, `${prefix}/${scope}`, {
      before: parent.before.concat(routes.before),
      after: routes.after.concat(parent.after),
    })

    Object.assign(list, listeners)
  })

  return list
}

/**
 * Convert original deep routes to flat object
 * @param {RestRoutes} routes Original routes from `createRest()`
 * @return {object} Flattened routes object
 * @example
 * const handler = () => {}
 * const routes = createRest(r => { r.get('foo', handler) })
 * const flatRoutes = flattenRoutes(routes)
 *
 * test.deepEqual(
 *   flatRoutes,
 *   {
 *     '/foo/': {
 *       GET: [handler],
 *     },
 *   },
 * )
 */
export function flattenRoutes(routes) {
  if (!isCreateRestInstance(routes)) {
    throw new Error('You can flatten only createRest routes')
  }
  return flattenize(routes, '', { before: [], after: [] })
}
