import Router from 'koa-router'
import { flattenRoutes, isCreateRestInstance } from 'createrest'


export function createKoaRouter(routing) {
  if (!isCreateRestInstance(routing)) {
    throw new TypeError('You can create koa middleware only from createRest routes')
  }

  const router = new Router()

  const flat = flattenRoutes(routing)
  Object.keys(flat).forEach((path) => {
    const methods = flat[path]

    Object.keys(methods).forEach((method) => {
      router[method.toLowerCase()](path, ...methods[method])
    })
  })

  return router
}
