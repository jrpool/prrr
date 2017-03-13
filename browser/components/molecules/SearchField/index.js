import './index.sass'
import React, { Component } from 'react'
import Icon from '../../atoms/Icon'

export default class SearchField extends Component {
  render(){
    return <div className="SearchField">
      <Icon type="search" />
      <input
        ref="input"
        type="text"
        {...this.props}
      />
    </div>
  }
}
