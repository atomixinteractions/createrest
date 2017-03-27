const {
  createRest,
  printRoutes,
  flattenRoutes,
  get,
  post,
  put,
  patch,
  destroy,
  scope,
  childs,
  resources,
  resource,
  member,
} = require('../dist/index')


const routes = {
  childs: {
    users: {
      generate: 'resources',
      controller: 'Users',
      id: 'username',
      only: ['read', 'index'],
      before: [],
      after: [],
      childs: {},
      member: {
        followers: {
          generate: 'get',
          handler: 'followersList',
        },
        following: {
          generate: 'resources',
          handler: 'followingList',
        },
      },
    },
    user: {
      generate: 'resource',
      controller: 'CurrentUser',
      only: ['read', 'update'],
      before: [],
      after: [],
      childs: {
        emails: {
          generate: 'resource',
          controller: 'CurrentUserEmails',
          // only: ['read', 'create', 'destroy'],
          except: ['update'],
          before: [],
          after: [],
          childs: {
            // visibility: {
            //   generate: 'handlers',
            //   handlers: {
            //     PATCH: {
            //       name: 'toggleVisibility',
            //     },
            //   },
            // },
            visibility: {
              generate: 'patch',
              handler: 'toggleVisibility',
              // controller will auto resolved
            },
          },
        },
        followers: {
          generate: 'get',
          handler: 'myFollowers',
        },
        following: {
          generate: 'resources',
          controller: 'UserFollowing',
          only: ['index', 'read'],
          id: 'username',
        },
      },
    },
  },
}

const routesGenerated = createRest({},
  resources('users', { id: 'username', only: ['read', 'index'] }),
  resource('user', { controller: 'CurrentUser', only: ['read', 'update'] },
    resource('emails', { except: ['update'] },
      // handlers('visibility', {}, { PATCH: { name: 'toggleVisibility' } })
      patch('visibility', { handler: 'toggleVisibility' })
    )
  )
)

console.log(routes, routesGenerated)
