import pluralize from 'pluralize'
import { addRoute, createContext, addChildContext } from '../context'


/**
 * @typedef {Object} ResourcesConfig
 * @property {String[]} [only]
 * @property {String[]} [except]
 * @property {String} [memberId]
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
 *
 * @param {String} name
 * @param {ResourcesConfig} _config
 * @param {Object} controller
 * @param {Function} createChilds
 */
export default function resources(name, _config, controller, createChilds) {
  const config = Object.assign({}, defaultConfig, _config)
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
