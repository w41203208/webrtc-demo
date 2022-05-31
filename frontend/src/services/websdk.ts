//temp
import { Socket } from './websocket';

//formal
import { Message as Msg } from '@/js/message';
import { createPeerConnection } from './connection';
import { EventEmitter } from './Emitter';
import { Callback, Listeners, Peers, DDs, Channel, Codecable} from './type'
import {v4} from 'uuid'
const msg = new Msg();

const emitter = new EventEmitter()

function hasGetUserMedia(func: string) {
  return !!(navigator.mediaDevices && (navigator.mediaDevices as any)[func]);
}

export default (() => {
  class WebSDK {
    createClient = ({}) => {
      return new WebRtcClient();
    };
    createAudioTrack = (config?: TrackConfig): Promise<AudioTrack> => {
      return new Promise(async (res, rej) => {
        let _config = {} as TrackConfig;
        if (config !== undefined) _config = { ...config };
        if (config === undefined) _config = { trackId: null, constraints: null };
        const track = new AudioTrack(_config);
        await track.generateMediaTrack();
        res(track);
      });
    };
    createVideoTrack = (config?: TrackConfig): Promise<VideoTrack> => {
      return new Promise(async (res, rej) => {
        let _config = {} as TrackConfig;
        if (config !== undefined) _config = { ...config };
        if (config === undefined) _config = { trackId: null, constraints: null };
        const track = new VideoTrack(_config);
        await track.generateMediaTrack();
        res(track);
      });
    };
    getCameraDevices = (): Promise<MediaDeviceInfo[]> => {
      return new Promise((resvole, reject) => {
        navigator.mediaDevices
          .enumerateDevices()
          .then((devices) => {
            const devs = devices.filter((v) => v.kind === 'videoinput');
            resvole(devs);
          })
          .catch((err) => {
            reject(err);
          });
      });
    };
    getMicrophoneDevices = (): Promise<MediaDeviceInfo[]> => {
      return new Promise((resvole, reject) => {
        navigator.mediaDevices
          .enumerateDevices()
          .then((devices) => {
            const devs = devices.filter((v) => v.kind === 'audioinput');
            resvole(devs);
          })
          .catch((err) => {
            reject(err);
          });
      });
    };
    getAudioOutputDevices = (): Promise<MediaDeviceInfo[]> => {
      return new Promise((resvole, reject) => {
        navigator.mediaDevices
          .enumerateDevices()
          .then((devices) => {
            const devs = devices.filter((v) => v.kind === 'audiooutput');
            resvole(devs);
          })
          .catch((err) => {
            reject(err);
          });
      });
    };
    getCodec = () =>{
      const codec = {} as Codecable
      const _senderCodec = RTCRtpSender.getCapabilities('video')?.codecs.map(codec=>{
        const _codec = {
          id: v4(),
          codec: {
            ...codec,
          }
        }
        return _codec;
      })
      const _receiverCodec = RTCRtpReceiver.getCapabilities('video')?.codecs.map(codec=>{
        const _cdoec = {
          id: v4(),
          codec: {
            ...codec,
          }
        }
        return _cdoec;
      })
      if (_senderCodec === undefined){
        return;
      }else{
        codec.sender = _senderCodec
      }
      if (_receiverCodec === undefined){
        return;
      }else{
        codec.receiver = _receiverCodec
      }
      return codec
    }
    getDevices = (): Promise<DDs> | void => {
      if (!hasGetUserMedia('enumerateDevices')) {
        msg.message({
          type: 'log',
          message: 'enumerateDevices() not supported.',
        });
        return;
      }
      return new Promise(async (resovle, reject) => {
        const output = {
          audioInput: await this.getMicrophoneDevices(),
          audioOutput: await this.getAudioOutputDevices(),
          videoInput: await this.getCameraDevices(),
        };
        resovle(output);
      });
    };
  }
  return new WebSDK();
})();
type LocalTrack = Array<VideoTrack | AudioTrack>

export class WebRtcClient{
  // 確定會有的attr
  public _uid: string | null;
  public _channel: Channel;
  // 先用any，之後確定會用到什麼attr會設定typescript
  public _socket: Socket;
  public _remoteUsers: any;
  public _peers: Peers;

  // 影音視訊相關
  public _stream: MediaStream = new MediaStream(); // 不確定
  public _mingLocalTrack: LocalTrack = [] // 不確定
  public _mingVideoTrack: VideoTrack | undefined = undefined; // 確定
  public _mingAudioTrack: AudioTrack | undefined = undefined; // 確定
  // testing
  public _senderCodec: any;
  public _receiverCodec: any;

