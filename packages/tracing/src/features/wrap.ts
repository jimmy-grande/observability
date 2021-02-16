import { Agent, Span } from '../models'

type WrapWithAgent = (
  agent: Agent,
) => <T extends (...args: any[]) => any>(fn: T) => (...args: Parameters<T>) => ReturnType<T>
export const wrapWithAgent: WrapWithAgent = agent => fn => (...args) => {
  const isAsync = fn['constructor'].name === 'AsyncFunction'
  const span = agent.startSpan(fn.name)
  try {
    return isAsync
      ? fn(...args)
          .then((result: ReturnType<typeof fn>) => result)
          .catch(handleCatch(agent))
          .finally(handleFinally(span))
      : fn(...args)
  } catch (error) {
    agent.captureError(error)
  } finally {
    !isAsync && span?.end()
  }
}

const handleCatch = (agent: Agent) => (reason: string) => {
  agent.captureError(reason)
}
const handleFinally = (span: Span) => () => {
  span?.end()
}
