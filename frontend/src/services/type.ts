//connection
export type GenPeerConn = (
  channel: string | null,
  uid: string | null,
  remoteUser_uid:string |null,
  stunTurnSeverParams: any,
  ws: WebSocket | null,
) => Peer;

export interface Peer{
  pc: RTCPeerConnection,
  channel: string | null,
  ws: WebSocket | null,
  uid: string | null,
  remoteUser_uid: string | null,

  makingOffer: boolean,
  ignoreOffer: boolean,

  track:{
    audio: any,
    video: any,
  }
}
//websocket
export interface WebSocketParams {
  url: string | undefined;
}
export interface SendData {
  data: {};
  type: string;
}
export type Callback = (...args:any)=>void;

// webrtcSDK
export interface Devices<D> {
  audioInput: D;
  audioOutput: D;
  videoInput: D;
}
export type Listeners = Record<string | number, Callback>;
export type Peers = Record<string | number, Peer> ;
export type DDs = Devices<MediaDeviceInfo[]>;
export type Channel = string | null;

interface SenderAndReceiverCodec{
  id: string,
  codec: RTCRtpCodecCapability
}
export interface Codecable {
  sender: SenderAndReceiverCodec[],
  receiver: SenderAndReceiverCodec[],
}