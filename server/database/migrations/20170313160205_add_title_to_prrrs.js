exports.up = knex =>
  knex.schema.table('pull_request_review_requests', table => {
    table.string('title')
  })

exports.down = knex =>
  knex.schema.table('pull_request_review_requests', table => {
    table.dropColumn('title')
  })
