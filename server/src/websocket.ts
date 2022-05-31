import { Server } from 'http';
import { WebSocketServer } from 'ws';
import { handler } from './websocketHandler';
const uuid = require('uuid');
const ws = require('ws');

type CreateWebSocketServer = (server: Server) => WebSocketServer;

export const createWebSocketServer = (
  server: Server
): CreateWebSocketServer => {
  const wsServer = new ws.Server({ server });
  wsServer.on('open', function open() {
    console.log('connected');
  });
  wsServer.on('connection', (ws: any) => {
    ws.id = uuid.v4();
    ws.on('message', (message: any) => {
      const {type, data} = JSON.parse(message);
      switch (type) {
        case 'test':
          handler.test(ws, data, wsServer);
          break;
        case 'joinRoom':
          handler.joinRoom(ws, data, wsServer);
          break;
        case 'leaveRoom':
          handler.leaveRoom(ws, data)
          break;
        case 'send-offer':
          handler.sendOffer(ws, data);
          break;
        case 'send-answer':
          handler.sendAnswer(ws, data);
          break;
        case "send-candidate":
          handler.sendCandidate(ws, data);
          break;
      }
    });
  });
  return wsServer;
};
