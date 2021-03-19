import agent from 'elastic-apm-node'

/// <reference types="elastic-apm-node" />
export type Agent = typeof agent
export type Span = typeof agent.currentSpan
type HandlerOptions = {
  version?: string
  enabled: boolean
}
export type Handler<T = any> = (exports: T, agent: Agent, options: HandlerOptions) => T
