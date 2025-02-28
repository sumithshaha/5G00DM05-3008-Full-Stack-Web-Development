// wsHandler.js
const WebSocket = require('ws');

/**
 * Initialize WebSocket server for chat functionality
 * @param {WebSocket.Server} wsServer - WebSocket server instance
 */
const initializeWebSocket = (wsServer) => {
  // Store connected clients
  const clients = new Set();

  // Connection event handler
  wsServer.on('connection', (ws) => {
    console.log('New client connected');

    // Add client to the set
    clients.add(ws);

    // Send welcome message to the new client
    ws.send(JSON.stringify({
      type: 'system',
      message: 'Welcome to the Movie Chat!',
      timestamp: new Date().toISOString()
    }));

    // Broadcast connection notification to all other clients
    broadcastMessage(clients, ws, {
      type: 'system',
      message: 'A new user has joined the chat.',
      timestamp: new Date().toISOString()
    });

    // Handle incoming messages
    ws.on('message', (message) => {
      console.log(`Received message: ${message}`);

      try {
        // Try to parse the message as JSON
        const parsedMessage = JSON.parse(message);

        // Add timestamp if not provided
        if (!parsedMessage.timestamp) {
          parsedMessage.timestamp = new Date().toISOString();
        }

        // Broadcast the message to all clients
        broadcastMessage(clients, null, parsedMessage);
      } catch (error) {
        // If message is not valid JSON, wrap it in a JSON object
        console.log('Received non-JSON message, wrapping it');

        const messageObject = {
          type: 'chat',
          message: message.toString(),
          timestamp: new Date().toISOString()
        };

        // Broadcast the wrapped message
        broadcastMessage(clients, null, messageObject);
      }
    });

    // Handle client disconnection
    ws.on('close', () => {
      console.log('Client disconnected');

      // Remove client from the set
      clients.delete(ws);

      // Broadcast disconnection notification
      broadcastMessage(clients, null, {
        type: 'system',
        message: 'A user has left the chat.',
        timestamp: new Date().toISOString()
      });
    });

    // Handle connection errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  console.log('WebSocket server initialized');
  return wsServer;
};

/**
 * Broadcast a message to all connected clients
 * @param {Set} clients - Set of connected WebSocket clients
 * @param {WebSocket} exclude - Client to exclude from broadcast (optional)
 * @param {Object} message - Message object to broadcast
 */
function broadcastMessage(clients, exclude, message) {
  const messageString = typeof message === 'string'
    ? message
    : JSON.stringify(message);

  clients.forEach((client) => {
    // Skip the excluded client (if any)
    if (client === exclude) return;

    // Only send to clients that are still connected
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageString);
    }
  });
}

module.exports = { initializeWebSocket };