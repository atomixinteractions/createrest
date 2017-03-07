import pluralize from 'pluralize'
import { addRoute, createContext, addChildContext } from '../context'


/**
 * @typedef {Object} ResourceConfig
 * @property {string[]} [only]            Create only that routes
 * @property {string[]} [except]          That routes that will not be created
 * @example
 * { only: ['index', 'create'] }
 * { except: ['update', 'destroy'] }
 */



const routes = [
  ['index', 'GET'],
  ['create', 'POST'],
  ['update', 'PUT'],
  ['destroy', 'DELETE'],
]

const defaultConfig = {
}

/**
 * Creates a set of routes that describe single resource
 * @param {string} name                         Base name in lowercase. From name a path will be created.
 * @param {ResourceConfig} configuration        Setup for resource
 * @param {Object} controller                   Object with handlers
 * @param {Function} [createChilds]             Childs will be added to resource root
 * @example
 * resource('profile', {}, ProfileController)
 */
export default function resource(name, configuration, controller, createChilds) {
  const config = Object.assign({}, defaultConfig, configuration)
  const insetContext = createContext(name)
  let targetRoutes = routes.concat([])

  insetContext.controller = controller

  if (config.only) {
    targetRoutes = routes.filter(route => config.only.includes(route[0]))
  }
  else if (config.except) {
    targetRoutes = routes.filter(route => !config.only.includes(route[0]))
  }

  targetRoutes.forEach(([methodName, httpMethod]) => {
    const method = controller[methodName]
    let handlers = []

    if (config.before) {
      handlers = handlers.concat(config.before)
    }

    handlers.push(method)

    if (config.after) {
      handlers = handlers.concat(config.after)
    }

    addRoute(httpMethod, '', handlers)(insetContext)
  })

  if (createChilds) {
    createChilds(insetContext)
  }

  return addChildContext(insetContext)
}
