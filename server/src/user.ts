export class User {
  uid: string;
  ws: WebSocket;
  constructor(uid: string, ws: WebSocket, sdp: string) {
    (this.uid = uid), (this.ws = ws);
  }
}
