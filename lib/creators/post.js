import { addRoute } from '../context'


export default function post(name, handlers) {
  return addRoute('POST', name, handlers)
}
