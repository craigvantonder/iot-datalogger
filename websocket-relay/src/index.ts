import type { WebSocket } from 'ws'
import type { IWebsocketMessage } from './lib/interfaces'
import { WebSocketServer } from 'ws'
import {
  handleSocketConnection,
  handleSocketDisconnection,
  subscribeClientToChannel,
  unsubscribeClientFromChannel,
  notifyChannelClients
} from './lib/actions'
import './lib/env-loader'
import { log } from './lib/util'

(async function () {
  try {
    // Parse the environment configuration
    const { HOST, PORT } = process.env

    // Instantiate a new websocket server instance, listen for traffic based on the defined configuration
    const wss = new WebSocketServer({ host: HOST, port: parseInt(PORT!, 10) })

    log(`Websocket server listening for traffic at ws://${wss.options.host}:${wss.options.port}`)
    // 2023/02/01, 11:18:09 Websocket server listening for traffic at ws://localhost:8080

    // When the client connects
    wss.on('connection', function connection(socket: WebSocket) {
      // Register the client connection
      handleSocketConnection(socket)
      // Get the clients connectionId
      const { connectionId } = socket

      log(`Client socket connected with connectionId: ${connectionId}`)
      // 2023/02/01, 11:17:40 Client socket connected with connectionId: 524bf5b8-142a-4e3d-8e55-9204c5e3e559

      // When the client socket sends a message
      socket.on('message', function message(payload: Buffer, isBinary: boolean) {
        log(`Received new message from client with connectionId ${connectionId}: `, payload)
        // 2023/02/01, 11:10:08 Received new message from client with connectionId 524bf5b8-142a-4e3d-8e55-9204c5e3e559:  <Buffer 7b 22 61 63 74 69 6f 6e 22 3a 22 6e 6f 74 69 66 79 22 2c 22 63 68 61 6e 6e 65 6c 22 3a 22 74 65 6c 65 6d 65 74 72 79 22 2c 22 6d 65 73 73 61 67 65 22 ... 136 more bytes>
        try {
          // Destructure the payload components
          const { action, channel, message } = <IWebsocketMessage>JSON.parse(payload.toString())

          log(`Parsed the message from client with connectionId ${connectionId}: `, { action, channel, message })
          // 2023/02/01, 11:10:08 Parsed the message from client with connectionId 524bf5b8-142a-4e3d-8e55-9204c5e3e559:  {
          //   action: 'notify',
          //   channel: 'telemetry',
          //   message: {
          //     id: 317,
          //     timestamp: '1675243824682',
          //     temperature: 27.60000038,
          //     humidity: 74,
          //     heatIndex: 30.37470245,
          //     soilMoisture: 100,
          //     deviceId: 1
          //   }
          // }

          // Handle the payload
          switch (action) {
            // Add the client socket to a channel
            case 'subscribe':
              subscribeClientToChannel(connectionId, channel)
            break
            // Remove the client socket from a channel
            case 'unsubscribe':
              unsubscribeClientFromChannel(connectionId, channel)
            break
            // Notify the respective clients
            case 'notify':
              notifyChannelClients(channel, message)
            break
            // No action or action is not yet handled
            default:
              log(`Unable to match the payload from client with connectionId: ${connectionId} to any action handler`)
          }
        } catch (err: any) {
          log('Websocket server encountered an unhandled error when attempting to process the new message:', err)
          socket.send(`Bad Request format, use: '{"action": ..., "channel": ..., "message": ...}'`)
        }
      })

      // When the client has disconnected
      socket.on('close', () => {
        // De-register the client connection
        handleSocketDisconnection(connectionId)
        log(`Client socket disconnected with connectionId: ${connectionId}`)
        // 2023/02/01, 11:18:24 Client socket disconnected with connectionId: 23ef6e8f-8649-4cfa-9909-b474c95aa64a
      })
    })
  } catch (err: any) {
    log('Websocket server encountered an unhandled error: ', err)
    // 2023/02/01, 11:17:35 Websocket server listening for traffic at ws://localhost:8080
    process.exit(1)
  }
})()


