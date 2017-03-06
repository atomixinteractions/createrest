import { addRoute } from '../context'


export default function patch(name, handlers) {
  return addRoute('PATCH', name, handlers)
}
