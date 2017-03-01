import moment from 'moment'

export default class Metrics {
  constructor({week, queries}){
    this.week = moment(week)
    this.queries = queries
    this.knex = queries.knex
  }

  weekRange(){
    return [
      this.week.format('YYYY-MM-DD'),
      this.week.clone().add(1, 'weeks').format('YYYY-MM-DD'),
    ]
  }

  query(){
    return this.knex
      .table('pull_request_review_requests')
      .whereBetween('created_at', this.weekRange())
  }

  count(value){
    return this.query().count(value)
  }

  load(){
    return Promise.all([
      this.totalCodeReviews(),
      this.totalUsersCount(),
      this.totalCodeReviewsPerReviewer(),
      this.averageTimeForPrrrToBeClaimed(),
      this.averageTimeForPrrrToBeCompleted(),
      this.totalNumberOfProjectsThatRequestedReviews(),
      this.averageNumberOfReviewsRequestedPerProject(),
      this.prrrs(),
    ])
    .then(results => {
      return {
        week: this.week.format('YYYY-MM-DD'),
        totalCodeReviews: results[0],
        totalUsersCount: results[1],
        totalCodeReviewsPerReviewer: results[2],
        averageTimeForPrrrToBeClaimed: results[3],
        averageTimeForPrrrToBeCompleted: results[4],
        totalNumberOfProjectsThatRequestedReviews: results[5],
        averageNumberOfReviewsRequestedPerProject: results[6],
        prrrs: results[7],
      }
    })
  }

  totalCodeReviews(){
    return this
      .count()
      .whereNotNull('completed_at')
      .then(results => Number(results[0].count))
  }

  totalUsersCount(){
    return this.knex
      .table('users')
      .count('*')
      .then(result => Number(result[0].count))
  }

  totalCodeReviewsPerReviewer(){
    return this
      .count()
      .select('claimed_by')
      .whereNotNull('completed_at')
      .groupBy('claimed_by')
      .then(results => {
        const totals = {}
        results.forEach(({count, claimed_by}) => {
          totals[claimed_by] = Number(count)
        })
        return totals
      })
  }

  averageTimeForPrrrToBeClaimed(){
    return this
      .query()
      .select(
        this.knex.raw(
          `EXTRACT(EPOCH FROM AVG( AGE( claimed_at::timestamp, created_at::timestamp )))`
        )
      )
      .then(result => result[0].date_part * 1000)
  }

  averageTimeForPrrrToBeCompleted(){
    return this
      .query()
      .select(
        this.knex.raw(
          `EXTRACT(EPOCH FROM AVG( AGE( completed_at::timestamp, claimed_at::timestamp )))`
        )
      )
      .then(result => result[0].date_part * 1000)
  }

  totalNumberOfProjectsThatRequestedReviews(){
    return this.query()
      .select(this.knex.raw('COUNT(DISTINCT(owner))'))
      .then(result => Number(result[0].count))

  }

  averageNumberOfReviewsRequestedPerProject(){
    const subSelect = this.query()
      .select(this.knex.raw('count(repo) as count'))
      .groupBy('repo')

    return this.knex
      .raw(`select avg(count) from (${subSelect}) as avg`)
      .then(result => Math.round(Number(result.rows[0].avg)*100)/100)
  }


  prrrs(){
    return this.knex
      .select('*')
      .from('pull_request_review_requests')
      .orderBy('created_at', 'asc')
      .whereBetween('created_at', this.weekRange())
  }

}
