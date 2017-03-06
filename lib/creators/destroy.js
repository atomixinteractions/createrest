import { addRoute } from '../context'


export default function destroy(name, handlers) {
  return addRoute('DELETE', name, handlers)
}
