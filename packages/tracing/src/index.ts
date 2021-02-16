import agent from 'elastic-apm-node'
import { wrapWithAgent } from './features/wrap'

// agent.addPatch('couchbase', couchbaseHandler)
const wrap = wrapWithAgent(agent)

export { agent, wrap }
