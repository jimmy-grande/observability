import agent from 'elastic-apm-node'
import { wrapWithAgent } from './features/wrap'
import { couchbaseHandler } from './instrumentation/couchbase'

agent.clearPatches('couchbase')
agent.start()
agent.addPatch('couchbase', couchbaseHandler)
const wrap = wrapWithAgent(agent)

export { agent, wrap }
