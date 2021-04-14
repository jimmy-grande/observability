type SafeServiceName = () => string
export const safeServiceName: SafeServiceName = () => {
  return (process.env.ELASTIC_APM_SERVICE_NAME || (process.env.npm_package_name as string))
    .replace('@', '')
    .replace('/', '_')
}
