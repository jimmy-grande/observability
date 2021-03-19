import couchbase from 'couchbase'
import { wrapWithAgent } from '../../features/wrap'
import { Handler } from '../../models'

/* TODO:
 * [x] Handle subdocument
 * [x] Handle MutateInSpec
 */

/*
 * typescript definitions for couchbase does not expose the real exports from couchbase.js
 * so I decided to typed the handler with an any type
 * TODO: find a way to improve couchbase typings
 */
export const couchbaseHandler: Handler<any> = (exports, agent, options) => {
  console.log('OPTIONS:::', options)
  if (!options.enabled || !options.version?.startsWith('3')) {
    return exports
  }
  const wrap = wrapWithAgent(agent)
  const basicMetadata = {
    type: 'db',
    subtype: 'couchbase',
  }

  function wrapWithContext(prototype: any, metadata: any) {
    const original = prototype
    return function() {
      const args = arguments
      return wrap(
        original,
        metadata,
        // @ts-ignore
        this,
      )(...args)
    }
  }

  const newBucket = wrapWithContext(
    exports.Cluster.prototype.bucket,
    (agent: any, bucketName: any) => {
      return agent.startSpan(
        `Init bucket connection :: ${bucketName}`,
        basicMetadata.type,
        basicMetadata.subtype,
        'connection',
      )
    },
  )

  const newCollectionGet = wrapWithContext(
    exports.Collection.prototype.get,
    (agent: any, docId: string) => {
      return agent.startSpan(
        `get > ${docId}`,
        basicMetadata.type,
        basicMetadata.subtype,
        'document.get',
      )
    },
  )

  const newCollectionUpsert = wrapWithContext(
    exports.Collection.prototype.upsert,
    (agent: any, docId: string) => {
      return agent.startSpan(
        `upsert > ${docId}`,
        basicMetadata.type,
        basicMetadata.subtype,
        'document.upsert',
      )
    },
  )

  const newCollectionRemove = wrapWithContext(
    exports.Collection.prototype.remove,
    (agent: any, docId: string) => {
      return agent.startSpan(
        `remove > ${docId}`,
        basicMetadata.type,
        basicMetadata.subtype,
        'document.remove',
      )
    },
  )

  const newCollectionMutateIn = wrapWithContext(
    exports.Collection.prototype.mutateIn,
    (agent: any, docId: string, operations: any[]) => {
      const span = agent.startSpan(
        `mutateIn > ${docId}`,
        basicMetadata.type,
        basicMetadata.subtype,
        'subDocument update',
      )
      span.addLabels({
        operations: JSON.stringify(operations),
      })
      return span
    },
  )

  const newMutateInSpecUpsert = wrapWithContext(
    exports.MutateInSpec.prototype.upsert,
    (agent: any, path: string, value: any) => {
      const span = agent.startSpan(
        `mutateIn > upsert`,
        basicMetadata.type,
        basicMetadata.subtype,
        'subDocument upsert',
      )
      span.addLabels({
        path,
        value,
      })
      return span
    },
  )

  const newMutateInSpecArrayAppend = wrapWithContext(
    exports.MutateInSpec.prototype.arrayAppend,
    (agent: any, path: string, value: any) => {
      const span = agent.startSpan(
        `mutateIn > arrayAppend`,
        basicMetadata.type,
        basicMetadata.subtype,
        'subDocument arrayAppend',
      )
      span.addLabels({
        path,
        value,
      })
      return span
    },
  )
  const connect = wrap(exports.connect, {
    ...basicMetadata,
    action: 'connect',
    name: 'Init cluster connection',
  })
  exports.connect = connect
  exports.Cluster.prototype.bucket = newBucket
  exports.Collection.prototype.get = newCollectionGet
  exports.Collection.prototype.upsert = newCollectionUpsert
  exports.Collection.prototype.remove = newCollectionRemove
  exports.Collection.prototype.mutateIn = newCollectionMutateIn
  exports.MutateInSpec.prototype.upsert = newMutateInSpecUpsert
  exports.MutateInSpec.prototype.arrayAppend = newMutateInSpecArrayAppend

  return exports
}
