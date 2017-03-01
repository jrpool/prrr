import moment from 'moment'
import React, { Component, PropTypes } from 'react'
import Icon from '../../atoms/Icon'
import Link from '../../atoms/Link'
import Button from '../../atoms/Button'
import Layout from '../../molecules/Layout'
import InspectObject from '../../utils/InspectObject'
import { loadMetricsForWeek } from '../../../actions'
import Timeline from '../../molecules/Timeline'
import './index.sass'

export default class MetricsPage extends Component {
  static contextTypes = {
    redirectTo: PropTypes.func.isRequired,
  }

  parseWeek(props=this.props){
    return moment(props.location.params.week).startOf('isoWeek')
  }

  componentDidMount(){
    this.redirectOrLoadMetrics(this.props)
  }

  componentWillReceiveProps(nextProps){
    if (this.props.location.params.week !== nextProps.location.params.week){
      this.redirectOrLoadMetrics(nextProps)
    }
  }

  redirectOrLoadMetrics(props){
    const weekParam = props.location.params.week
    const week = this.parseWeek(props)
    const weekString = formatWeek(this.parseWeek(props))
    if (!week.isValid()){
      this.context.redirectTo('/metrics', true)
    }else if (weekParam && weekParam != weekString){
      this.context.redirectTo(`/metrics/${weekString}`)
    }else{
      loadMetricsForWeek(weekString)
    }
  }

  render(){
    const { session, errors=[], metricsByWeek={} } = this.props
    const week = this.parseWeek()
    const metrics = metricsByWeek[formatWeek(week)]
    return <Layout className="MetricsPage" session={session} errors={errors}>
      <WeekBar week={week} />
      <h2 className="MetricsPage-header">Metrics For: {formatWeek(week)}</h2>
      <Metrics metrics={metrics} />
      <Timeline week={week} prrrs={metrics && metrics.prrrs} />
    </Layout>
  }
}



class WeekBar extends Component {
  static propTypes = {
    week: PropTypes.instanceOf(moment),
  }

  render(){
    const thisWeek = this.props.week
    const lastWeek = thisWeek.clone().subtract(1, 'week')
    const nextWeek = thisWeek.clone().add(1, 'week')

    const lastWeekLink = <Link href={`/metrics/${formatWeek(lastWeek)}`}>
      <Icon type="caret-left" />
      <span> last week </span>
    </Link>

    const nextWeekLink = nextWeek.isBefore(/* now */)
      ? <Link href={`/metrics/${formatWeek(nextWeek)}`}>
        <span> next week </span>
        <Icon type="caret-right" />
      </Link>
      : <Link disabled>
        <span> next week </span>
        <Icon type="caret-right" />
      </Link>

    return <div className="MetricsPage-WeekBar">
      {lastWeekLink}
      <Link href="/metrics">
        <span> this week </span>
      </Link>
      {nextWeekLink}
    </div>
  }
}

const Metrics = ({metrics}) => {
  if (!metrics) return <div>loading…</div>
  return <div>
    <div>
      <strong>Total code reviews: </strong>
      <span>{metrics.totalCodeReviews}</span>
    </div>
    <div>
      <strong>Total Prrr users: </strong>
      <span>{metrics.totalUsersCount}</span>
    </div>
    <div>
      <strong>Average time for PR to be claimed: </strong>
      <Duration duration={metrics.averageTimeForPrrrToBeClaimed} />
    </div>
    <div>
      <strong>Average time for PR to be completed: </strong>
      <Duration duration={metrics.averageTimeForPrrrToBeCompleted} />
    </div>
    <div>
      <strong>Total number of projects that requested reviews: </strong>
      <span>{metrics.totalNumberOfProjectsThatRequestedReviews}</span>
    </div>
    <div>
      <strong>Average number of reviews requested per project: </strong>
      <span>{metrics.averageNumberOfReviewsRequestedPerProject}</span>
    </div>
    <div>
      <strong>Total code reviews per reviewer: </strong>
      <Reviewers reviewers={metrics.totalCodeReviewsPerReviewer} />
    </div>
  </div>
}


const Duration = ({duration}) =>{
  duration = moment.duration(duration)
  return <span>
    {duration.days()} days and {duration.hours()} hours and {duration.minutes()} minutes
  </span>
}

const Reviewers = ({reviewers}) => {
  reviewers = Object.keys(reviewers)
    .map(reviewer => {
      return {
        name: reviewer,
        total: reviewers[reviewer],
      }
    })
    .sort((a,b) => b.total - a.total)

  reviewers = reviewers.map(reviewer =>
    <div key={reviewer.name}>
      <div className="MetricsPage-reviewers-total">
        {reviewer.total}
      </div>
      <div className="MetricsPage-reviewers-reviewer">
        {reviewer.name}
      </div>
    </div>
  )
  return <div className="MetricsPage-reviewers">
    {reviewers}
  </div>
}

const formatWeek = week =>
  week.format('YYYY-MM-DD')
