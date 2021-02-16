import agent from 'elastic-apm-node'
import { wrapWithAgent, asyncWrapWithAgent } from './features/wrap'

// agent.addPatch('couchbase', couchbaseHandler)
const wrap = wrapWithAgent(agent)
const asyncWrap = asyncWrapWithAgent(agent)

export { agent, wrap, asyncWrap }
