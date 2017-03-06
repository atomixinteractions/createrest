# createrest

Declare your routes


## Warning!

> That middleware now in development! Do not use it in production (only before v1 release)


## Usage example

```js
import { createRest, root, resources, member, get, post, resource, member, childs, scope } from 'createrest'
import createExpressMiddleware from 'createrest-express'

import {
  BooksController,
  SectionsController,
  DemosController,
  LikeController,
  ProfileController,
  BookmarksController,
} from './controllers'


const router = createRest({ before: [myLoggerFunction] },
  root(
    resources('book', { before: [mySuperValidateFunction] }, BooksController),
    // get /books             -> BooksController.#index
    // post /books            -> BooksController.#create
    // get /books/:bookId     -> BooksController.#read
    // put /books/:bookId     -> BooksController.#update
    // patch /books/:bookId   -> BooksController.#update
    // delete /books/:bookId  -> BooksController.#destroy

    resources('section', { only: ['index', 'read'] }, SectionsController),
    // get /sections              -> SectionsController.#index
    // get /sections/:sectionId   -> SectionsController.#read

    resources('demo', {}, DemoController, childs(
      member(
        get('status'),
        post('close'),
        post('open', { methodName: 'reopen' }),
      ),
      resource('like', {}, LikeController),
    )),
    // get /demos             -> DemosController.#index
    // post /demos            -> DemosController.#create
    // get /demos/:demoId     -> DemosController.#read
    // put /demos/:demoId     -> DemosController.#update
    // patch /demos/:demoId   -> DemosController.#update
    // delete /demos/:demoId  -> DemosController.#destroy
    // post /demos/:demoId/close    -> DemosController.#close
    // post /demos/:demoId/open     -> DemosController.#reopen
    // get /demos/like      -> LikeController.#read
    // post /demos/like     -> LikeController.#create
    // put /demos/like      -> LikeController.#update
    // delete /demos/like   -> LikeController.#destroy

    resource('profile', {}, ProfileController, childs(
      resources('bookmark', { memberId: 'id' }, BookmarksController, childs(
        member(
          resource('share_link', {}, BookmarksController.ShareLinkController),
        ),
      )),
    )),
    // get /profile                -> ProfileController.#read
    // post /profile               -> ProfileController.#create
    // put /profile                -> ProfileController.#update
    // delete /profile             -> ProfileController.#destroy
    // get /profile/bookmarks             -> BookmarksController.#index
    // post /profile/bookmarks            -> BookmarksController.#create
    // get /profile/bookmarks/:id         -> BookmarksController.#read
    // put /profile/bookmarks/:id         -> BookmarksController.#update
    // patch /profile/bookmarks/:id       -> BookmarksController.#update
    // delete /profile/bookmarks/:id      -> BookmarksController.#destroy
    // get /profile/bookmarks/:id/share_link      -> BookmarksController.ShareLinkController.#read
    // post /profile/bookmarks/:id/share_link      -> BookmarksController.ShareLinkController.#create
    // patch /profile/bookmarks/:id/share_link      -> BookmarksController.ShareLinkController.#update
    // delete /profile/bookmarks/:id/share_link      -> BookmarksController.ShareLinkController.#destroy

    scope('admin', childs(
      post('login', LoginController.login),
      post('logout', LoginController.logout),
      resources('page', {}, PagesController),
      scope('status', { controller: StatusController }, childs(
        get('database'),
        get('service'),
        get('redis'),
      )),
    )),
    // get /admin/login       -> LoginController.#login
    // post /admin/login      -> LoginController.#logout
    // get /admin/pages             -> PagesController.#index
    // post /admin/pages            -> PagesController.#create
    // get /admin/pages/:id         -> PagesController.#read
    // put /admin/pages/:id         -> PagesController.#update
    // patch /admin/pages/:id       -> PagesController.#update
    // delete /admin/pages/:id      -> PagesController.#destroy
    // get /admin/status/database       -> StatusController.#database
    // get /admin/status/service        -> StatusController.#service
    // get /admin/status/redis          -> StatusController.#redis
  ),
)

export default createExpressMiddleware(router)

```


## CLI

```bash
rest               # Show man page
rest init          # Create main files
rest routes        # Show routes
```

or with alias: `createrest`
