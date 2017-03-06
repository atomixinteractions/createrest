import { createContext } from './context'

export function createRest(config, applyRoot) {
  const context = createContext()

  applyRoot(context)

  return context
}



export { root, get, post, put, patch, destroy } from './creators'
