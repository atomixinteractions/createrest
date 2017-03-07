import { addRoute } from '../context'

/**
 * Create POST handler
 * @param {String} name URI part
 * @param {(Function|Function[])} [handlers] Request handlers. If not defined will resolve from resource/resources
 * @example
 * post('foo', myHandlerName)
 *
 * @example
 * post('create', [authUser, parseBody, validateData, handlePostCreate])
 *
 * @example
 * resources('repo', {}, ArticlesController, childs(
 *   post('create_example'),
 *   member(
 *     post('fork')
 *   )
 * ))
 */
export default function post(name, handlers) {
  return addRoute('POST', name, handlers)
}
