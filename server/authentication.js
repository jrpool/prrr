import express from 'express'
import passport from 'passport'
import Queries from './queries'
import Commands from './commands'

let GITHUB_CLIENT_ID
let GITHUB_CLIENT_SECRET
let GITHUB_CALLBACK

if (process.env.NODE_ENV === 'test'){
  GITHUB_CLIENT_ID     = 'FAKE_GITHUB_CLIENT_ID'
  GITHUB_CLIENT_SECRET = 'FAKE_GITHUB_CLIENT_SECRET'
  GITHUB_CALLBACK      = 'http://example.com/oauth_callback'
}else{
  GITHUB_CLIENT_ID     = process.env.GITHUB_CLIENT_ID
  GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET
  GITHUB_CALLBACK      = process.env.GITHUB_CALLBACK
}

const router = new express.Router()

const GitHubStrategy = require('passport-github').Strategy

passport.use(
  new GitHubStrategy({
    clientID:     GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL:  GITHUB_CALLBACK,
    scope: ['user:email', 'repo'],
  },
  function(accessToken, refreshToken, profile, cb) {
    new Commands().findOrCreateUserFromGithubProfile({accessToken, refreshToken, profile})
      .then(user => {
        cb(undefined, user);
      })
      .catch(error => {
        cb(error)
      })
  }
));

passport.serializeUser(function(user, done) {
  done(null, {github_id: user.github_id});
});

passport.deserializeUser(function(user, done) {
  done(null, user)
});


router.use('/login', (req, res, next) => {
  req.session.redirectTo = req.query.r
  next()
})

router.get('/login', passport.authenticate('github'));


router.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect(req.session.redirectTo || '/')
  }
)

router.get('/logout', (req, res, next) => {
  req.logout()
  res.redirect('/')
});


if(process.env.NODE_ENV === 'test') {
  router.get('/__login/:githubId', (request, response) => {
    const { githubId } = request.params

    request.session.passport = { user: { github_id: Number(githubId) } }

    response.send(`
      logged in as ${githubId}
    `)
  })
}

module.exports = router
