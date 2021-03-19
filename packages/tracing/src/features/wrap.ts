import { Agent, Span } from '../models'

type WrapperMetada = {
  name?: string
  type?: string
  subtype?: string
  action?: string
}
type WrapWithAgent = (
  agent: Agent,
) => <T extends (...args: any[]) => any>(
  fn: T,
  metadata?: WrapperMetada | ((...args: any[]) => any),
  context?: any,
) => (...args: Parameters<T>) => ReturnType<T>
export const wrapWithAgent: WrapWithAgent = agent => (fn, metadata, context) => (...args) => {
  const isAsync = fn['constructor'].name === 'AsyncFunction'

  const span =
    typeof metadata === 'function'
      ? metadata(agent, ...args)
      : agent.startSpan(
          metadata?.name || fn.name,
          metadata?.type || null,
          metadata?.subtype || null,
          metadata?.action || null,
        )
  try {
    return isAsync
      ? (fn.call(context, ...args) as Promise<any>)
          .then((result: ReturnType<typeof fn>) => result)
          .catch(handleCatch(agent))
          .finally(handleFinally(span))
      : fn.call(context, ...args)
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

const applyMetadata = () => {}