  // 預計會移到 prototype
  public emitter: EventEmitter = new EventEmitter()

  constructor() {
    this._socket = this._createSocketConnection();
    this._remoteUsers = null,
    this._peers = {};

    this._channel = null;
    this._uid = null;
  }
  private _createSocketConnection(): Socket{
    const url = import.meta.env.VITE_WS_URL?.toString() || '';
    const socket = new Socket({url})

    socket.on('Message', (msg: any)=>{
      const { type, data } = msg;
      this._connectionHandle(type, data)
    })

    socket.start()

    return socket
  }

  _connectionHandle = async (type: string, data:any) =>{
    switch(type){
      case 'receive-candidate':
        this._peers[data.remoteUser.uid].pc.addIceCandidate(
          new RTCIceCandidate({
            sdpMid: data.remoteUser.candidate.sdpMid,
            sdpMLineIndex: data.remoteUser.candidate.sdpMLineIndex,
            candidate: data.remoteUser.candidate.candidate,
          }
        ))
        break;
      case 'receive-offer':
        this.recieveOfferHandler(data.remoteUser)
        break;
      case 'receive-answer':
        await this._peers[data.remoteUser.uid].pc.setRemoteDescription(new RTCSessionDescription(data.remoteUser.sdp))
        break;
      case 'connection':
        console.log(data)
        this._uid = data;
        break;
      case 'user-join':
        await this.userJoinedHandler(data)
        this.emitter.emit('user-joined', data.remoteUser.uid)
        break;
      case 'user-leave':
        this._peers[data.remoteUser.uid].pc.close();
        break;
    }
  }

  async recieveOfferHandler({uid, sdp}:{uid:string, sdp:RTCSessionDescriptionInit}){
    let peer = Object.values(this._peers).find(v=>v.remoteUser_uid===uid)
    if(!peer){
      peer = this._peers[uid] = this.createPeerConnection(uid);
    }else{
      // this.initAddTracktoPeer(data.remoteUser.uid);
    }
    await peer.pc.setRemoteDescription(new RTCSessionDescription(sdp))
    ///////
    await this.receiveOfferPassTrack(uid)

    /////////
    const answer = await peer.pc.createAnswer();
    console.log(`Create Answer`)
    console.log(answer.sdp)
    await peer.pc.setLocalDescription(answer);
    (peer.ws as any).sendData({
      data: {
        channel: peer.channel,
        uid: peer.uid,
        remoteUser_uid: peer.remoteUser_uid,
        sdp: peer.pc.localDescription,
      },
      type: 'send-answer',
    })
  }

  receiveOfferPassTrack(uid:string){
    const peer = this._peers[uid]
    if(this._stream.getTracks().length === 0){
      peer.pc.getTransceivers().map(tc=>{
        tc.direction = 'recvonly'
        tc.sender.setStreams(this._stream)
      })
      return;
    }
    this._stream.getVideoTracks().map(track=>{
      const result = peer.pc.getSenders().map(sender=>{
        return sender.track?.id
      }).indexOf(track.id)
      if(result === -1){
        peer.pc.addTrack(track, this._stream)
        // 雙方都用addTransceiver會一直發offer
        // 這裡如果用addTransceiver會再建立連線後再傳一次offer回去給已經在房間裡的user
        // peer.pc.addTransceiver(track, {streams:[this._stream]})
      }

    })
    this._stream.getAudioTracks().map(track=>{
      const result = peer.pc.getSenders().map(sender=>{
        return sender.track?.id
      }).indexOf(track.id)
      if(result === -1){
        peer.pc.addTrack(track, this._stream)
      }
    })
    peer.pc.getTransceivers().map(tc=>{
      const _codecArr = []
        this._receiverCodec != undefined && _codecArr.push(this._receiverCodec)
        this._senderCodec != undefined && _codecArr.push(this._senderCodec)
        tc.setCodecPreferences(_codecArr)
    })
  }

  /**
   * @param data
   */
  async userJoinedHandler(data: any){
    const peer = this._peers[data.remoteUser.uid] = this.createPeerConnection(data.remoteUser.uid);
    this.initAddTracktoPeer(data.remoteUser.uid);
    console.log('create Offer')
    await peer.pc.setLocalDescription();
    console.log(peer.pc.localDescription?.sdp);

    (peer.ws as any).sendData({
      data: {
        channel: peer.channel,
        uid: peer.uid,
        remoteUser_uid: peer.remoteUser_uid,
        sdp: peer.pc.localDescription,
      },
      type: 'send-offer',
    });
  }

  createPeerConnection(uid:string){
    return createPeerConnection(this._channel, this._uid, uid, {}, this._socket._socket!);
  }


