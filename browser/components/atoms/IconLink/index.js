import React, { Component, PropTypes } from 'react'
import Icon from '../Icon'
import Link from '../Link'

export default class IconLink extends Component {

  static propTypes = {
    href: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }

  render(){
    const props = Object.assign({}, this.props)
    delete props.type
    return <Link {...props}>
      <Icon type={this.props.type} />&nbsp;
      <span>{this.props.children}</span>
    </Link>
  }
}
