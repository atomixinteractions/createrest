import { addRoute } from '../context'

/**
 * @memberof createrest
 * @param {string} name
 * @param {(Function|Function[])} handlers
 */
export default function patch(name, handlers) {
  return addRoute('PATCH', name, handlers)
}
