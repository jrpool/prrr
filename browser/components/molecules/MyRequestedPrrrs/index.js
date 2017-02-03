import React, { Component, PropTypes } from 'react'
import moment from 'moment'
import Prrrs from '../../../Prrrs'
import Link from '../../atoms/Link'
import Icon from '../../atoms/Icon'
import Date from '../../atoms/Date'
import Button from '../../atoms/Button'
import GithubUsername from '../../atoms/GithubUsername'
import PrrrsTable from '../PrrrsTable'
import ErrorMessage from '../../atoms/ErrorMessage'
import ArchivePrrrButton from '../../atoms/ArchivePrrrButton'


export default class MyRequestedPrrrs extends Component {
  static propTypes = {
    currentUser: PropTypes.object.isRequired,
    prrrs: PropTypes.instanceOf(Prrrs).isRequired,
  }

  renderAdditionalHeaders(){
    return [
      <th key="claimed">Claimed By</th>,
      <th key="completed">Completed</th>,
      <th key="actions">Actions</th>
    ]
  }

  renderClaimedCell( prrr, currentUser ){
    return prrr.claimed_by
      ? <td key="claimed">
          <span>by&nbsp;</span>
          <GithubUsername username={prrr.claimed_by} currentUser={currentUser} />
          <span>&nbsp;</span>
          <Date fromNow date={prrr.claimed_at} />
        </td>
    : <td key="claimed"></td>
  }

  renderCompletedCell( prrr, currentUser ){
    return prrr.completed_at
      ? <td key="completed">
        <span>&nbsp;</span>
        <Date fromNow date={prrr.completed_at} />
      </td>
      : <td key="completed"></td>
  }

  renderAdditionalCells = (prrr) => {
    const { currentUser } = this.props
    return [
      this.renderClaimedCell(prrr, currentUser),
      this.renderCompletedCell(prrr, currentUser),
      <td key="archive">
        <ArchivePrrrButton prrr={prrr} disabled={!!prrr.claimed_at} />
      </td>,
    ]
  }

  render(){
    const {currentUser} = this.props
    const prrrs = this.props.prrrs.requestedByMe()
      .sort((a, b) =>
        moment(b.created_at).valueOf() -
        moment(a.created_at).valueOf()
      )
    return <div>
      <PrrrsTable
        className="MyRequestedPrrrs"
        currentUser={currentUser}
        prrrs={prrrs}
        renderAdditionalHeaders={this.renderAdditionalHeaders}
        renderAdditionalCells={this.renderAdditionalCells}
      />
    </div>
  }

}
