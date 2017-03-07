import { addRoute } from '../context'

/**
 * @memberof createrest
 * @param {string} name
 * @param {(Function|Function[])} handlers
 */
export default function get(name, handlers) {
  return addRoute('GET', name, handlers)
}
