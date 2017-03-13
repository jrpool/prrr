import React, { Component, PropTypes } from 'react'
import Link from '../Link'
import './index.sass'

export default class Button extends Component {
  static propTypes = {
    type: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.bool,
    ]),
    href: PropTypes.string,
    submit: PropTypes.bool,
    noFocus: PropTypes.bool,
    disabled: PropTypes.bool,
    thin: PropTypes.bool,
  };

  static defaultProps = {
    submit: false,
    noFocus: false,
    disabled: false,
    thin: false,
  };

  render(){
    const type = this.props.type === false ? false : this.props.type || 'default'
    const props = Object.assign({}, this.props)
    delete props.type
    delete props.submit
    delete props.noFocus

    const buttonTypeClassName = type ? `Button-${type}` : ''
    props.className = `Button ${buttonTypeClassName} ${props.className||''}`

    if (props.thin) {
      props.className += ' Button-thin'
    }
    delete props.thin

    if (props.disabled) {
      props.className += ' Button-disabled'
      props.onClick = event => event.preventDefault()
    }

    if (this.props.submit){
      delete props.href
      props.type = 'submit'
    }

    if (props.disabled || this.props.noFocus){
      props.onFocus = event => event.target.blur()
      props.className += ' Button-nofocus'
      props.tabIndex = '-1'
    }
    return props.href ?
      <Link ref="button" {...props}>{this.props.children}</Link> :
      <button ref="button" {...props}>{this.props.children}</button>
  }
}

