import React, { Component, PropTypes } from 'react'
import moment from 'moment'

export default class Date extends Component {
  static propTypes = {
    date: PropTypes.oneOfType([
      PropTypes.instanceOf(moment),
      PropTypes.string,
      PropTypes.date,
    ]).isRequired,
    fromNow: PropTypes.bool.isRequired
  };

  static defaultProps = {
    fromNow: false,
  };

  render(){
    const date = moment(this.props.date)
    const title = date.format("dddd, MMMM Do YYYY, h:mm:ss a");
    const value = this.props.fromNow
      ? date.fromNow(false)
      : title
    return <span
      className="Date"
      title={title}
      value={value}
    >
      {value}
    </span>
  }
}

