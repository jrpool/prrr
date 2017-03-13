import React from 'react'
import SimpleReactRouter from 'simple-react-router'

// Pages
import NotFoundPage      from './components/pages/NotFoundPage'
import LoggedInHomePage  from './components/pages/LoggedInHomePage'
import LoggedOutHomePage from './components/pages/LoggedOutHomePage'
import RequestReviewPage from './components/pages/RequestReviewPage'
import ReviewPage        from './components/pages/ReviewPage'
import AllPrrrsPage      from './components/pages/AllPrrrsPage'
import MetricsPage       from './components/pages/MetricsPage'

export default class Router extends SimpleReactRouter {
  getRoutes(map, props){
    const { session } = props
    if (session.user){
      map('/',              LoggedInHomePage)
      map('/request',       RequestReviewPage)
      map('/review',        ReviewPage)
      map('/all',           AllPrrrsPage)
      map('/metrics',       MetricsPage)
      map('/metrics/:week', MetricsPage)
      map('/:path*', NotFoundPage)
    }else{
      map('/', LoggedOutHomePage)
      map('/:path*', LoggedOutHomePage)
    }
  }
}
