import React, { Component, PropTypes } from 'react'
import Link from '../Link'

export default class GithubUsername extends Component {
  static propTypes = {
    username: PropTypes.string.isRequired,
    currentUser: PropTypes.object,
  };

  render(){
    const { username, currentUser } = this.props
    const name = currentUser && currentUser.github_username === username
      ? 'you'
      : username
    const href = `https://github.com/${username}`
    return <Link href={href} target="_blank">{name}</Link>
  }
}


GithubUsername
