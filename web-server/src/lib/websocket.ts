import WebSocket from 'ws'
import { log } from './util'

// Retry connection after x seconds
const reconnectInterval = 1000 * 3

// Re/connection counts
let connectionCount = 0
let reconnectionCount = 0

// Make the websocket connection available to other source files
export let ws: WebSocket

// The connection handler
export function connect() {
  // The websocket relays endpoint
  const url = <string>process.env.VITE_WEBSOCKET_LOCATION
  if (connectionCount > 0) {
    reconnectionCount++
    log(`Connection attempt #${reconnectionCount}, attempting to re-establish connection to websocket relay at ${url}`)
  }

  // Attempt to establish a connection to the websocket relay
  ws = new WebSocket(url)

  // When the connection is established
  ws.on('open', function() {
    connectionCount++
    reconnectionCount = 0
    log(`Established connection to websocket relay at ${url}`)
  })

  // When the connection encounters an error
  ws.on('error', function(err) {
    log(`Encountered an error when handling the websocket relay connection: `, err.message)
  })

  // When the connection is closed
  ws.on('close', function() {
    log(`Closed connection to websocket relay at ${url}`)
    // Retry the connection
    setTimeout(connect, reconnectInterval)
  })
}