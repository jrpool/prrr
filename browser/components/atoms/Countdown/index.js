import React, { Component, PropTypes } from 'react'
import moment from 'moment'
import './index.sass'


export default class Countdown extends Component {

  static propTypes = {
    deadline: PropTypes.instanceOf(moment),
  }

  componentDidMount() {
    this.interval = setInterval(() => this.forceUpdate(), 1000)
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  render(){
    const { deadline } = this.props
    const secondsRemaining = deadline.diff(moment(), 'seconds')
    const className = `Timer ${secondsRemaining > 0 ? '' : 'Timer-out-of-time'}`
    return <div className={className}>
      <TimeRemaining secondsRemaining={secondsRemaining} />
    </div>
  }
}


const TimeRemaining = ({secondsRemaining}) => {
  if (secondsRemaining <= 0) return <span>00:00:00</span>
  const hour = Math.floor(secondsRemaining / 3600)
  const minutes = Math.floor(secondsRemaining / 60)
  const seconds = secondsRemaining % 60
  const formattedTime = `${padd(hour)}:${padd(minutes)}:${padd(seconds)}`
  return <span>{formattedTime}</span>
}

const padd = (number) => `0${number}`.slice(-2)
