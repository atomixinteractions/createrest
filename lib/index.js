import { createContext } from './context'

/**
 * @typedef {Object} RestConfig
 * @property {Function[]} [before]
 * @property {Function[]} [after]
 */

/**
 * Defines your routes
 *
 * @param {RestConfig} config Root configuration
 * @param {Function} applyRoot Main childs for root `childs()`
 * @return {Context} New REST object
 * @example
 * const routes = createRest({}, childs(
 *   resources('article', {}, ArticlesController)
 * ))
 */
export function createRest(config, applyRoot) {
  const context = createContext()

  if (config.before) context.before = config.before
  if (config.after) context.after = config.after

  applyRoot(context)

  return context
}

export { flattenRoutes } from './flatten'
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
