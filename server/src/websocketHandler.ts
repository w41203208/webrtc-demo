type HandlerFunc = (...args: any) => any;
type WsHandler = Record<number | string, HandlerFunc>;
type CreateWebsocketHandler = () => WsHandler;
const uuid = require('uuid');

import { User } from './user';
type Users = Array<User>;
type Room = Array<User>;
type Rooms = Record<string | number, Room>;

var users: Users = [];
var rooms: Rooms = {};

const createWebsocketHandler: CreateWebsocketHandler = () => {
  let wsHandler = {
    broadcast: (clients: Array<WebSocket>, message) => {
      clients.forEach((c: WebSocket) => {
        if (c.readyState === 1) c.send(JSON.stringify(message));
      });
    },
    filterClient: (wsClientsSet: Set<WebSocket>, ws: WebSocket) => {
      const clients = [...wsClientsSet].filter(
        (c: WebSocket) => (c as any).id !== (ws as any).id
      );
      return clients;
    },
    broadcastToRoomUsers:(room:Room,cb)=>{
      room.forEach(cb)
    }
  } as WsHandler;

  wsHandler.test = function (ws, data, wsServer) {
    let message = {};
    message = {
      data: `Yes! Server is get the data and send ${data} for you.`,
      type: 'test',
    };
    this.broadcast(this.filterClient(wsServer.clients), message);
  };
  wsHandler.sendCandidate = function(ws, data){
    if(!rooms[data.channel]) return;
    this.broadcastToRoomUsers(rooms[data.channel],(user:User)=>{
      if(user.uid === data.remoteUser_uid){
        user.ws.send(
          JSON.stringify({
            data: {
              remoteUser: {
                uid: data.uid,
                candidate: data.candidate,
              }
            },
            type: 'receive-candidate'
          })
        )
      }
    })
  }
  //send給新加入的成員要排除掉原來的
  wsHandler.sendOffer = function (ws, data) {
    if(!rooms[data.channel]) return;
    this.broadcastToRoomUsers(rooms[data.channel],(user:User)=>{
      if(user.uid === data.remoteUser_uid){
        user.ws.send(
          JSON.stringify({
            data: {
              remoteUser:{
                uid: data.uid,
                sdp: data.sdp
              }
            },
            type: 'receive-offer'
          })
        )
      }
    })
  };

  wsHandler.sendAnswer = function(ws,data){
    if(!rooms[data.channel]) return;
    this.broadcastToRoomUsers(rooms[data.channel],(user:User)=>{
      if(user.uid === data.remoteUser_uid){
        user.ws.send(
          JSON.stringify({
            data: {
              remoteUser:{
                uid: data.uid,
                sdp: data.sdp,
              }
            },
            type: 'receive-answer'
          })
        );
      }
    });
  }

  wsHandler.leaveRoom = function(ws, data){
    if(!rooms[data.channel]) return;
    this.broadcastToRoomUsers(rooms[data.channel], (user:User)=>{
      if( user.uid !== data.uid){
        user.ws.send(
          JSON.stringify({
            data: {
              remoteUser: {
                uid: data.uid,
              },
            },
            type: 'user-leave',
          })
        );
      }
    })
    const new_room = rooms[data.channel].filter(user=>user.uid !== data.uid);
    rooms[data.channel] = new_room;
    console.log(new_room.length)
  }

  wsHandler.joinRoom = function (ws, data, wsServer) {
    //判斷是否有這間房間
    if (!rooms[data.channel]) {
      rooms = { ...rooms, [data.channel]: [] };
    }
    //使用者是否有輸入uid，若沒有就幫他加入
    if (typeof data.uid !== 'string' || data.uid === '') data.uid = uuid.v4();

    //判斷是否有該使用者，沒有則加入
    let user;
    const user_arr = users.filter((u: User) => u.uid === data.uid);
    if (user_arr.length <= 0) {
      user = {
        uid: data.uid,
        ws: ws,
      };
      users.push(user);
    } else {
      user = user_arr[0];
    }
    rooms[data.channel].push(user);
    console.log(rooms[data.channel].length)
    this.broadcastToRoomUsers(rooms[data.channel], (user:User)=>{
      if(user.uid !== data.uid){
        user.ws.send(JSON.stringify({
          data: {
            remoteUser:{
              uid: data.uid,
            }
          },
          type: 'user-join',
        }))
      }
    })
    //廣播給其他remoteUser
    // this.broadcast(this.filterClient(wsServer.clients, ws), {
    //   data: {
    //     remoteUser:{
    //       uid: user.uid
    //     }
    //   },
    //   type: 'user-join',
    // });

    ws.send(JSON.stringify({
      data: data.uid,
      type: 'connection'
    }));
  };
  return wsHandler;
};

export const handler = createWebsocketHandler();
