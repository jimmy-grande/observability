import agent from 'elastic-apm-node'

export type Agent = typeof agent
export type Span = typeof agent.currentSpan
type HandlerOptions = {
  version: string
  enabled: boolean
}
export type Handler<T> = (exports: T, agent: Agent, options: HandlerOptions) => void
