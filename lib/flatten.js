function flattenize(routes, prefix, parent) {
  const list = {}

  Object.keys(routes.local).forEach(method => {
    const localName = prefix === '/' ? '/' : `${prefix}/`
    list[localName] = {
      method,
      listeners: [].concat(
        parent.before,
        routes.before,
        routes.local[method],
        routes.after,
        parent.after
      ),
    }
  })

  Object.keys(routes.scoped).forEach(scope => {
    const scoped = routes.scoped[scope]
    const listeners = flattenize(scoped, `${prefix}/${scope}`, {
      before: parent.before.concat(routes.before),
      after: routes.after.concat(parent.after),
    })
    Object.assign(list, listeners)
  })

  return list
}

export function flattenRoutes(routes) {
  return flattenize(routes, '', { before: [], after: [] })
}
