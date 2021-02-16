import { Agent } from '../models'

type WrapWithAgent = (
  agent: Agent,
) => <T extends (...args: any[]) => any>(fn: T) => (...args: Parameters<T>) => ReturnType<T>
export const wrapWithAgent: WrapWithAgent = agent => fn => (...args) => {
  const span = agent.startSpan(fn.name)
  try {
    return fn(...args)
  } catch (error) {
    agent.captureError(error)
  } finally {
    span?.end()
  }
}

type AsyncWrapWithAgent = (
  agent: Agent,
) => <T extends (...args: any[]) => any>(
  fn: T,
) => (...args: Parameters<T>) => Promise<ReturnType<T>>
export const asyncWrapWithAgent: AsyncWrapWithAgent = agent => fn => async (...args) => {
  const span = agent.startSpan(fn.name)
  try {
    return await fn(...args)
  } catch (error) {
    agent.captureError(error)
  } finally {
    span?.end()
  }
}
