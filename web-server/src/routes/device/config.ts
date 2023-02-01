import type { FastifyInstance } from 'fastify'
import Config from '../../api/config'
import { log } from '../../lib/util'

export default function(fastify: FastifyInstance) {
  fastify.post('/api/device/config', async (request, reply) => {
    try {
      log(`New config request: ${request.id}`)
      // 2023/01/31, 11:19:24 New config request: req-3
      log(`Request ${request.id} body: `, request.body)
      // 2023/01/31, 11:19:24 Request req-3 body:  { deviceId: 1 }
      //@ts-ignore
      const { chipId } = request.body
      const config = await Config.findDeviceConfig(chipId)
      reply.send(config)
    } catch (err: any) {
      log(err)
      reply.status(500)
      reply.send('Failed to find the device configuration')
    }
  })
}