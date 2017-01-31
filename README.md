# Restified

Declare your routes


## Warning!

> That middleware now in development! Do not use it in production (only before v1 release)


## Usage example

```js
import Restified from 'restified'

import {
  BooksController,
  SectionsController,
  DemosController,
  LikeController,
  ProfileController,
  BookmarksController,
} from './controllers'

const router = Restified()


router.root(r => {
  r.resources('book', {}, BooksController)
  // get /books             -> BooksController.#index
  // post /books            -> BooksController.#create
  // get /books/:bookId     -> BooksController.#read
  // put /books/:bookId     -> BooksController.#update
  // patch /books/:bookId   -> BooksController.#update
  // delete /books/:bookId  -> BooksController.#destroy

  r.resources('section', { only: ['index', 'read'] }, SectionsController)
  // get /sections              -> SectionsController.#index
  // get /sections/:sectionId   -> SectionsController.#read

  r.resources('demo', {}, DemosController, r => {
    r.member.post('close')
    r.member.post('open', { methodName: 'reopen' })

    r.resource('like', LikeController)
  })
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

  r.resource('profile', {}, ProfileController, r => {
    r.resources('bookmark', { memberId: 'id' }, BookmarksController, r => {
      r.member({}, r => {
        r.resource('share_link', BookmarksController.ShareLinkController)
      })
    })
  })
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
})

export default router.expressMiddleware()

// or for Koa
// export default router.koaMiddleware()

```


## CLI

```bash
restified               # Show man page
restified init          # Create main files
restified routes        # Show routes
```