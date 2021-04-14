export interface LoggerModule {
  create: CreateLogger
}

type CreateLogger = (options: unknown) => Logger
// export type LoggerOptions = pino.LoggerOptions
