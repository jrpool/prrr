import React, { Component, PropTypes } from 'react'
import Link from '../../atoms/Link'
import Icon from '../../atoms/Icon'
import Date from '../../atoms/Date'
import Button from '../../atoms/Button'
import GithubUsername from '../../atoms/GithubUsername'
import { archivePrrr } from '../../../actions'
import './index.sass'

export default class PrrrsTable extends Component {
  static propTypes = {
    currentUser: PropTypes.object.isRequired,
    prrrs: PropTypes.array.isRequired,
    renderAdditionalHeaders: PropTypes.func.isRequired,
    renderAdditionalCells: PropTypes.func.isRequired,
  }

  render(){
    const {
      currentUser,
      prrrs,
      renderAdditionalCells,
      renderAdditionalHeaders,
    } = this.props
    const rows = prrrs.map(prrr => {
      const href = `https://github.com/${prrr.owner}/${prrr.repo}/pull/${prrr.number}`
      return <tr key={prrr.id}>
        <td className="PrrrsTable-pr">
          <Link href={href} target="_blank">
            {prrr.owner}/{prrr.repo}/pull/{prrr.number}
          </Link>
        </td>
        <td className="PrrrsTable-requested">
          <span>by&nbsp;</span>
          <GithubUsername username={prrr.requested_by} currentUser={currentUser} />
          <span>&nbsp;</span>
          <Date fromNow date={prrr.created_at} />
        </td>
        {renderAdditionalCells(prrr)}
      </tr>
    })
    return <table className={`PrrrsTable ${this.props.className||''}`}>
      <thead>
        <tr>
          <th className="PrrrsTable-pr">Pull Request</th>
          <th className="PrrrsTable-requested">Requested</th>
          {renderAdditionalHeaders()}
        </tr>
      </thead>
      <tbody>
        {rows}
      </tbody>
    </table>
  }
}
