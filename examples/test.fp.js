
function createRest() {}
function resources() {}
function resource() {}
function member() {}
function childs() {}
function scope() {}
function root() {}
function post() {}
function get() {}
function destroy() {}
function put() {}
function patch() {}

class SectionsController {}
class BooksController {}
class DemoController {}
class LikeController {}
class ProfileController {}
class PagesController {}
class BookmarksController {}

module.exports = createRest(
  root(
    resources('book', { validate: mySuperValidateFunction }, BooksController),
    resources('section', { only: ['index', 'read'] }, SectionsController),
    resources('demo', {}, DemoController, childs(
      member(
        get('status'),
        post('close'),
        post('open', { methodName: 'reopen' }),
      ),
      resource('like', {}, LikeController),
    )),
    resource('profile', {}, ProfileController, childs(
      resources('bookmark', { memberId: 'id' }, BookmarksController, childs(
        member(
          resource('share_link', {}, BookmarksController.ShareLinkController),
        ),
      )),
    )),
    scope('admin', childs(
      post('login'),
      post('logout'),
      resources('pages', {}, PagesController),
      scope('status', childs(
        get('database'),
        get('service'),
        get('redis'),
      )),
    )),
  ),
)


const SimpleController = {
  read() {},
  create() {},
  update() {},
  destroy() {},
}

const myValidations = (req, res, next) => {
  // validations
  next()
}

createRest(
  resource('simple', { before: [myValidations] }, SimpleController),
)

