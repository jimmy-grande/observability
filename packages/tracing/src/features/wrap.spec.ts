import agent, { endTransaction } from 'elastic-apm-node'
import { Agent } from '../models'
import { wrapWithAgent } from './wrap'

jest.mock('elastic-apm-node')

const observableFunction = wrapWithAgent(agent)

describe('Create an observable function', () => {
  it('should start a span and execute a function', () => {
    const spyAgent = jest.spyOn(agent, 'startSpan')
    const spyLog = jest.spyOn(console, 'log')
    const log = observableFunction(console.log)
    const input = 'first test'
    log(input)
    expect(spyAgent).toBeCalled()
    expect(spyLog).toHaveBeenCalledWith(input)
  })
  it('should observe and execute a function with several arguments', () => {
    const message = 'Log %s %d %j %o'
    const args = ['a string', 10, true, ['element1', 'element2']]
    const spyLog = jest.spyOn(console, 'log')
    const log = observableFunction(console.log)
    log(message, ...args)
    expect(spyLog).toHaveBeenCalledWith(message, ...args)
  })
  it('should observe and execute a resolved asynchronous function', async () => {
    const asyncStr = async (message: string): Promise<string> => {
      await new Promise(resolve => {
        setTimeout(resolve, 2000)
      })
      return message
    }
    const endSpanMock = jest.fn()
    const mockAgent = jest.fn(() => ({
      startSpan: (name: string) => ({
        end: endSpanMock,
      }),
    }))
    const observableFunction = wrapWithAgent((mockAgent() as unknown) as Agent)
    const message = 'I am an async string!'
    const mockAsyncStr = jest.fn(asyncStr)
    const asyncObsStr = observableFunction(mockAsyncStr)
    const str = await asyncObsStr(message)

    expect(str).toEqual(message)
    expect(endSpanMock).toHaveBeenCalled()
    expect(mockAsyncStr.mock.invocationCallOrder[0]).toBeLessThan(
      endSpanMock.mock.invocationCallOrder[0],
    )
  })

  it('should observe and execute a rejected asynchronous function', async () => {
    const asyncStr = async (message: string): Promise<string> => {
      await new Promise((_, reject) => {
        setTimeout(() => reject('I need to reject'), 2000)
      })
      return message
    }
    const captureErrorMock = jest.fn()
    const endSpanMock = jest.fn()
    const mockAgent = jest.fn().mockImplementation(() => ({
      captureError: captureErrorMock,
      startSpan: (name: string) => ({
        end: endSpanMock,
      }),
    }))
    const observableFunction = wrapWithAgent((mockAgent() as unknown) as Agent)
    const asyncObsStr = observableFunction(asyncStr)

    await asyncObsStr('Some string')
    expect(captureErrorMock).toHaveBeenCalled()
    expect(endSpanMock).toHaveBeenCalled()
  })
})
