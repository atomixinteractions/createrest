import { createContext, addChildContext } from '../context'


export default function scope(name, createChilds) {
  const scopedContext = createContext(name)

  createChilds(scopedContext)

  return addChildContext(scopedContext)
}
