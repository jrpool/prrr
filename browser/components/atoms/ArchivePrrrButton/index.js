import React, { Component, PropTypes } from 'react'
import Button from '../Button'
import Icon from '../Icon'
import { archivePrrr } from '../../../actions'
import prrrToPullRequestURL from '../../../prrrToPullRequestURL'

export default class ArchivePrrrButton extends Component {

  static propTypes = {
    prrr: PropTypes.object.isRequired,
    disabled: PropTypes.bool.isRequired,
  };

  static defaultProps = {
  	disabled: false,
  }

  render(){
    const { prrr, disabled } = this.props
	  return <Button
	  className="ArchivePrrrButton"
	  onClick={_ => confirmArchivePrrr(prrr)}
	  disabled={disabled}>
	  <Icon type="times" />
	  </Button>
  }
}


function confirmArchivePrrr(prrr){
  const url = prrrToPullRequestURL(prrr)
  const message = `Are you sure you want to archive your\n\nPull Request Review Request for\n\n${url}`
  if (confirm(message)) archivePrrr(prrr.id)
}
