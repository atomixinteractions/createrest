import { createContext } from './context'

/**
 * Defines your routes
 *
 * @param {Object} config Root configuration
 * @param {Function} applyRoot Main childs for root `childs()`
 * @example
 * const routes = createRest({}, childs(
 *   resources('article', {}, ArticlesController)
 * ))
 */
export function createRest(config, applyRoot) {
  const context = createContext()

  applyRoot(context)

  return context
}

export { printRoutes } from './printer'
export {
  childs,
  get,
  post,
  put,
  patch,
  destroy,
  scope,
  resources,
  resource,
  member,
} from './creators'
