import type { FastifyInstance } from 'fastify'
import Telemetry from '../../api/telemetry'
import type { ITelemetryFormPayload } from '../../interfaces'
import { log } from '../../lib/util'

export default function(fastify: FastifyInstance) {
  fastify.post('/api/telemetry', {
    schema: {
      body: {
        type: 'object',
        properties: {
          devices: { type: 'array' },
          date: { type: 'object' },
          page: { type: 'object' }
        },
        required: ['devices','date','page']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            telemetry: { type: 'array' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      log(`New find telemetry request: ${request.id}`)
      // 2023/01/31, 11:47:32 New find telemetry request: req-7
      log(`Request ${request.id} body: `, request.body)
      // 2023/01/31, 11:47:32 Request req-7 body:  {
      //   devices: [],
      //   date: { from: null, to: null },
      //   page: { number: 1, size: 100 }
      // }

      // Access the payload
      const payload = <ITelemetryFormPayload>request.body
      // Search the database
      const { total, telemetry } = await Telemetry.page(payload)

      log(`Request ${request.id} response: `, { total, telemetry: typeof telemetry[0] === 'undefined' ? [] : [telemetry[0]] })
      // 2023/01/31, 11:58:52 Request req-7 response:  {
      //   total: 1,
      //   telemetry: [
      //     {
      //       id: 1,
      //       timestamp: 1675158414999n,
      //       temperature: 26.29999924,
      //       humidity: 86,
      //       heatIndex: 28.58694458,
      //       soilMoisture: 100,
      //       deviceId: 1
      //     }
      //   ]
      // }

      // Return the matching results
      reply.send({ total, telemetry })
    } catch (err) {
      log(err)
      reply.status(500)
      reply.send('Failed to find the telemetry')
    }
  })
}