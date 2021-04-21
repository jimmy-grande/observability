import agent from 'elastic-apm-node'
import { safeServiceName } from './features/safeServiceName'
import { wrapWithAgent } from './features/wrap'
import { couchbaseHandler } from './instrumentation/couchbase'

agent.clearPatches('couchbase')
agent.start({ serviceName: safeServiceName(), active: process.env.NODE_ENV === 'prod' })
agent.addPatch('couchbase', couchbaseHandler)
/**
 * **HOF that will create a span on the active transaction**
 * 
 * Usage:
 * ```
 * const logWithSpan = trace(console.log);
 * logWithSpan('My log message')
 * ```
 */
const trace = wrapWithAgent(agent)

export { agent, trace }
