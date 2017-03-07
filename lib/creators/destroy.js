import { addRoute } from '../context'

/**
 * @memberof createrest
 * @param {string} name
 * @param {(Function|Function[])} handlers
 */
export default function destroy(name, handlers) {
  return addRoute('DELETE', name, handlers)
}
