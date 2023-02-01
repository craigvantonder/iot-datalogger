import type { FastifyInstance } from 'fastify'
import { IConfig } from '../../interfaces'
import Config from '../../api/config'
import { log } from '../../lib/util'

export default function(fastify: FastifyInstance) {
  fastify.post('/api/config', {
    schema: {
      body: {
        type: 'object',
        properties: {
          deviceId: { type: 'number' },
          readingInterval: { type: 'string' },
          manualReadingInterval: { type: 'number' },
          userLed: { type: 'boolean' }
        },
        required: ['deviceId','readingInterval','manualReadingInterval','userLed']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            config: {
              type: 'object',
              properties: {
                readingInterval: { type: 'string' },
                manualReadingInterval: { type: 'number' },
                userLed: { type: 'boolean' },
                deviceId: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      log(`New config update request: ${request.id}`)
      // 2023/01/31, 11:25:15 New config update request: req-5
      log(`Request ${request.id} body: `, request.body)
      // 2023/01/31, 11:25:15 Request req-5 body:  {
      //   deviceId: 1,
      //   readingInterval: 'sec',
      //   manualReadingInterval: 15,
      //   userLed: false
      // }

      // Separate the deviceId from the config
      const { deviceId, ...restOfConfig } = <IConfig>request.body

      // Update the device configuration
      const countOfUpdatedRecords = await Config.updateDeviceConfig(deviceId as number, restOfConfig)

      // Bad request
      if (countOfUpdatedRecords === 0) return reply.status(400).send('No change')

      // Successful response
      return reply.status(200).send('Ok')
    } catch (err: any) {
      log(err)
      reply.status(500)
      reply.send('Failed to find the device configuration')
    }
  })
}
