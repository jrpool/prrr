import path from 'path'
import winston from 'winston'
import stripcolorcodes from 'stripcolorcodes'

process.env.LOG_LEVEL = process.env.LOG_LEVEL || (
  process.env.NODE_ENV === 'development'
    ? 'silly'
    : process.env.NODE_ENV === 'test'
      ? 'silly'
      : 'warn'
)
const LOG_DIRECTORY = path.resolve(__dirname, '../../log')

winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'white',
  verbose: 'grey',
  debug: 'blue',
  silly: 'green',
});

const logger = new winston.Logger()

if (process.env.NODE_ENV === 'development'){
  logger.add(
    winston.transports.Console,
    {
      colorize: true,
      json: false,
      stringify: true,
    }
  )
}

if (process.env.NODE_ENV === 'production'){
  logger.add(
    winston.transports.Console,
    {
      colorize: false,
      json: true,
      stringify: true,
    }
  )
}

if (process.env.NODE_ENV !== 'production'){
  logger.add(
    winston.transports.File,
    {
      json: false,
      filename: path.resolve(LOG_DIRECTORY, `${process.env.NODE_ENV}.log`),
      formatter: function(options) {
        return `${options.level}: ${stripcolorcodes(options.message)}`
      }
    }
  )
}

logger.exitOnError = false

logger.level = process.env.LOG_LEVEL

logger.stream = {
  write: function(message, encoding){
    logger.info(message.replace(/\n+$/, ''));
  }
}

export default logger
