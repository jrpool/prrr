import React, { Component, PropTypes } from 'react'
import Button from '../../atoms/Button'
import Layout from '../../molecules/Layout'
import InspectObject from '../../utils/InspectObject'
import { createPrrr } from '../../../actions'
import './index.sass'

export default class RequestReviewPage extends Component {
  render(){
    const { session, errors=[] } = this.props
    return <Layout className="RequestReviewPage" session={session} errors={errors}>
      <div className="RequestReviewPage-RequestBox">
        <CreatePrrrForm />
      </div>
    </Layout>
  }
}


class CreatePrrrForm extends Component {

  static contextTypes = {
    redirectTo: PropTypes.func.isRequired,
  }

  constructor(props){
    super(props)
    this.state = {
      url: '',
      error: null,
      owner: null,
      repo: null,
      number: null,
      creating: false,
    }
  }

  componentDidMount(){
    this.refs.link.focus()
  }

  onChange = () => {
    const url = this.refs.link.value
    const { error, owner, repo, number } = parsePullRequestURL(url)
    this.setState({url, error, owner, repo, number})
  }

  isValid(){
    const {url, error, owner, repo, number} = this.state
    return !error && owner && repo && number
  }

  createPrrr = (event) => {
    event.preventDefault()
    this.onChange()
    if (!this.isValid()) return
    const { owner, repo, number } = this.state
    this.setState({creating: true})
    createPrrr({owner, repo, number})
    this.context.redirectTo('/')
  }

  render(){
    const { creating, url, error, owner, repo, number} = this.state
    if (creating) return <div>Creating Pull Request Review Request...</div>

    let errorMessage = error && error.message
    if (errorMessage === 'duplicate')
      errorMessage = 'This pull request has allready been added'

    const disabled = !this.isValid()


    return <form className="RequestReviewPage-CreatePrrrForm" onSubmit={this.createPrrr}>
      <h1>Request a Review of a Pull Request</h1>
      {errorMessage && <h2>ERROR: {errorMessage}</h2>}
      <div className="RequestReviewPage-InputBoxPadding">
        <input className="RequestReviewPage-InputBox"
          type="text"
          placeholder="PR URL"
          ref="link"
          value={url}
          onChange={this.onChange}
          onBlur={this.onChange}
        />
      </div>
      <div className="RequestReviewPage-Text">
        owner:
        <span className="RequestReviewPage-SubmittedText">
        {owner}
      </span>
      </div>
      <div className="RequestReviewPage-Text">
        repo:
        <span className="RequestReviewPage-SubmittedText">
        {repo}
      </span>
      </div>
      <div className="RequestReviewPage-Text">
        number:
        <span className="RequestReviewPage-SubmittedText">
        {number}
      </span>
      </div>
      <div className="RequestReviewPage-ButtonDiv">
        <Button type="success" submit disabled={disabled}>Add Prrr</Button>
      </div>
    </form>
  }
}


const GITHUB_PULL_REQUEST_REGEXP = /github.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/
const parsePullRequestURL = function(url){
  // https://github.com/GuildCrafts/Trossello/pull/147
  const matches = url.match(GITHUB_PULL_REQUEST_REGEXP)
  if (!matches) return {
    error: 'invalid pull request url'
  }
  return {
    owner: matches[1],
    repo: matches[2],
    number: Number(matches[3]),
  }
}
