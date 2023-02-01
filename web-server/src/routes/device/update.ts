import type { FastifyInstance } from 'fastify'
import Device from '../../api/device'
import type { IDevice } from '../../interfaces'
import { log } from '../../lib/util'

export default function(fastify: FastifyInstance) {
  fastify.post('/api/device', {
    schema: {
      body: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' }
        },
        required: ['id','name']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      log(`New device update request: ${request.id}`)
      // 2023/01/31, 11:22:52 New device update request: req-4
      log(`Request ${request.id} body: `, request.body)
      // 2023/01/31, 11:22:52 Request req-4 body:  { id: 1, name: 'Test Device' }
      const { id, name } = <IDevice>request.body
      const device = await Device.update(id, { name })

      // TODO: check that device name has changed?
      if (!device) {
        reply.status(404)
        return reply.send('Not Found')
      }

      return reply.send({ device })
    } catch(err) {
      log(err)
      reply.status(500)
      reply.send('Failed to update the device')
    }
  })
}