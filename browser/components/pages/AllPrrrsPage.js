import moment from 'moment'
import React, { Component } from 'react'
import Prrrs from '../../Prrrs'
import Date from '../atoms/Date'
import Link from '../atoms/Link'
import GithubUsername from '../atoms/GithubUsername'
import Layout from '../molecules/Layout'
import PrrrsTable from '../molecules/PrrrsTable'
import { loadAllPrrrs } from '../../actions'
import prrrToPullRequestURL from '../../prrrToPullRequestURL'


export default class AllPrrrsPage extends Component {
  constructor(props){
    super(props)
    loadAllPrrrs()
  }
  render(){
    const { session, errors=[] } = this.props
    const currentUser = session.user
    console.log('--------->', this.props.prrrs)
    const prrrs = new Prrrs({
      currentUser: currentUser,
      prrrs: this.props.prrrs || {},
    })
      .toArray()
      .sort((a, b) =>
        moment(b.created_at).valueOf() -
        moment(a.created_at).valueOf()
      )

    const rows = prrrs.map(prrr => {
      return <tr key={prrr.id}>
        <PrLinkTd prrr={prrr}/>
        <RequestedTd prrr={prrr} currentUser={currentUser} />
        <ArchivedTd prrr={prrr} />
        <ClaimedTd prrr={prrr} currentUser={currentUser} />
        <CompletedTd prrr={prrr} currentUser={currentUser} />
      </tr>
    })

    return <Layout className="AllPrrrs" session={session} errors={errors}>
      <h1>All Prrrs</h1>

      <table className={`PrrrsTable ${this.props.className||''}`}>
        <thead>
          <tr>
            <th className="AllPrrrs-pr">Pull Request</th>
            <th className="AllPrrrs-requested">Requested</th>
            <th className="AllPrrrs-archived">Archived</th>
            <th className="AllPrrrs-claimed">Claimed</th>
            <th className="AllPrrrs-claimed">Completed</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </Layout>
  }
}

const PrLinkTd = ({prrr}) => {
  const href = prrrToPullRequestURL(prrr)
  return <td className="AllPrrrs-pr">
    <Link href={href} target="_blank">
      {prrr.owner}/{prrr.repo}/pull/{prrr.number}
    </Link>
  </td>
}

const RequestedTd = ({currentUser, prrr}) => {
  return <td className="AllPrrrs-requested">
    <span>by&nbsp;</span>
    <GithubUsername username={prrr.requested_by} currentUser={currentUser} />
    <span>&nbsp;</span>
    <Date fromNow date={prrr.created_at} />
  </td>
}

const ArchivedTd = ({prrr}) => {
  if (prrr.archived_at) {
    return <td className="AllPrrrs-archived">
      <Date fromNow date={prrr.archived_at} />
    </td>
  }
  return <td className="AllPrrrs-archived" />
}

const ClaimedTd = ({currentUser, prrr}) => {
  if (prrr.claimed_by){
    return <td className="AllPrrrs-claimed">
      <span>by&nbsp;</span>
      <GithubUsername username={prrr.claimed_by} currentUser={currentUser} />
      <span>&nbsp;</span>
      <Date fromNow date={prrr.claimed_at} />
    </td>
  }
  return <td className="AllPrrrs-claimed"></td>
}

const CompletedTd = ({currentUser, prrr}) => {
  if (prrr.completed_at){
    return <td className="AllPrrrs-completed">
      <Date fromNow date={prrr.completed_at} />
    </td>
  }
  return <td className="AllPrrrs-completed"></td>
}
