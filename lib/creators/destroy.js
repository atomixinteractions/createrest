import { addRoute } from '../context'

/**
 * @param {string} name
 * @param {(Function|Function[])} handlers
 */
export default function destroy(name, handlers) {
  return addRoute('DELETE', name, handlers)
}
