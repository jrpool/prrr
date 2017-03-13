import SocketIO from 'socket.io'
import logger from './logger'
import Queries from './queries'
import Commands from './commands'

const initialize = (server, httpServer) => {
  const io = new SocketIO(httpServer)
  io.use((socket, next) => {
    server.sessionMiddleware(socket.request, socket.request.res, next)
  })
  io.use(loadCurrentUser)
  io.on('connection', initializeConnection)
}

const loadCurrentUser = function(socket, next){
  const session = socket.request.session
  socket.session = session

  const currentUserGithubId = (
    session &&
    session.passport &&
    session.passport.user &&
    session.passport.user.github_id
  )

  if (currentUserGithubId){
    new Queries().getUserByGithubId(session.passport.user.github_id)
      .then(user => {
        socket.user = user
        socket.queries = new Queries(user)
        socket.commands = new Commands(user)
        next()
      })
  } else {
    socket.user = null
    socket.queries = new Queries()
    socket.commands = new Commands()
    next()
  }
}

const initializeConnection = (socket) => {
  let { session, user, commands, queries } = socket

  logger.info('socket connection initialized', { session, user })

  const on = (eventType, handler) => {
    socket.on(eventType, payload => {
      logger.info(`SERVER SOCKET RCV "${eventType}"`)
      logger.silly(JSON.stringify({eventType, payload}))
      return handler(payload)
    })
  }

  const emit = (eventType, payload) => {
    logger.info(`SERVER SOCKET EMIT "${eventType}"`)
    logger.silly(JSON.stringify({eventType, payload}))
    socket.emit(eventType, payload)
  }

  const broadcast = (eventType, payload) => {
    logger.info(`SERVER SOCKET BROADCAST "${eventType}"`)
    logger.silly(JSON.stringify({eventType, payload}))
    socket.broadcast.emit(eventType, payload)
  }

  const broadcastToAll = (type, prrr) => {
    emit(type, prrr)
    broadcast(type, prrr)
  }

  const reportError = (context, error) => {
    error = Object.assign({}, error, {
      context,
      message: error.message,
      stack: error.stack,
    })
    emit('errorOccured', {error})
  }

  emit('updateSession', {user})

  if (user) {
    queries.getPrrrs()
      .then(prrrs => {
        socket.emit('initialPrrrs', prrrs)
      })
      .catch(error => {
        reportError('loading initial prrrs', error)
      })
  }

  on('loadMetricsForWeek', ({week}) => {
    if (!user) return
    queries.metricsForWeek(week)
      .then(metricsForWeek => {
        emit('metricsForWeek', {week, metricsForWeek})
      })
      .catch(error => {
        reportError(`loading metrics for week ${week}`, error)
      })
  })

  on('loadAllPrrrs', ({week}) => {
    if (!user) return
    queries.getAllPrrrs()
      .then(prrrs => {
        emit('initialPrrrs', prrrs)
      })
      .catch(error => {
        reportError(`loading all prrrs`, error)
      })
  })


  on('createPrrr', (payload) => {
    if (!user) return
    commands.createPrrr(payload)
      .then(prrr => {
        broadcastToAll('PrrrUpdated', prrr)
      })
      .catch(error => {
        reportError(`creating Prrr for ${JSON.stringify(payload)}`, error)
      })
  })


  on('archivePrrr', ({prrrId}) => {
    if (!user) return
    commands.archivePrrr(prrrId)
      .then(prrr => {
        broadcastToAll('PrrrUpdated', prrr)
      })
      .catch(error => {
        reportError(`archiving Prrr ${prrrId}`, error)
      })
  })


  on('claimPrrr', ({prrrId}) => {
    if (!user) return
    commands.claimPrrr(prrrId)
      .then(prrr => {
        if (prrr){
          emit('PrrrClaimed', prrr)
          broadcastToAll('PrrrUpdated', prrr)
        }
      })
      .catch(error => {
        reportError(`claiming Prrr ${prrrId}`, error)
      })
  })


  on('skipPrrr', ({prrrId}) => {
    if (!user) return
    commands.skipPrrr(prrrId)
      .then(({newClaimedPrrr, skippedPrrr}) => {
        if (skippedPrrr) broadcastToAll('PrrrUpdated', skippedPrrr)
        if (newClaimedPrrr){
          broadcastToAll('PrrrUpdated', newClaimedPrrr)
          emit('PrrrClaimed', newClaimedPrrr)
        }
      })
      .catch(error => {
        reportError(`unclaiming Prrr ${prrrId}`, error)
      })
  })


  on('unclaimPrrr', ({prrrId}) => {
    if (!user) return
    commands.unclaimPrrr(prrrId)
      .then(prrr => {
        broadcastToAll('PrrrUpdated', prrr)
      })
      .catch(error => {
        reportError(`unclaiming Prrr ${prrrId}`, error)
      })
  })


  on('completePrrr', ({prrrId}) => {
    if (!user) return
    commands.completePrrr(prrrId)
      .then(prrr => {
        broadcastToAll('PrrrUpdated', prrr)
      })
      .catch(error => {
        reportError(`completing Prrr ${prrrId}`, error)
      })
  })
}




export default {
  initialize,
}