  initAddTracktoPeer(uid:string){
    const peer = this._peers[uid]
    if(!this._stream) return;
    if(this._stream.getTracks().length === 0){
      //在房間內的user都沒publish任何track時addTransceiver
      const transceiver = peer.pc.addTransceiver('video', {direction: 'recvonly', streams:[this._stream]});
      // peer.pc.addTransceiver('audio', {direction: 'sendrecv', streams:[this._stream]});
    }
    this._stream.getVideoTracks().map((track) => {
      const result = peer.pc.getSenders().map(sender=>{
        return sender.track?.id
      }).indexOf(track.id)
      if(result === -1){
        // peer.pc.addTrack(track, this._stream)
        const transceiver =  peer.pc.addTransceiver(track, {direction: 'sendrecv', streams:[this._stream]});
        const _codecArr = []
        this._receiverCodec != undefined && _codecArr.push(this._receiverCodec)
        this._senderCodec != undefined && _codecArr.push(this._senderCodec)
        transceiver.setCodecPreferences(_codecArr)
      }
    });
    this._stream.getAudioTracks().map((track) => {
      const result = peer.pc.getSenders().map(sender=>{
        return sender.track?.id
      }).indexOf(track.id)
      if(result === -1){
        // peer.pc.addTrack(track, this._stream)
        peer.pc.addTransceiver(track, {direction: 'sendrecv', streams:[this._stream]});
      }
    });
  }

  changeTransceiver(mode:string){
    Object.values(this._peers).map(peer=>{
      peer.pc.getTransceivers()[0].direction = mode as RTCRtpTransceiverDirection
    })
  }

  join = async({uid = null, channel = null}: any) => {
    this._channel = channel;
    setTimeout(()=>{
      this._socket.sendData({
        data: {
          channel: channel,
          uid: uid || '',
        },
        type: 'joinRoom'
      });
    },500)
    window.onunload = ()=>{
      this.leave();
    }
    // window.onpopstate = ()=>{
    //   this.leave();
    // }
  };
  leave(){
    Object.values(this._peers).forEach(peer=>{
      peer.pc.close()
    })
    this._socket.sendData({
      data:{
        channel: this._channel,
        uid: this._uid,
      },
      type: 'leaveRoom',
    })
    this._mingVideoTrack?.close();
    this._mingAudioTrack?.close();
    this._channel = null;
    this._uid = null;
    this._peers = {};
  }
  /**
   * publish 添加track到stream
   * stream是為了讓後面偵測到user-joined的事件可以添加目前的track並addTrack
   * 如果是已經連線狀態下就addTrack
   * @param track
   */
  publish(track: VideoTrack | AudioTrack){
    if (track.mediaType === 'audio') this._mingAudioTrack = track as AudioTrack;
    if (track.mediaType === 'video') this._mingVideoTrack = track as VideoTrack;
    this._mingVideoTrack?.on('setDevice',(g:any)=>{
      if(Object.keys(this._peers).length !== 0){
        console.log('I switch track')
        Object.values(this._peers).map(peer=>{
          peer.pc.getSenders().map(sender=>{
            if (sender.track?.kind === 'video'){
              sender.replaceTrack(this._mingVideoTrack!._track)
            }
            if (sender.track?.kind === 'audio'){
              sender.replaceTrack(this._mingAudioTrack!._track)
            }
          })
        })
      }
    })

    this._stream.addTrack(track._track as MediaStreamTrack)
    if(Object.keys(this._peers).length !== 0){
      console.log('I publish track')
      Object.values(this._peers).map(peer=>{
        this._stream.getTracks().map(track=>{
          const result = peer.pc.getSenders().map(sender=>{
            return sender.track?.id
          }).indexOf(track.id)
          if(result === -1){
            peer.pc.addTrack(track, this._stream)
          }
          // const result = peer.pc.getSenders().map(sender=>{
          //   console.log(sender)
          //   //以下還有點問題要在看sender.replaceTrack(track);
          //   if(sender.track?.id === undefined){ //sender是空的
          //     return peer.pc.addTrack(track, this._stream);
          //   }else if(sender.track?.id === track.id){//sender裡面有一樣的track
          //     return 0;
          //   }else{
          //     return -1;
          //   }
          // })
          // console.log(result)
          // if(result.length === 0){
          //   peer.pc.addTrack(track, this._stream)
          // }else{
          //   let add = result.indexOf(-1)
          //   if(add !== -1){
          //     peer.pc.addTrack(track, this._stream)
          //   }
          // }
        })
      })
    }
  }

