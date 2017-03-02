import logger from './logger'
import state from './state'
import prrrToPullRequestURL from './prrrToPullRequestURL'
const io = require('socket.io-client')
const socket = io.connect(location.origin)

const on = (eventType, handler) => {
  socket.on(eventType, payload => {
    logger.debug('🕳 <-', eventType, payload)
    return handler(payload)
  })
}

export const emit = (eventType, payload) => {
  logger.debug('🕳 ->', eventType, payload)
  socket.emit(eventType, payload)
}

const ERROR_MESSAGE_LIFETIME = 5000
on('errorOccured', ({error}) => {
  const e = new Error(error.message)
  e.stack = error.stack
  logger.error(e)
  const errors = state.get().errors || []
  errors.push(error)
  state.set({errors})
  setTimeout(_ => {
    const errors = (state.get().errors || [])
      .filter(e => e !== error)
    state.set({errors})
  }, ERROR_MESSAGE_LIFETIME)
})

on('updateSession', (session) => {
  state.set({session})
})

on('initialPrrrs', (newPrrrs) => {
  const prrrs = state.get().prrrs || {}
  Object.keys(newPrrrs).forEach(prrrId => {
    prrrs[prrrId] = newPrrrs[prrrId]
  })
  state.set({prrrs})
})

on('metricsForWeek', ({week, metricsForWeek}) => {
  const metricsByWeek = state.get().metricsByWeek || {}
  metricsByWeek[week] = metricsForWeek
  state.set({metricsByWeek})
})

on('PrrrUpdated', (prrr) => {
  const prrrs = state.get().prrrs
  prrrs[prrr.id] = prrr
  state.set({prrrs})
})

on('PrrrClaimed', (prrr) => {
  const url = prrrToPullRequestURL(prrr)
  const popup = window.open(url, '_blank')
  if (popup) popup.focus()
})

window.DEBUG = window.DEBUG || {}
window.DEBUG.socket = socket
window.DEBUG.emit = emit
