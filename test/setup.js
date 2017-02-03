import sinon from 'sinon'
import knex from '../server/knex'
import Queries from '../server/queries'
import Commands from '../server/commands'

beforeEach(done => {
  knex.migrate.latest()
    .then(_ =>
      Promise.all([
        knex.truncate('users'),
        knex.truncate('pull_request_review_requests'),
        knex.truncate('skipped_prrrs'),
      ])
    )
    .then(_ => done())
})

global.sinon = sinon
global.knex = knex
global.Queries = Queries
global.Commands = Commands