  changeLocalVideoId = (id: string) => {
    this._mingVideoTrack?.setDevice(id);
  };
  changeLocalAudioInputId = (id: string) => {
    this._mingAudioTrack?.setDevice(id);
  };
  // changeLocalAudioOutputId = (id: string) => {
  //   const vd = document.getElementById('ggg') as HTMLMediaElement;
  //   vd.setSinkId(id);
  // };

  getPeer = () =>{
    Object.values(this._peers).map(peer=>{
      console.log(peer.uid)
      console.log(peer.pc.getSenders())
      console.log(peer.pc.getReceivers())
      console.log(peer.pc.getTransceivers())
      peer.pc.getSenders().map(s=>{
        peer.pc.getStats(s.track).then(report=>{
          console.log(report)
        })
      })
    })
  };
}

// WebRtcClient.prototype.

type TrackId = string | null;
type Constraints = MediaTrackConstraints | null;
type Track = MediaStreamTrack | null;

interface TrackConfig {
  constraints: Constraints;
  trackId: TrackId;
}

export class VideoTrack {
  public _config: TrackConfig;
  public _track: Track;
  public element: HTMLMediaElement | null;
  public mediaType: string = 'video';
  public _isMuted: boolean;

  public _listeners :Listeners = {};

  constructor({ trackId = null, constraints = null }: TrackConfig, t:MediaStreamTrack | null = null) {
    this._config = {
      constraints: constraints,
      trackId: trackId,
    };
    this._track = t;
    this.element = null;
    this._isMuted = false;
  }
  async generateMediaTrack() {
    this._track && this._track.stop();
    let _t: Track;
    const stream = await navigator.mediaDevices.getUserMedia(
      this._config.trackId
        ? { video: { deviceId: { exact: this._config.trackId } } }
        : { video: true }
    );
    _t = stream.getTracks()[0];
    if (this._config.constraints) {
      await _t.applyConstraints(this._config.constraints);
    }
    this._track = _t;
    return this._track;
  }
  play(dom: HTMLElement | string) {
    if (!this.element) {
      this.element = this.createElement();
      if (dom instanceof HTMLElement) {
        dom.appendChild(this.element!);
      }
    }
    (this.element as HTMLMediaElement).srcObject = new MediaStream([this._track!]);
    this.element!.pause();
    setTimeout(()=>{
      this.element?.play()
    },150)
  }
  createElement() {
    const _v = document.createElement('video');
    _v.style.height = '150px';
    _v.style.width = '150px';
    return _v;
  }
  async setDevice(id: TrackId) {
    this._config.trackId = id;
    await this.generateMediaTrack();
    this.play(this.element as HTMLElement);

    this.onevent('setDevice')
  }

  setMuted(muted: boolean) {
    if (!this._track || !this.element) return;
    muted !== this._isMuted && (this._isMuted = muted);
    this._track.enabled = !muted;
  }
  close(){
    this._track?.stop();
  }
  onevent(event:string){
    switch(event){
      case 'setDevice':
        this._listeners[event]('ggg')
    }
  }
  on(event:string, listenner:Callback):void{
    if (this._listeners === undefined) this._listeners = {}
    if (this._listeners[event] === undefined){
      this._listeners[event] = listenner;
    }
  }
}

export class AudioTrack {
  public _config: TrackConfig;
  public _track: Track;
  public element: HTMLMediaElement | null;
  public mediaType: string = 'audio';
  public _isMuted: boolean;

  constructor({ trackId = null, constraints = null }: TrackConfig, t:MediaStreamTrack | null = null) {
    this._config = {
      trackId: trackId,
      constraints: constraints,
    };
    this._track = t;
    this.element = null;
    this._isMuted = false;
  }

  async generateMediaTrack() {
    this._track && this._track.stop();
    let _t: Track;
    const stream = await navigator.mediaDevices.getUserMedia(
      this._config.trackId
        ? { audio: { deviceId: { exact: this._config.trackId } } }
        : { audio: true }
    );
    _t = stream.getTracks()[0];
    if (this._config.constraints) {
      await _t.applyConstraints(this._config.constraints);
    }
    this._track = _t;
    return this._track;
  }

  play() {
    let _a;
    if (!this.element) this.element = this.createElement();
    _a = this.element;
    (_a as HTMLMediaElement).srcObject = new MediaStream([this._track!]);
    _a.play();
  }

  async setDevice(id: TrackId) {
    this._config.trackId = id;
    await this.generateMediaTrack();
    this.play();
  }

  createElement() {
    const _a = document.createElement('audio');
    return _a;
  }

  setMuted(muted: boolean) {}

  close(){
    this._track?.stop();
  }
}
