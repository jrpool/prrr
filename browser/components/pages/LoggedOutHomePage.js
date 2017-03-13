import React, { Component } from 'react'
import Button from '../atoms/Button'
import Layout from '../molecules/Layout'
import InspectObject from '../utils/InspectObject'
import './LoggedOutHomePage.sass'
import favicon from '../../images/favicon.ico'
import cat from '../../images/cat.jpg'

export default class LoggedOutHomePage extends Component {
  render(){
    return <div className="LoggedOutHomePage">
      <div className="LoggedOutHomePage-SectionOne">
        <span className="LoggedOutHomePage-title">
          Prrr
          <img src={favicon} className="LoggedOutHomePage-icon" />
        </span>
        <div className="LoggedOutHomePage-info">Pull Request Review Request</div>
      </div>
      <div className="LoggedOutHomePage-SectionTwo">
        <Button href={`/login?r=${encodeURIComponent(location.pathname)}`} externalLink>Login via Github</Button>
      </div>
      <div className="LoggedOutHomePage-SectionThree">
        <p> Review Together. </p>
      </div>
    </div>
  }
}
