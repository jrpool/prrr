import knex from '../../server/knex'
import moment from 'moment'
import { timeAgo, insertPrrr, getPrrrById } from '../helpers'

describe('Commands', function(){

  describe('createUser', function(){
    it('should insert a user into the database', function(){
      const commands = new Commands
      return commands.createUser({
        name: 'Graham Campbell',
        email: 'graham@alt-three.com',
        avatar_url: 'https://avatars1.githubusercontent.com/u/2829600?v=3&s=460',
        github_id: 123456,
        github_username: 'Graham Campbell',
        github_access_token: 'FAKE_GITHUB_ACCESS_TOKEN',
        github_refresh_token: null,
      })
      .then(user => {
        expect(user).to.be.an('object')
        expect(user.name                ).to.eql('Graham Campbell')
        expect(user.email               ).to.eql('graham@alt-three.com')
        expect(user.avatar_url          ).to.eql('https://avatars1.githubusercontent.com/u/2829600?v=3&s=460')
        expect(user.github_id           ).to.eql(123456)
        expect(user.github_username     ).to.eql('Graham Campbell')
        expect(user.github_access_token ).to.eql('FAKE_GITHUB_ACCESS_TOKEN')
        expect(user.github_refresh_token).to.eql(null)
        expect(user.created_at).to.be.a('date')
        expect(user.updated_at).to.be.a('date')
      })
    })
  })

  context('as Nico', function(){
    let commands
    beforeEach(function(){
      return (new Commands()).createUser({
        name: 'Nico',
        email: 'nicosm310@gmail.com',
        avatar_url: 'https://avatars0.githubusercontent.com/u/18688343?v=3&s=460',
        github_id: 987654,
        github_username: 'nicosesma',
        github_access_token: 'FAKE_GITHUB_ACCESS_TOKEN',
        github_refresh_token: null,
      })
      .then(nico => {
        commands = new Commands(nico)
      })
    })

    describe('createPrrr', function(){

      context('when the pull request doesnt exist', function () {

        beforeEach(function() {
          sinon.stub(Queries.prototype, 'getPullRequest').returns(
            Promise.resolve(null)
          );
        })

        afterEach(function(){
          Queries.prototype.getPullRequest.restore()
        })
        it('should reject with "Pull Request Not Found"', function () {
          return commands.createPrrr({
            owner: 'nicosesma',
            repo: 'floworky',
            number: 42
          })
          .then(
            _ => {
              throw new Error('expected createPrrr to thrown an error')
            },
            error => {
              expect(error.message).to.eql('Pull Request Not Found')
            }
          )
        })

      })

      context('when the pull request exists', function(){

        beforeEach(function(){
          sinon.stub(Queries.prototype, 'getPullRequest').returns(
           Promise.resolve({
            number: 42,
            base: {
              repo: {
                name: 'floworky',
                owner: {
                  login: 'nicosesma',
                },
              }
            }
          })
        )
      })

      afterEach(function(){
         Queries.prototype.getPullRequest.restore()
       })

        context('and a conflicting Prrr already exists', function(){
          beforeEach(function(){
            return knex
              .table('pull_request_review_requests')
              .insert({
                owner: 'nicosesma',
                repo: 'floworky',
                number: 42,
                requested_by: 'nicosesma',
                created_at: new Date,
                updated_at: new Date,
                archived_at: new Date,
              })
          })
          it('should unarchive the pre-existing Prrr and resolve with it', function(){
            return commands.createPrrr({
              owner: 'nicosesma',
              repo: 'floworky',
              number: 42,
            })
            .then(prrr => {
              expect(prrr).to.be.an('object')
              expect(prrr.id).to.be.a('number')
              expect(prrr.owner).to.eql('nicosesma')
              expect(prrr.repo).to.eql('floworky')
              expect(prrr.number).to.eql(42)
              expect(prrr.requested_by).to.eql('nicosesma')
              expect(prrr.claimed_by).to.eql(null)
              expect(prrr.claimed_at).to.eql(null)
              expect(prrr.created_at).to.be.a('date')
              expect(prrr.updated_at).to.be.a('date')
              expect(prrr.archived_at).to.eql(null)
            })
          })
        })

        context('and a conflicting Prrr doesn\'t already exist', function(){
          it('should create the Prrr', function(){
            return commands.createPrrr({
              owner: 'nicosesma',
              repo: 'floworky',
              number: 42,
            })
            .then(prrr => {
              expect(prrr).to.be.an('object')
              expect(prrr.id).to.be.a('number')
              expect(prrr.owner).to.eql('nicosesma')
              expect(prrr.repo).to.eql('floworky')
              expect(prrr.number).to.eql(42)
              expect(prrr.requested_by).to.eql('nicosesma')
              expect(prrr.claimed_by).to.eql(null)
              expect(prrr.claimed_at).to.eql(null)
              expect(prrr.created_at).to.be.a('date')
              expect(prrr.updated_at).to.be.a('date')
              expect(prrr.archived_at).to.eql(null)
            })
          })
        })

      })
    })

    describe('claimPrrr', function() {

      context('when the prrr is pending', function(){
        beforeEach(function(){
          return insertPrrr({
            id: 545,
            owner: 'anasauce',
            repo: 'prrr-be-awesome',
            number: 45,
            requested_by: 'anasauce',
            created_at: timeAgo(3, 'hours'),
            updated_at: timeAgo(50, 'minutes'),
            claimed_at: null,
            archived_at: null,
            completed_at: null,
          })
        })
        it('should claim that Prrr for the current user', function(){
          return commands.claimPrrr(545)
            .then(prrr => {
              expect(prrr.claimed_at).to.not.be.null
              expect(prrr.claimed_by).to.eql('nicosesma')
            })
        })
      })

      context('when the prrr is not pending', function(){
        beforeEach(function(){
          return insertPrrr({
            id: 545,
            owner: 'anasauce',
            repo: 'prrr-be-awesome',
            number: 45,
            requested_by: 'anasauce',
            created_at: timeAgo(3, 'hours'),
            updated_at: timeAgo(50, 'minutes'),
            claimed_at: timeAgo(20, 'minutes'),
            claimed_by: 'deadlyicon',
            archived_at: null,
            completed_at: null,
          })
        })
        it('should reject with an error', function(){
          return commands.claimPrrr(545)
            .then(
              prrr => {
                throw new Error('expected promise to reject')
              },
              error => {
                expect(error.message).to.eql('Unable to claim Prrr')
              }
            )
            .then(_ => getPrrrById(545))
            .then(prrr => {
              expect(prrr.claimed_by).to.eql('deadlyicon')
            })
        })
      })
    })

  })

})
