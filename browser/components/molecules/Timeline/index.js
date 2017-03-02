import React, { Component, PropTypes } from 'react'
import moment from 'moment'
import Button from '../../atoms/Button'
import Link from '../../atoms/Link'
import './index.sass'
import prrrToPullRequestURL from '../../../prrrToPullRequestURL'

const ONE_WEEK_IN_SECONDS = 604800
const PERCENTAGE_FOR_CSS = 100
const CONVERT_MILLISECONDS_TO_SECONDS = 1000
const TOTAL_DIV_WIDTH = 99

export default class Timeline extends Component {
  static propTypes = {
    week: PropTypes.instanceOf(moment).isRequired,
    prrrs: PropTypes.array,
  }

  timeFromStartofWeekInSeconds(inputTime){
    return Math.round((inputTime.valueOf() - this.props.week.clone().valueOf()) / CONVERT_MILLISECONDS_TO_SECONDS)
  }

  areaLeftofPoints(timeInput){
    return Math.round((this.timeFromStartofWeekInSeconds(timeInput) / ONE_WEEK_IN_SECONDS) * PERCENTAGE_FOR_CSS)
  }

  checkForOverflowingValues(timeInput){
    return timeInput.clone().valueOf() > this.props.week.clone().endOf("isoweek").valueOf()
  }

  render(){
    const {week, prrrs} = this.props

    if (!prrrs) return <div>Loading...</div>

    const rows = prrrs.map(prrr => {
      const href = prrrToPullRequestURL(prrr)

      const marginLeftForClaimed =
        this.checkForOverflowingValues(moment(prrr.claimed_at))
          ? 0
          : this.areaLeftofPoints(moment(prrr.claimed_at)) - this.areaLeftofPoints(moment(prrr.created_at))

      const widthForClaimed =
        this.checkForOverflowingValues(moment(prrr.claimed_at))
          ? 0
          : this.checkForOverflowingValues(moment(prrr.completed_at))
              ? TOTAL_DIV_WIDTH - marginLeftForClaimed - ( this.areaLeftofPoints(moment(prrr.created_at)) )
              : this.areaLeftofPoints(moment(prrr.completed_at)) - this.areaLeftofPoints(moment(prrr.claimed_at))

      const widthForCompleted = prrr.completed_at && !this.checkForOverflowingValues(moment(prrr.completed_at))
        ? 1
        : 0

      const style = {
        marginLeft: prrr.created_at
          ? this.areaLeftofPoints(moment(prrr.created_at))  + "%"
          : 1 + "%"
      }

      const claimed = {
        marginLeft: marginLeftForClaimed + "%",
        width: widthForClaimed + "%",
      }

      const completed = {
        marginLeft: 0 + "%",
        width: widthForCompleted + "%",
      }

      const rowTitle = ` prrr-id: ${prrr.id} \n prrr-claimer: ${prrr.claimed_by} \n prrr-created: ${prrr.created_at} \n prrr-claimed: ${prrr.claimed_at} \n prrr-completed: ${prrr.completed_at}`

      return <div key={prrr.id}
        className="Timeline-wrapper"
        title={rowTitle}
        >
        <Link href={href}>
          <div
            style={style}
            title={`prrr-created: ${prrr.created_at}`}
            className="Timeline-created"
          />
          <div
            style={claimed}
            title={`prrr-claimed: ${prrr.claimed_at}`}
            className="Timeline-claimed"
          />
          <div
            style={completed}
            title={`prrr-completed: ${prrr.completed_at}`}
            className="Timeline-completed"
          />
        </Link>

      </div>
    })

    return <div className="Timeline">
      <ul className="Timeline-heading">
        <li>Monday</li>
        <li>Tuesday</li>
        <li>Wednesday</li>
        <li>Thursday</li>
        <li>Friday</li>
        <li>Saturday</li>
        <li>Sunday</li>
      </ul>
      {rows}
    </div>

  }
}
