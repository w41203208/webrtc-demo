import { EventEmitter } from "./Emitter";
import {WebSocketParams, Callback, SendData} from "./type";

(WebSocket.prototype as any).sendData = function ({ data, type }: SendData) {
  (this as any).send(JSON.stringify({ data, type }));
};


export class Socket extends EventEmitter {
  _disconnected: boolean = true;
  _socket?: WebSocket;
  _baseUrl?: string;

  constructor({ url = undefined }: WebSocketParams){
    super();
    this._baseUrl = url
  }

  start():void{
    const wsUrl = this._baseUrl!

    if (!!this._socket || !this._disconnected){
      return;
    }

    this._socket = new WebSocket(wsUrl)

    this._disconnected = false;

    this._socket.onclose = (e) =>{
      console.log('ws is connecting!');
    };
    this._socket.onopen = (e) => {
      console.log('ws is connecting!');
    };
    this._socket.onmessage = (event: any) => {
      let data;
			try {
				data = JSON.parse(event.data);
				console.log("Server message received:", data);
			} catch (e) {
				console.log("Invalid server message", event.data);
				return;
			}
      this.emit('Message', data);
    };
  }

  sendData({data, type}: SendData): void{
    if (this._disconnected) {
			return;
		}
    this._socket?.send(JSON.stringify({ data, type }));
  }
}

// export const connectWebSocket = ({ url = undefined }: WebSocketParams) => {
//   const wsClient = {
//     ws:new WebSocket(url!),
//     wsevent: (...args:any)=>{},
//     wsonevent: function(cb:Callback){
//       this.wsevent = cb
//     }
//   }
//   wsClient.ws.onopen = (e) => {
//     console.log('ws is connecting!');
//   };
//   wsClient.ws.onclose = (e) => {
//     console.log('ws is colsed!');
//   };
//   wsClient.ws.onmessage = (e: any) => {
//     const {data, type} = JSON.parse(e.data);
//     switch (type) {
//       case 'test':
//         console.log(data);
//         break;
//       case 'user-join':
//         console.log(`=========== Remote user ${data.remoteUser.uid} is join. ===========`)
//         wsClient.wsevent('user-join', data);
//         break;
//       case 'user-leave':
//         console.log(`=========== Remote user ${data.remoteUser.uid} is left ===========`)
//         wsClient.wsevent('user-leave', data);
//         break;
//       case 'connection':
//         console.log(data);
//         wsClient.wsevent('peer-connection', data);
//         break;
//       case 'receive-candidate':
//         console.log(`=========== Receive user ${data.remoteUser.uid} candidate ===========`);
//         wsClient.wsevent('peer-receive-candidate', data)
//         break;
//       case 'receive-offer':
//         console.log(`=========== Receive user ${data.remoteUser.uid} offer ===========`);
//         wsClient.wsevent('peer-receive-offer', data)
//         break;
//       case 'receive-answer':
//         console.log(`=========== Receive user ${data.remoteUser.uid} answer ===========`);
//         wsClient.wsevent('peer-receive-answer', data)
//         break;
//     }
//   };
//   return wsClient;
// };


