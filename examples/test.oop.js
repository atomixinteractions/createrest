class SectionsController {}
class BooksController {}
class DemosController {}
class LikeController {}
class ProfileController {}
class BookmarksController {}
function createRest() {}

const router = createRest()
module.exports = router

router.root(r => {
  r.resources('book', {}, BooksController)
  r.resources('section', { only: ['index', 'read'] }, SectionsController)

  r.resources('demo', {}, DemosController, r => {
    r.member.post('close')
    r.member.post('open', { methodName: 'reopen' })

    r.resource('like', {}, LikeController)
  })

  r.resource('profile', {}, ProfileController, r => {
    r.resources('bookmark', { memberId: 'id' }, BookmarksController, r => {
      r.member({}, r => {
        r.resource('share_link', {}, BookmarksController.ShareLinkController)
      })
    })
  })

  r.scope('admin', r => {

  })
})


