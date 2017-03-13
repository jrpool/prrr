import React, { Component, PropTypes } from 'react'
import Link from '../../atoms/Link'
import Icon from '../../atoms/Icon'
import IconLink from '../../atoms/IconLink'
import Button from '../../atoms/Button'
import Avatar from '../../atoms/Avatar'
import './index.sass'
import prrrCat from '../../../images/prrrCat.ico'

export default class Navbar extends Component {

  static propTypes = {
    session: PropTypes.object.isRequired,
  }

  render(){
    const { user } = this.props.session
    return <div className="Navbar">
      <div>
        <Link className="Navbar-logo" href="/">
          <img src={prrrCat} />
          <span>Prrr</span>
        </Link>
        <IconLink className="Navbar-link" href="/request" type="plus-circle">Request A Review</IconLink>
        <IconLink className="Navbar-link" href="/review"  type="eye"        >Review A PR</IconLink>
        <IconLink className="Navbar-link" href="/metrics" type="area-chart" >Metrics</IconLink>
        <IconLink className="Navbar-link" href="/all"     type="circle"     >All Prrrs</IconLink>
      </div>
      <div>
        <Link href={`https://github.com/${user.github_username}`} externalLink className="Navbar-user-name">
          <span>{user.name}</span>
        </Link>
        <Link href={`https://github.com/${user.github_username}`} externalLink className="Navbar-avatar">
          <Avatar user={user} />
        </Link>
        <Link href="/logout" externalLink className="Navbar-button-logout">
          <Icon type="sign-out" title="Logout" />
        </Link>
      </div>
    </div>
  }
}
