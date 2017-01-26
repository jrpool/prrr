import knex from '../knex'
import Queries from '../queries'
import Github from '../Github'
import request from 'request-promise'
import logger from '../logger'

export default class Commands {

  constructor(currentUser, _knex=knex){
    this.currentUser = currentUser
    this.knex = _knex
    this.queries = new Queries(currentUser, _knex)
  }

  as(user){
    return new this.constructor(user, this.knex)
  }

  createRecord(table, attributes){
    return this.knex
      .table(table)
      .insert(attributes)
      .returning('*')
      .then(firstRecord)
  }

  createUser(attributes){
    attributes.created_at = attributes.updated_at = new Date
    return this.createRecord('users', attributes)
  }

  findOrCreateUserFromGithubProfile({accessToken, refreshToken, profile}){
    const userAttributes = {
      name: profile.displayName || profile.username,
      email: profile.emails[0].value,
      avatar_url: (
        profile.photos &&
        profile.photos[0] &&
        profile.photos[0].value
      ),
      github_id: profile.id,
      github_username: profile.username,
      github_access_token: accessToken,
      github_refresh_token: refreshToken,
    }
    return this.knex
      .table('users')
      .where('github_id', profile.id)
      .first('*')
      .then(user => user ? user : this.createUser(userAttributes))
  }

  reopenPrrr(id){
    return this.knex
      .update({
        archived_at: null,
        completed_at: null,
        claimed_by: null,
        claimed_at: null,
      })
      .table('pull_request_review_requests')
      .where('id', id)
      .returning('*')
      .then(firstRecord)
  }

  createPrrr({owner, repo, number}){
    return this.queries.getPullRequest({owner, repo, number})
      .then(pullRequest => {
        if (!pullRequest) throw new Error('Pull Request Not Found')
        return this.queries.getPrrrForPullRequest({owner, repo, number})
      })
      .then(prrr => {
        if (prrr) {
          return prrr.archived_at || prrr.completed_at
            ? this.reopenPrrr(prrr.id)
            : prrr
        }
        return this.createRecord('pull_request_review_requests',{
          owner,
          repo,
          number,
          requested_by: this.currentUser.github_username,
          created_at: new Date,
          updated_at: new Date,
        })
      })
  }

  markPullRequestAsClaimed(prrrId){
    return this.knex
      .table('pull_request_review_requests')
      .update({
        claimed_by: this.currentUser.github_username,
        claimed_at: new Date,
        updated_at: new Date,
      })
      .where('id', prrrId)
      .whereNull('claimed_by')
      .whereNull('claimed_at')
      .returning('*')
      .then(firstRecord)
  }

  claimPrrr(){
    return this.queries.getNextPendingPrrr()
      .then(prrr =>
        prrr
          ? this.markPullRequestAsClaimed(prrr.id)
          : null
      )
  }

  unclaimPrrr(prrrId){
    return this.knex
      .table('pull_request_review_requests')
      .update({
        claimed_by: null,
        claimed_at: null,
        updated_at: new Date,
      })
      .where('id', prrrId)
      .where('claimed_by', this.currentUser.github_username)
      .returning('*')
      .then(firstRecord)
  }

  skipPrrr(prrrId){
    logger.debug('skipPrrr', {prrrId})
    return this.knex
      .table('skipped_prrrs')
      .insert({
        prrr_id: prrrId,
        github_username: this.currentUser.github_username,
        skipped_at: new Date,
      })
      .catch(error => {
        if (error.message.includes('duplicate key value violates unique constraint')) return
        throw error
      })
      .then(_ => this.unclaimPrrr(prrrId))
      .then(skippedPrrr => {
        skippedPrrr.skipped = true
        return this.claimPrrr()
          .then(newClaimedPrrr => ({newClaimedPrrr, skippedPrrr}))
      })
  }

  unclaimStalePrrrs(prrr){
    return this.knex
      .table('pull_request_review_requests')
      .update({
        claimed_by: null,
        claimed_at: null,
        updated_at: new Date,
      })
      .whereRaw(`claimed_at <= NOW() - '1 hour'::INTERVAL`)
      .whereNotNull('claimed_by')
      .whereNotNull('claimed_at')
      .whereNull('completed_at')
  }

  archivePrrr(prrrId){
    return this.knex
      .table('pull_request_review_requests')
      .update({
        archived_at: new Date,
      })
      .where('id', prrrId)
      .returning('*')
      .then(firstRecord)
  }

  completePrrr(prrrId){
    return this.knex
    .table('pull_request_review_requests')
    .update({
      completed_at: new Date,
    })
    .where('id', prrrId)
    .returning('*')
    .then(firstRecord)
  }
}

const firstRecord = records => records[0]
