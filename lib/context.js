
/**
 *
 * @param {String} path
 */
export function createContext(path = '') {
  return {
    path,
    before: [],
    after: [],
    routes: [],
    childs: [],
  }
}

/**
 *
 * @param {String} method
 * @param {String} path
 * @param {(Function[]|Function)} handler
 */
export function addRoute(method, path, handler = []) {
  const handlers = Array.isArray(handler) ? handler : [handler]

  return context => {
    context.routes.push({
      method,
      path,
      handlers,
    })

    return context
  }
}

export function addChildContext(childContext) {
  return context => {
    context.childs.push(childContext)
  }
}

