import { addRoute } from '../context'

/**
 * @param {string} name
 * @param {(Function|Function[])} handlers
 */
export default function get(name, handlers) {
  return addRoute('GET', name, handlers)
}
