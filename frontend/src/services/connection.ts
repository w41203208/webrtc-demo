//temp

//formal
import { GenPeerConn, Peer } from "./type";
import { AudioTrack, VideoTrack } from "./websdk";

export const getStunTurnServer = (params = null) => {
  if (params) {
    return undefined;
  } else {
    return undefined;
  }
};



export const createPeerConnection: GenPeerConn = (
  channel= null,
  uid = null,
  remoteUser_uid = null,
  stunTurnSeverParams = null,
  ws = null,
) => {
  // const server = getStunTurnServer(stunTurnSeverParams);
  const server = [
    {"urls": "stun:stun.l.google.com:19302"},
    {"urls": "turn:turn.bistri.com:80", "username": "homeo", "credential": "homeo"} //範例
  ]
  const peer: Peer = {
    // pc: new RTCPeerConnection({sdpSemantics:'unified-plan', iceServers:server}),
    pc: new RTCPeerConnection({iceServers:server}),
    channel: channel,
    ws: ws,
    uid: uid,
    remoteUser_uid: remoteUser_uid,

    //測試管理offer
    makingOffer: false,
    ignoreOffer: false,

    //不知道要不要留著
    track: {
      audio: '',
      video: '',
    }
  };

  // addTrack後觸發
  peer.pc.onicecandidate = (e:RTCPeerConnectionIceEvent) => {
    if (e.candidate){
      (peer.ws as any).sendData({
        data:{
          channel:peer.channel,
          uid:peer.uid,
          remoteUser_uid: peer.remoteUser_uid,
          candidate: {
            sdpMid: e.candidate.sdpMid || 12345,
            sdpMLineIndex: e.candidate.sdpMLineIndex,
            candidate: e.candidate.candidate
          },
        },
        type:'send-candidate',
      })
    }
  };
  peer.pc.onicegatheringstatechange = ((e:any)=>{
    // console.log(`cadidate gathering state ${e.currentTarget.iceGatheringState}`)
  })
  peer.pc.oniceconnectionstatechange = ((e:any) => {
    // console.log(`cadidate connection state ${e.currentTarget.iceConnectionState}`);
  })
  //偵測到有遠端stream
  peer.pc.ontrack = ({track,transceiver, streams: [stream]}) => {
    console.log("pc.ontrack with transceiver and streams");
    console.log(transceiver);
    if(track.kind === 'audio'){
      const remoteUserTrack = new AudioTrack({trackId:null, constraints:null}, transceiver.receiver.track);
      remoteUserTrack.play();
    }
    if(track.kind === 'video'){
      const remoteUserTrack = new VideoTrack({trackId:null, constraints:null}, transceiver.receiver.track)
      const remote = document.querySelector('#remote');
      remoteUserTrack.play(remote as HTMLElement)
    }
    transceiver.receiver.track.onmute = () => {
      console.log("transceiver.receiver.track.onmute");
    }
    transceiver.receiver.track.onended = () => console.log("transceiver.receivertrack.onended");
    transceiver.receiver.track.onunmute = () => {
      console.log("transceiver.receiver.track.onunmute");
    }
  };
  peer.pc.onsignalingstatechange = async(e)=>{
    // console.log(`signaling Server state is ${peer.pc.signalingState}`)
  }
  // addTrack後觸發，通常會在這裡發送offer
  peer.pc.onnegotiationneeded = async (e) => {
    try {
      peer.makingOffer = true;
      await peer.pc.setLocalDescription();
      (peer.ws as any).sendData({
        data: {
          channel: peer.channel,
          uid: peer.uid,
          remoteUser_uid: peer.remoteUser_uid,
          sdp: peer.pc.localDescription,
        },
        type: 'send-offer',
      });
      console.log(`Create Offer`)
      console.log(peer.pc.localDescription?.sdp);
    }catch(e){
      console.log(e)
    }finally{
      peer.makingOffer = false;
    }
  };
  return peer;
};
