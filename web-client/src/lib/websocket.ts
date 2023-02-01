// The websocket relays endpoint
const url = import.meta.env.VITE_WEBSOCKET_LOCATION

// Retry connection after x seconds
const reconnectInterval = 1000 * 3

// Re/connection counts
let connectionCount = 0
let reconnectionCount = 0

// Make the websocket connection available to other source files
export let socket: WebSocket

// The connection handler
export function connect() {
  if (connectionCount > 0) {
    reconnectionCount++
    console.log(new Date().toLocaleString(), `Connection attempt #${reconnectionCount}, attempting to re-establish connection to websocket relay at ${url}`)
  }

  // Attempt to establish a connection to the websocket relay
  socket = new WebSocket(url)

  // When the connection is established
  socket.onopen = function() {
    connectionCount++
    reconnectionCount = 0
    console.log(new Date().toLocaleString(), `Established connection to websocket relay at ${url}`)
  }

  // When the connection encounters an error
  socket.onerror = function(err) {
    console.log(new Date().toLocaleString(), `Encountered an error when handling the websocket relay connection: `, err)
  }

  // When the connection is closed
  socket.onclose = function() {
    console.log(new Date().toLocaleString(), `Closed connection to websocket relay at ${url}`)
    // Retry the connection
    setTimeout(connect, reconnectInterval)
  }
}