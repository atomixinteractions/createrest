import { addRoute } from '../context'


export default function put(name, handlers) {
  return addRoute('PUT', name, handlers)
}
