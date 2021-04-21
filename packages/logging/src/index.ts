import { agent } from '@observability/tracing'
import pino from 'pino'
import kafkaTransport from 'pino-kafka'
import { TransportType } from './models/core'

const prettyPrint: pino.PrettyOptions = {
  translateTime: true,
}
const defaultOptions: pino.LoggerOptions = {
  mixin: () => {
    let agentProps: object = {}
    if (agent.isStarted()) {
      const traceIds = agent.currentTraceIds
      agentProps = {
        traceId: traceIds['trace.id'],
        transactionId: traceIds['transaction.id'],
        spanId: traceIds['span.id'],
      }
    }

    return {
      appName: process.env.npm_package_name,
      appVersion: process.env.npm_package_version,
      ...agentProps,
    }
  },

  formatters: {
    level: (level, num) => ({
      level,
    }),
  },
  level: 'debug',
  prettyPrint:
    process.env.LOG_TRANSPORT !== TransportType.KAFKA &&
    (process.env.NODE_ENV === 'local' || process.env.NODE_ENV === undefined)
      ? prettyPrint
      : false,
}
let transport: pino.DestinationStream
switch (process.env.LOG_TRANSPORT as TransportType) {
  case TransportType.FILE:
    console.log('INFO', __dirname, process.cwd())
    transport = pino.destination({
      dest: `${process.env.LOG_PATH || process.cwd()}`, // TODO: make it work with another path
      sync: false,
    })
    break
  case TransportType.KAFKA:
    if (!process.env.LOG_BROKER || !process.env.LOG_TOPIC) {
      console.warn(
        'Missing kafka configuration.\r\n You should provide at least these 2 environment variables: %s, %s.\r\nSwitching to default transport.',
        'LOG_BROKER',
        'LOG_TOPIC',
      )
      transport = pino.destination(process.stdout.fd)
    } else {
      transport = kafkaTransport({
        brokers: process.env.LOG_BROKER,
        defaultTopic: process.env.LOG_TOPIC,
      })
    }
    break
  case TransportType.STDOUT:
  default:
    transport = pino.destination(process.stdout.fd)
    break
}
const logger = pino(defaultOptions, transport)

export default logger
