import pluralize from 'pluralize'
import { addRoute, createContext, addChildContext } from '../context'

/**
 * @typedef {Object} ResourcesConfig
 * @property {string[]} [only]            Create only that routes
 * @property {string[]} [except]          That routes that will not be created
 * @property {string} [memberId]          Change resource ID name in URI
 * @example
 * { only: ['index', 'read'] }
 * { except: ['patch', 'destroy'] }
 * { memberId: '' }
 */

const routes = [
  ['index', 'GET', ''],
  ['create', 'POST', ''],
  ['read', 'GET', ':id'],
  ['update', 'PUT', ':id'],
  ['patch', 'PATCH', ':id'],
  ['destroy', 'DELETE', ':id'],
]

const defaultConfig = {
}

/**
 * Creates a set of routes that describe the list of resources
 * @param {string} name                         Base name in lowercase. From name a path and memberId will be created.
 * @param {ResourcesConfig} configuration       Setup for resource
 * @param {Object} controller                   Object with handlers
 * @param {Function} [createChilds]             Childs will be added to resource root
 * @example
 * resources('article', {}, ArticlesController)
 *
 * @example
 * resources('publisher', {}, PublishersController, childs(
 *   member(
 *     resources('magazine', {}, MagazinesController, childs(
 *       member(
 *         resources('photo', {}, PhotosController),
 *         resources('article', {}, ArticleController)
 *       )
 *     ))
 *   )
 * ))
 */
export default function resources(name, configuration, controller, createChilds) {
  const config = Object.assign({}, defaultConfig, configuration)
  const pluralizedName = pluralize(name, 5)
  const insetContext = createContext(pluralizedName)
  let targetRoutes = routes.concat([])

  insetContext.controller = controller

  if (config.only) {
    targetRoutes = routes.filter(route => config.only.includes(route[0]))
  }
  else if (config.except) {
    targetRoutes = routes.filter(route => !config.only.includes(route[0]))
  }

  if (config.memberId) {
    insetContext.memberId = `:${config.memberId}Id`
  }
  else {
    insetContext.memberId = `:${name}Id`
  }

  targetRoutes.forEach(([methodName, httpMethod, path]) => {
    const method = controller[methodName]
    let handlers = []

    if (config.before) {
      handlers = handlers.concat(config.before)
    }

    handlers.push(method)

    if (config.after) {
      handlers = handlers.concat(config.after)
    }

    addRoute(httpMethod, path.replace(`:id`, insetContext.memberId), handlers)(insetContext)
  })

  if (createChilds) {
    createChilds(insetContext)
  }

  return addChildContext(insetContext)
}
