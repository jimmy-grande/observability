import { safeServiceName } from './safeServiceName'

describe('Create a safe service name to comply with APM', () => {
  beforeEach(() => {
    delete process.env.ELASTIC_APM_SERVICE_NAME
  })
  it('should return a name without special characters from ELASTIC_APM_SERVICE_NAME env', () => {
    const allowedServiceName = /^[a-zA-Z0-9 _-]+$/
    process.env.ELASTIC_APM_SERVICE_NAME = '@My/PACkage'
    const safeName = safeServiceName()
    const isSafe = allowedServiceName.test(safeName)
    expect(isSafe).toBeTruthy()
    expect(safeName).toEqual('My_PACkage')
  })

  it('should use npm_package_name env if ELASTIC_APM_SERVICE_NAME is not set', () => {
    const expectedResult = 'observability_tracing'
    const safeName = safeServiceName()
    expect(safeName).toEqual(expectedResult)
  })

  it('should return a name without special characters from npm_package_name env', () => {
    const allowedServiceName = /^[a-zA-Z0-9 _-]+$/
    const isSafe = allowedServiceName.test(safeServiceName())
    expect(isSafe).toBeTruthy()
  })
})
