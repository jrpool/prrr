import { usingSelenium, By, until } from '../selenium_helpers'
import { withUsersInTheDatabase } from '../helpers'

describe('going to the homepage', function(){
  withUsersInTheDatabase(function(){
    usingSelenium(function(){

      beforeEach(function(){
        this.browser = this.createBrowser()
      })

      describe('not logged in', function(){
        it('goes to the homepage', function(done) {
          this.timeout(10000)
          this.browser.visit('/')
          this.browser.clickOn('Login via Github')
          this.browser.shouldSee('Sign in to GitHub')
          this.browser.then(_ => done())
        })
      })

      describe('while logged in', function(){
        beforeEach(function(){
          this.timeout(10000)
          return this.browser.loginAs(2829600)
        })
        it('goes to the logged-in homepage and then logs out', function(done) {
          this.timeout(10000)
          this.browser.visit('/')
          this.browser.shouldSee('Graham Campbell')
          this.browser.clickOn('Logout')
          this.browser.shouldNotSee('Graham Campbell')
          this.browser.clickOn('Login via Github')
          this.browser.then(_ => done())
        })
      })
    })
  })
})
