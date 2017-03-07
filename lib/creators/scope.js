import { createContext, addChildContext } from '../context'

/**
 * @param {string} name
 * @param {Function} createChilds
 */
export default function scope(name, createChilds) {
  const scopedContext = createContext(name)

  createChilds(scopedContext)

  return addChildContext(scopedContext)
}
