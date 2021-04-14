import { agent } from '@observability/tracing'
import pino, { destination } from 'pino'
import kafkaTransport from 'pino-kafka'
import { Writable } from 'stream'

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
  prettyPrint: false,
  // process.env.NODE_ENV === 'local' || process.env.NODE_ENV === undefined ? prettyPrint : false,
}
const logger = pino(
  defaultOptions,
  kafkaTransport({
    brokers: 'localhost:9092',
    defaultTopic: 'app-logs',
  }),
)

logger.warn(process.env, 'Sample warn')
logger.error('Sample error')
logger.fatal('Sample fata')
/**
 * Kafka
 * File
 * STDIN
 */
type CreateInstance = (options: pino.LoggerOptions, destination?: string | Writable) => pino.Logger
const createInstance: CreateInstance = options => {
  let dest: pino.DestinationStream | undefined
  if (typeof destination === 'string') {
    dest = pino.destination({
      dest: destination,
    })
  }

  if (destination instanceof Writable) {
    dest = destination as Writable
  }
  const args = [{ ...defaultOptions, ...options }, dest]
  return pino(...args)
}
export { createInstance, logger }

process.stdin.resume()
