import webdriver from 'selenium-webdriver'
import { usingSelenium, By, until } from '../selenium_helpers'
import { withUsersInTheDatabase } from '../helpers'

describe('selenium scenarios', function(){
  usingSelenium(function(){

    withUsersInTheDatabase(function(){
      beforeEach(function() {
        sinon.stub(Queries.prototype, 'getPullRequest').returns(
          Promise.resolve({FAKE_PR: true})
        );
      })

      afterEach(function(){
        Queries.prototype.getPullRequest.restore()
      })

      it('runs through scenario of a player creating a prrr and a coach seeing a new prrr being added and claims it', function(){
        this.timeout(60*10000)

        const player = this.createBrowser()
        const coach = this.createBrowser('right')

        return Promise.resolve()
        //Create initial state for testing
          .then(_ => {
            return knex
            .table('pull_request_review_requests')
            .insert(
              [
                {
                  owner: 'AbrahamFergie',
                  repo: 'Archive.com',
                  number: 46,
                  requested_by: 'AbrahamFergie',
                  created_at: '2017-01-18 15:29:22.979-08',
                  updated_at: '2017-01-18 15:29:22.979-08'
                },
                {
                  owner: 'morelme',
                  repo: 'popcorn.com',
                  number: 5,
                  requested_by: 'nicosesma',
                  created_at: '2017-01-17 15:29:22.979-08',
                  updated_at: '2017-01-17 15:29:22.979-08'
                },
                {
                  owner: 'AbrahamFergie',
                  repo: 'hibbityDibbity.com',
                  number: 42,
                  requested_by: 'countChocula',
                  created_at: '2017-01-18 16:29:22.979-08',
                  updated_at: '2017-01-18 16:29:22.979-08'
                },
                {
                  owner: 'AbrahamFergie',
                  repo: 'bloodThirsty.com',
                  number: 41,
                  requested_by: 'AbrahamFergie',
                  claimed_by: 'countChocula',
                  claimed_at: '2017-01-18 16:29:22.979-08',
                  created_at: '2017-01-18 15:29:22.979-08',
                  updated_at: '2017-01-18 15:29:22.979-08',
                  completed_at: '2017-01-18 17:28:22.979-08'
                },
                {
                  owner: 'AbrahamFergie',
                  repo: 'bloodThirsty.com',
                  number: 44,
                  requested_by: 'AbrahamFergie',
                  created_at: '2017-01-18 15:29:22.979-08',
                  updated_at: '2017-01-18 15:29:22.979-08',
                  archived_at: '2017-01-18 15:30:22.979-08'
                },
                {
                  owner: 'AbrahamFergie',
                  repo: 'bloodThirsty.com',
                  number: 43,
                  requested_by: 'AbrahamFergie',
                  claimed_by: 'fabpot',
                  claimed_at: '2017-01-11 16:29:22.979-08',
                  created_at: '2017-01-11 15:29:22.979-08',
                  updated_at: '2017-01-11 15:29:22.979-08',
                  completed_at: '2017-01-11 17:28:22.979-08'
                }
              ]
            )
          })
          //player logs in
          .then(_ => player.loginAs(15825329))
          //player goes to homepage
          .then(_ => player.visit('/'))
          //player should see their name
          .then(_ => player.shouldSee('Abraham Ferguson'))
          //coach logs in
          .then(_ => coach.loginAs(47313))
          //coach goes to homepage
          .then(_ => coach.visit('/'))
          //coach should see their name
          .then(_ => coach.shouldSee('Fabien Potencier'))
          // player archives a Prrr
          .then(_ => player.archiveMyRequestedPrrr('AbrahamFergie/Archive.com/pull/46', By.css('table.MyRequestedPrrrs')))
          .then(_ => player.switchTo().alert().getText())
          .then(text => {
            expect(text).to.include('Are you sure you want to archive your')
            expect(text).to.include('Pull Request Review Request for')
            expect(text).to.include('https://github.com/AbrahamFergie/Archive.com/pull/46')
          })
          .then(_ => player.switchTo().alert().accept())
          .then(_ => player.shouldNotSeeWithin('AbrahamFergie/Archive.com/pull/46', By.css('table.MyRequestedPrrrs')))
          //coach sees only only Prrr ready for review
          .then(_ => coach.shouldSee('Pending Prrrs: 2'))
          //player clicks add Prrr button, then redirects to addPrrr page
          .then(_ => player.clickOn('Add a Prrr'))
          //player pastes pull request url into text box
          .then(_ => {
            player.insertPullRequestAddress('https://github.com/AbrahamFergie/Obeisant-Gecko/pull/6', By.css('input.RequestReviewPage-InputBox'))
          })
          // player creates the new Prrr
          .then(_ => player.clickOn('Add Prrr'))
          // player and coach see new prrr on the page
          .then(_ => player.shouldSee('Pending Prrrs: 2'))
          .then(_ => coach.shouldSee('Pending Prrrs: 3'))
          //player should see all requested prrrs in My Requested Prrrs Table
          .then(_ => player.shouldSeeWithin('AbrahamFergie/Obeisant-Gecko/pull/6', By.css('table.MyRequestedPrrrs')))
          .then(_ => player.shouldSeeWithin('AbrahamFergie/bloodThirsty.com/pull/41', By.css('table.MyRequestedPrrrs')))
          .then(_ => player.shouldSeeWithin('AbrahamFergie/bloodThirsty.com/pull/43', By.css('table.MyRequestedPrrrs')))
          //player should not see archived prrr or prrr that has not been requested by them even if they are the owner of the repo
          //coach claims a pull request
          .then(_ => coach.clickOn('Review a PR'))
          .then(_ => coach.shouldSeePopupAt('https://github.com/morelme/popcorn.com/pull/5'))
          //closes said tabs
          .then(_ => coach.closeTabs())
          //coach skips a pull request
          .then(_ => coach.clickOn('Skip'))
          //coach automatically recieves the next pull request
          .then(_ => coach.shouldSeePopupAt('https://github.com/AbrahamFergie/hibbityDibbity.com/pull/42'))
          //closes said tabs
          .then(_ => coach.closeTabs())
          .then(_ => player.shouldSeeWithin('There are currently no Pending Pull Request Review Requests from other Learners at this time. Check back later.', By.css('div.ClaimAPrrr-UserNeedsToClaimAPrrr-Unavailable')))
          .then(_ => coach.clickOn('Complete'))
          //coach claims another pull request
          .then(_ => coach.clickOn('Review a PR'))
          //finds tabs as they open
          .then(_ => coach.shouldSeePopupAt('https://github.com/AbrahamFergie/Obeisant-Gecko/pull/6'))
          //closes said tabs
          .then(_ => coach.closeTabs())
          //coach should be able to see timer
          .then(_ => coach.shouldSeeElement(By.css('div.Timer')))
          //coach should see details relating to the claimed pull request
          .then(_ => coach.shouldSeeWithin('Reviewing:\nAbrahamFergie/Obeisant-Gecko/pull/6', By.css('div.ClaimAPrrr-UserClaimedAPrrr')))
          .then(_ => coach.shouldSeeWithin('For:\nAbrahamFergie\nRequested:\na few seconds ago', By.css('div.ClaimAPrrr-UserClaimedAPrrr')))
          //coach then decides to abandon Prrr and should see 1 pending Prrrs again
          .then(_ => coach.clickOn('Abandon'))
          .then(_ => coach.shouldSee('Pending Prrrs: 1'))
          .then(_ => coach.shouldSeeWithin('AbrahamFergie/hibbityDibbity.com/pull/42', By.css('table.MyReviewedPrrrs')))
          .then(_ => coach.shouldSeeWithin('AbrahamFergie/bloodThirsty.com/pull/43', By.css('table.MyReviewedPrrrs')))
          .then(_ => coach.shouldSeeWithin('by countChocula', By.css('table.MyReviewedPrrrs')))
          //coach toggles My Reviewed table
          .then(_ => coach.toggleTableVisibility('My Reviewed Prrrs'))
          //coach toggles My Reviewed table again
          .then(_ => coach.toggleTableVisibility('My Reviewed Prrrs'))
          //player goes to the metrics page
          .then(_ => player.visit('/metrics/2017-01-18'))
          //player then verifies that all the data on the page is correct
          .then(_ => player.shouldSee('Total code reviews: 2'))
          .then(_ => player.shouldSee('Average time for PR to be claimed:'))
          .then(_ => player.shouldSee('Average time for PR to be completed: 0 days and 0 hours and 29 minutes'))
          .then(_ => player.shouldSee('Total number of projects that requested reviews: 2'))
          .then(_ => player.shouldSee('Average number of reviews requested per project: 1.25'))
          .then(_ => player.shouldSee('1\ncountChocula'))
          .then(_ => player.shouldSee('1\nfabpot'))
          //player verifies that week is week of January 16, 2017
          .then(_ => player.shouldSee('Metrics For: 2017-01-16'))
          //player navigates to previous week and expects week to be January 9, 2017
          .then(_ => player.clickOn('last week'))
          .then(_ => player.shouldSee('Metrics For: 2017-01-09'))
          //player navigates to next week and expects week to be January 16, 2017
          .then(_ => player.clickOn('next week'))
          .then(_ => player.shouldSee('Metrics For: 2017-01-16'))
          .then(_ => this.waitForAllBrowsers())
      })
    })
  })
})
