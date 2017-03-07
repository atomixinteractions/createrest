import { addRoute } from '../context'

/**
 * @param {string} name
 * @param {(Function|Function[])} handlers
 */
export default function patch(name, handlers) {
  return addRoute('PATCH', name, handlers)
}
