import knex from '../knex'
import moment from 'moment'
import Github from '../Github'
import Metrics from './metrics'

export default class Queries {

  constructor(currentUser, _knex=knex){
    this.currentUser = currentUser
    this.knex = _knex
    if (this.currentUser)
      this.github = new Github(this.currentUser.github_access_token)
  }

  getUserByGithubId(githubId){
    return this.knex
      .select('*')
      .from('users')
      .where('github_id', githubId)
      .first()
  }

  getUserByGithubUsername(githubUsername){
    return this.knex
      .select('*')
      .from('users')
      .where('github_username', githubUsername)
      .first()
  }

  getAllPrrrs(){
    return this.knex
      .select('*')
      .from('pull_request_review_requests')
      .then(convertArrayOfPrrrsIntoHashById)
  }

  getPrrrs(){
    return this.knex
      .select('*')
      .from('pull_request_review_requests')
      .where({
        archived_at: null,
        claimed_at: null,
        claimed_by: null,
        completed_at: null,
      })
      .orWhere({
        requested_by: this.currentUser.github_username,
      })
      .orWhere({
        claimed_by: this.currentUser.github_username,
      })
      .orderBy('created_at', 'desc')
      .then(convertArrayOfPrrrsIntoHashById)
      .then(prrrs => {
        return this.knex
          .select('*')
          .from('skipped_prrrs')
          .whereIn('prrr_id', Object.keys(prrrs))
          .where('github_username', this.currentUser.github_username)
          .then(skippedPrrrs => {
            skippedPrrrs.forEach(skip => {
              prrrs[skip.prrr_id].skipped = true
            })
            return prrrs
          })
      })

  }

  getNextPendingPrrr(){
    var skipped_prrrs = this.knex
      .select('prrr_id')
      .from('skipped_prrrs')
      .where('github_username', this.currentUser.github_username)

    return this.knex
      .select(knex.raw('DISTINCT("pull_request_review_requests".*)'))
      .from('pull_request_review_requests')
      .leftJoin('skipped_prrrs', 'pull_request_review_requests.id', 'skipped_prrrs.prrr_id')
      .where({
        archived_at: null,
        completed_at: null,
        claimed_by: null,
        claimed_at: null,
      })
      .whereNot('requested_by', this.currentUser.github_username)
      .whereNotIn('id', skipped_prrrs)
      .orderBy('created_at', 'asc')
      .first()
  }

  getPrrrForPullRequest({owner, repo, number}){
    return this.knex
      .select('*')
      .from('pull_request_review_requests')
      .where({owner, repo, number})
      .first()
  }

  getPullRequest({owner, repo, number}){
    return this.github.pullRequests.get({owner, repo, number})
      .catch(error => null)
  }

  metricsForWeek(week){
    return new Metrics({week, queries: this}).load()
  }
}

const convertArrayOfPrrrsIntoHashById = prrrs =>
  prrrs.reduce((prrrs, prrr) => {
    prrrs[prrr.id] = prrr
    return prrrs
  }, {})
