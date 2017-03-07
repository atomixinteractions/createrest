import { addRoute } from '../context'

/**
 * Create PUT handler
 * @param {String} name URI part
 * @param {(Function|Function[])} [handlers] Request handlers. If not defined will resolve from resource/resources
 * @example
 * put('foo', myHandlerName)
 *
 * @example
 * put('rand', [authUser, parseBody, validateData, handlePutRand])
 */
export default function put(name, handlers) {
  return addRoute('PUT', name, handlers)
}
