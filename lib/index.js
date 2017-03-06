import { createContext } from './context'

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
  member,
} from './creators'
