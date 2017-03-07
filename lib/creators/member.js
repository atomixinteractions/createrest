import { createContext, addChildContext } from '../context'
import childs from './childs'

/**
 * @memberof createrest
 * @param {Function[]} funcs
 */
export default function member(...funcs) {
  return context => {
    const { memberId } = context
    const insetContext = createContext(memberId)

    childs(...funcs)(insetContext)
    addChildContext(insetContext)(context)
  }
}
