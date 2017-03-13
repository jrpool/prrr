import './index.sass'
import moment from 'moment'
import React, { Component } from 'react'
import Prrrs from '../../../Prrrs'
import prrrToPullRequestURL from '../../../prrrToPullRequestURL'
import { claimPrrr, unclaimPrrr, completePrrr } from '../../../actions'
import Link from '../../atoms/Link'
import Date from '../../atoms/Date'
import Button from '../../atoms/Button'
import GithubUsername from '../../atoms/GithubUsername'
import Layout from '../../molecules/Layout'
import SearchField from '../../molecules/SearchField'

export default class ReviewPage extends Component {
  render(){
    const { session, errors=[] } = this.props
    const currentUser = session.user

    const prrrs = new Prrrs({currentUser, prrrs: this.props.prrrs})
    const pendingPrrrs = prrrs.pending()
    const claimedPrrr = prrrs.claimed()

    const content = claimedPrrr
      ? <PrrrReviewStatus prrr={claimedPrrr} />
      : <PendingPrrrsTable prrrs={pendingPrrrs} currentUser={currentUser} />

    return <Layout className="ReviewPage" session={session} errors={errors}>
      {content}
    </Layout>
  }
}

const PrrrReviewStatus = ({prrr}) => {
  const href = prrrToPullRequestURL(prrr)
  return <div className="ReviewPage-PrrrReviewStatus">
    <h1>You're currently reviewing:</h1>
    <div  className="ReviewPage-PrrrReviewStatus-details">
      <Link href={href} target="_blank">
       {prrr.repo}
      </Link>
      <span>&nbsp;for&nbsp;</span>
      <GithubUsername username={prrr.requested_by} />
    </div>
    <div className="ReviewPage-PrrrReviewStatus-controls">
      <Button type="danger"  onClick={_ => unclaimPrrr(prrr.id) }>Unclaim Prrr</Button>
      <Button type="success" onClick={_ => completePrrr(prrr.id) }>Complete Review</Button>
    </div>
  </div>
}


class PendingPrrrsTable extends Component {

  constructor(props){
    super(props)
    this.state = {
      filter: '',
    }
  }

  onFilterChange = (event) => {
    this.setState({
      filter: event.target.value.toLowerCase(),
    })
  }

  render(){
    const {prrrs, currentUser} = this.props

    let visiblePrrrs = prrrs.slice()
    let filter = this.state.filter.trim()
    if (filter.length > 0){
      visiblePrrrs = visiblePrrrs.filter(prrr =>
        prrr.repo.toLowerCase().includes(filter)
      )
    }

    visiblePrrrs = visiblePrrrs.sort((a, b) =>
      moment(a.created_at).valueOf() -
      moment(b.created_at).valueOf()
    )

    const rows = visiblePrrrs.map(prrr =>
      <PendingPrrrsTableRow key={prrr.id} prrr={prrr} />
    )

    return <div className="ReviewPage-PendingPrrrsTable">
      <h1>Pending Pull Request Review Requests</h1>
      <PendingPrrrsTableControls
        count={prrrs.length}
        filter={this.state.filter}
        onFilterChange={this.onFilterChange}
      />
      <table>
        <thead>
          <tr>
            <th>Repo Name</th>
            <th>Requested</th>
            <th>Claim</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </div>
  }
}

const PendingPrrrsTableControls = props => {
  const {
    count,
    filter,
    onFilterChange,
  } = props

  return <div className="ReviewPage-PendingPrrrsTable-controls">
    <span>{count} pending Prrrs</span>
    <SearchField
      placeholder="filter"
      value={filter}
      onChange={onFilterChange}
    />
  </div>
}


const PendingPrrrsTableRow = ({prrr}) => {
  const href = prrrToPullRequestURL(prrr)
  return <tr>
    <td>
      <Link href={href} target="_blank">
        {prrr.repo}
      </Link>
    </td>
    <td>
      <Date fromNow date={prrr.created_at} />
    </td>
    <td>
      <Button thin onClick={_ => claimPrrr(prrr.id) }>Claim</Button>
    </td>
  </tr>
}
