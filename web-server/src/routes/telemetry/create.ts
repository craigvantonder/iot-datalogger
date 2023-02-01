import type { FastifyInstance } from 'fastify'
import type { ITelemetry } from '../../interfaces'
import Telemetry from '../../api/telemetry'
import Device from '../../api/device'
import Config from '../../api/config'
import { ws } from '../../lib/websocket'
import { log } from '../../lib/util'

export default function(fastify: FastifyInstance) {
  fastify.put('/api/telemetry', {
    schema: {
      body: {
        type: 'object',
        properties: {
          chipId: { type: 'number' },
          timestamp: { type: 'number' },
          temperature: { type: 'number' },
          humidity: { type: 'number' },
          heatIndex: { type: 'number' },
          soilMoisture: { type: 'number' }
        },
        required: ['chipId','timestamp','temperature','humidity','heatIndex','soilMoisture']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            readingInterval: { type: 'string' },
            manualReadingInterval: { type: 'number' },
            userLed: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      log(`New telemetry request: ${request.id}`)
      // 2023/01/31, 10:51:59 New telemetry request: req-2
      log(`Request ${request.id} body: `, request.body)
      // 2023/01/31, 10:51:59 Request req-2 body:  {
      //   chipId: 6090984,
      //   timestamp: 1675155119474,
      //   temperature: 25.79999924,
      //   humidity: 81,
      //   heatIndex: 27.30951309,
      //   soilMoisture: 100
      // }

      // Separate the chipId from the payload
      const { chipId, ...payload } = <ITelemetry>request.body

      // Create the record
      const device = await Device.findByChipId(chipId as number)
      if (!device) throw new Error('This should not be possible, unable to find the device configuration to create the telemetry.')
      const telemetry = await Telemetry.create({ ...payload, deviceId: device.id })

      // Notify the client application
      ws.send(JSON.stringify({ action: 'notify', channel: 'telemetry', message: telemetry }))

      // Get the current config
      const { readingInterval, manualReadingInterval, userLed } = await Config.findDeviceConfig(device.id)

      // Return it to the device
      log(`Request ${request.id} response: `, { readingInterval, manualReadingInterval, userLed })
      // 2023/01/31, 10:51:59 Request req-2 response:  { readingInterval: 'sec', manualReadingInterval: 40, userLed: false }
      reply.send({ readingInterval, manualReadingInterval, userLed })
    } catch (err) {
      log(err)
      reply.status(500)
      reply.send('Failed to create the device telemetry')
    }
  })
}