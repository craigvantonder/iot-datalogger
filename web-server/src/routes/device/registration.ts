import type { FastifyInstance } from 'fastify'
import type { IDevice } from '../../interfaces'
import Config from '../../api/config'
import Device from '../../api/device'
import { ws } from '../../lib/websocket'
import { log } from '../../lib/util'

export default function(fastify: FastifyInstance) {
  fastify.post('/api/device/registration', {
    schema: {
      body: {
        type: 'object',
        properties: {
          chipId: { type: 'number' },
          chipModel: { type: 'string' },
          chipRevision: { type: 'number' },
          chipCores: { type: 'number' },
          macAddress: { type: 'string' }
        },
        required: ['chipId','chipModel','chipRevision','chipCores','macAddress']
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
      log(`New registration request: ${request.id}`)
      // 2023/01/31, 10:51:58 New registration request: req-1
      log(`Request ${request.id} headers: `, request.raw.rawHeaders)
      // 2023/01/31, 10:51:58 Request req-1 headers:  [
      //   'Host',
      //   '192.168.8.10:8081',
      //   'User-Agent',
      //   'ESP32HTTPClient',
      //   'Connection',
      //   'keep-alive',
      //   'Accept-Encoding',
      //   'identity;q=1,chunked;q=0.1,*;q=0',
      //   'Accept',
      //   'application/json',
      //   'Content-Type',
      //   'application/json',
      //   'Content-Length',
      //   '109'
      // ]
      log(`Request ${request.id} body: `, request.body)
      // 2023/01/31, 10:51:58 Request req-1 body:  {
      //   chipId: 6090984,
      //   chipModel: 'ESP32-D0WDQ5',
      //   chipRevision: 1,
      //   chipCores: 2,
      //   macAddress: '4C:75:25:5C:F0:E8'
      // }
      const payload = <IDevice>request.body
      const { chipId } = payload
      let device = await Device.findByChipId(chipId)
      // Register new devices
      if (!device) {
        device = await Device.register(payload)
        // Notify connected websocket clients that a new device was registered
        ws.send(JSON.stringify({ action: 'notify', channel: 'device', message: device }))
      }
      // Or simply return the config for hardware initialisation
      const config = await Config.findDeviceConfig(device.id)
      // Return it to the device
      log(`Request ${request.id} response: `, config)
      // 2023/01/31, 10:51:58 Request req-1 response:  {
      //   id: 1,
      //   readingInterval: 'sec',
      //   manualReadingInterval: 40,
      //   userLed: false,
      //   deviceId: 1
      // }
      reply.send(config)
    } catch (err) {
      log(err)
      reply.status(500)
      reply.send('Failed to register the device')
    }
  })
}