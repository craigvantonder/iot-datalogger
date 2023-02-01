
import type { WebSocket } from 'ws'
import type { ITelemetry, IWebsocketMessage } from './interfaces'
import { v4 as uuidv4 } from 'uuid'

// Add connectionId to the WebSocket type
declare module "ws" {
  interface WebSocket {
    connectionId: string
  }
}

// Basic, in-memory session storage
let connections = <{
  [key: string]: WebSocket
}>{}

// Send a websocket messages to the specified client
const send = (connectionId: string, message: IWebsocketMessage) => {
  const connection = connections[connectionId]
  if (connection) connection.send(Buffer.from(JSON.stringify(message)), { binary: false })
}

// Default actions
export function handleSocketConnection(connection: WebSocket) {
  const id = uuidv4()
  connection.connectionId = id
  connections[id] = connection
}
export function handleSocketDisconnection(connectionId: string) {
  delete connections[connectionId]
}

// Basic, in-memory session storage
const channels = <{
  [key: string]: any,
  telemetry: string[],
  device: string[]
}>{
  telemetry: [],
  device: []
}

// Channel actions
export function subscribeClientToChannel(connectionId: string, channel: string) {
  channels[channel].push(connectionId)
}
export function unsubscribeClientFromChannel(connectionId: string, channel: string) {
  const clientIndex = channels[channel].findIndex((cid: string) => cid === connectionId)
  if (clientIndex !== -1) channels[channel].splice(clientIndex, 1)
}
export function notifyChannelClients(channel: string, message: string | ITelemetry) {
  for (let i = 0, n = channels.telemetry.length; i < n; i ++) {
    const connectionId = channels.telemetry[i]
    send(connectionId, { channel, message })
  }
}