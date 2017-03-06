import { addRoute } from '../context'


export default function get(name, handlers) {
  return addRoute('GET', name, handlers)
}
