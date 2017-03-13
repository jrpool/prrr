import React, { Component } from 'react'
import Prrrs from '../../Prrrs'
import Layout from '../molecules/Layout'
import MyRequestedPrrrs from '../molecules/MyRequestedPrrrs'
import MyReviewedPrrrs from '../molecules/MyReviewedPrrrs'
import ClaimAPrrr from '../molecules/ClaimAPrrr'
import ToggleableSection from '../utils/ToggleableSection'

export default class LoggedInHomePage extends Component {
  render(){
    const { session, errors=[] } = this.props

    const prrrs = new Prrrs({
      currentUser: session.user,
      prrrs: this.props.prrrs,
    })

    return <Layout className="HomePage" session={session} errors={errors}>
      <ToggleableSection title="My Requested Prrrs">
        <MyRequestedPrrrs
          currentUser={session.user}
          prrrs={prrrs}
        />
      </ToggleableSection>

      <ToggleableSection title="My Reviewed Prrrs">
        <MyReviewedPrrrs
          currentUser={session.user}
          prrrs={prrrs}
        />
      </ToggleableSection>
    </Layout>
  }
}
