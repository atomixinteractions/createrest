
/**
 * @namespace context
 */

/**
 * @typedef {Object} Context
 * @property {string} path
 * @property {Function[]} before
 * @property {Function[]} after
 * @memberof context
 */

/**
 * @memberof context
 * @param {string} path
 * @return {Context}
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
 * @memberof context
 * @param {string} method
 * @param {string} path
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

/**
 * @memberof context
 * @param {Context} childContext
 */
export function addChildContext(childContext) {
  return context => {
    context.childs.push(childContext)
  }
}

