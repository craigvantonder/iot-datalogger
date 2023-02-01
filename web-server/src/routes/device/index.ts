import type { FastifyInstance } from 'fastify'
import Device from '../../api/device'
import { log } from '../../lib/util'

export default function(fastify: FastifyInstance) {
  fastify.get('/api/device', async (request, reply) => {
    try {
      log(`New find devices request: ${request.id}`)
      // 2023/01/31, 11:31:35 New device update request: req-6

      // Find the devices
      const devices = await Device.findAll()

      log(`Request ${request.id} response: `, devices)
      // 2023/01/31, 11:31:35 Request req-6 response:  [
      //   {
      //     id: 1,
      //     chipId: 6090984,
      //     chipModel: 'ESP32-D0WDQ5',
      //     chipRevision: 1,
      //     chipCores: 2,
      //     macAddress: '4C:75:25:5C:F0:E8',
      //     name: 'Test Device'
      //   }
      // ]

      // Return them
      reply.send({ devices })
    } catch (err) {
      log(err)
      reply.status(500)
      reply.send('Failed to find the devices')
    }
  })
}