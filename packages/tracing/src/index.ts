import agent from 'elastic-apm-node'
import { safeServiceName } from './features/safeServiceName'
import { wrapWithAgent } from './features/wrap'
import { couchbaseHandler } from './instrumentation/couchbase'

agent.clearPatches('couchbase')
agent.start({ serviceName: safeServiceName()})
agent.addPatch('couchbase', couchbaseHandler)
const trace = wrapWithAgent(agent)

export { agent, trace }
