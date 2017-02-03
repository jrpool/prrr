import knex from '../../server/knex'
import moment from 'moment'

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

      context('when the pull request doesnt exist', function(){
        let pullRequests
        beforeEach(function(){
          pullRequests = sinon.stub(commands.github.pullRequests)
          pullRequests.get.returns(new Promise((resolve, reject) => {
            reject(new Error)
          }));
        })
        it('should reject with "Pull Request Not Found"', function(){
          return commands.createPrrr({
            owner: 'nicosesma',
            repo: 'floworky',
            number: 42,
          })
          .catch(error => {
            expect(error.message).to.eql('Pull Request Not Found')
          })
        })
      })

      context('when the pull request exists', function(){
        let pullRequests
        beforeEach(function(){
          pullRequests = sinon.stub(commands.github.pullRequests)
          pullRequests.get.returns(new Promise((resolve, reject) => {
            resolve({
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
          }));
        })

        context('and a conflicting Prrr already exists', function(){
          beforeEach(function(){
            return commands.createRecord('pull_request_review_requests',{
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


    describe('unclaimStalePrrrs', function(){
      it('should unclaim all uncompleted Prrrs from more than an hour ago', function() {
        const now = moment()
        const timeAgo = (number, unit) => now.clone().subtract(number, unit).toDate()

        const getAllPrrrs = () =>
          knex
            .select('*')
            .from('pull_request_review_requests')
            .orderBy('created_at', 'asc')

        const insertPrrr = attributes =>
          knex
            .insert(attributes)
            .into('pull_request_review_requests')

        return Promise.all([
          insertPrrr({
            id: 33,
            owner: 'anasauce',
            repo: 'prrr-so-meta',
            number: 45,
            requested_by: 'anasauce',
            created_at: timeAgo(4, 'hours'),
            updated_at: timeAgo(1.2, 'hours'),
            claimed_by: 'deadlyicon',
            claimed_at: timeAgo(1.2, 'hours'),
          }),
          insertPrrr({
            id: 34,
            owner: 'ykatz',
            repo: 'prrr-be-awesome',
            number: 45,
            requested_by: 'anasauce',
            created_at: timeAgo(3, 'hours'),
            updated_at: timeAgo(50, 'minutes'),
            claimed_by: 'peterparker',
            claimed_at: timeAgo(50, 'minutes'),
          }),
          insertPrrr({
            id: 35,
            owner: 'deadlyicon',
            repo: 'prrr-forevah',
            number: 45,
            requested_by: 'deadlyicon',
            created_at: timeAgo(2, 'hours'),
            updated_at: timeAgo(2, 'hours'),
            claimed_by: null,
            claimed_at: null,
          }),
        ])
        .then(_ => getAllPrrrs())
        .then(prrrs => {
          expect(prrrs).to.have.length(3)
          expect(prrrs[0].id).to.eql(33)
          expect(prrrs[1].id).to.eql(34)
          expect(prrrs[2].id).to.eql(35)
          expect(prrrs[0].claimed_at).to.eql(timeAgo(1.2, 'hours'))
          expect(prrrs[1].claimed_at).to.eql(timeAgo(50, 'minutes'))
          expect(prrrs[2].claimed_at).to.eql(null)
          expect(prrrs[0].claimed_by).to.eql('deadlyicon')
          expect(prrrs[1].claimed_by).to.eql('peterparker')
          expect(prrrs[2].claimed_by).to.eql(null)
        })
        .then(_ => commands.unclaimStalePrrrs())
        .then(_ => getAllPrrrs())
        .then(prrrs => {
          expect(prrrs).to.have.length(3)
          expect(prrrs[0].id).to.eql(33)
          expect(prrrs[1].id).to.eql(34)
          expect(prrrs[2].id).to.eql(35)
          expect(prrrs[0].claimed_at).to.eql(null)
          expect(prrrs[1].claimed_at).to.eql(timeAgo(50, 'minutes'))
          expect(prrrs[2].claimed_at).to.eql(null)
          expect(prrrs[0].claimed_by).to.eql(null)
          expect(prrrs[1].claimed_by).to.eql('peterparker')
          expect(prrrs[2].claimed_by).to.eql(null)
        })
      })
    })

    describe('claimPrrr', function() {

      it('should return the oldest unclaimed Prrr', function() {
        const now = moment()
        const timeAgo = (number, unit) => now.clone().subtract(number, unit).toDate()

        const insertPrrr = attributes =>
          knex
            .insert(attributes)
            .into('pull_request_review_requests')
            .returning('*')

        const getAllPrrrs = () =>
          knex
            .select('*')
            .from('pull_request_review_requests')
            .orderBy('created_at', 'asc')

        return Promise.all([
          insertPrrr({
            id: 545,
            owner: 'ykatz',
            repo: 'prrr-be-awesome',
            number: 45,
            requested_by: 'anasauce',
            created_at: timeAgo(3, 'hours'),
            updated_at: timeAgo(50, 'minutes'),
          }),
          insertPrrr({
            id: 59884,
            owner: 'anasauce',
            repo: 'prrr-so-meta',
            number: 45,
            requested_by: 'anasauce',
            created_at: timeAgo(4, 'hours'),
            updated_at: timeAgo(4, 'hours'),
          }),
          insertPrrr({
            id: 12154864,
            owner: 'deadlyicon',
            repo: 'prrr-forevah',
            number: 45,
            requested_by: 'deadlyicon',
            created_at: timeAgo(2, 'hours'),
            updated_at: timeAgo(2, 'hours'),
          }),
        ])
        .then(prrrs => commands.claimPrrr())
        .then(prrr => {
          expect(prrr).to.not.be.null
          expect(prrr.id).to.eql(59884)
          expect(prrr.claimed_by).to.eql('nicosesma')
        })
        .then(prrrs => commands.claimPrrr())
        .then(prrr => {
          expect(prrr).to.not.be.null
          expect(prrr.id).to.eql(545)
          expect(prrr.claimed_by).to.eql('nicosesma')
        })
        .then(prrrs => commands.claimPrrr())
        .then(prrr => {
          expect(prrr).to.not.be.null
          expect(prrr.id).to.eql(12154864)
          expect(prrr.claimed_by).to.eql('nicosesma')
        })
        .then(prrrs => commands.claimPrrr())
        .then(prrr => {
          expect(prrr).to.be.null
        })
      })
    })

  })

})
