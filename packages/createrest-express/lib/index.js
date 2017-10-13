import { Router } from 'express'
import { flattenRoutes, isCreateRestInstance } from 'createrest'


export function createExpressMiddleware(routing) {
  if (!isCreateRestInstance(routing)) {
    throw new TypeError('You can create express middleware only for createRest routes')
  }
  const router = Router()

  const flat = flattenRoutes(routing)
  Object.keys(flat).forEach((path) => {
    const methods = flat[path]

    Object.keys(methods).forEach((method) => {
      router[method.toLowerCase()](path, ...methods[method])
    })
  })

  return router
}
