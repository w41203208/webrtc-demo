import WebSDK,{AudioTrack, VideoTrack, WebRtcClient, } from '@/services/websdk'
import { DDs } from './type';

interface Options{
  uid:string,
  channel:string,
}
interface Track{
  audio:AudioTrack | null,
  video:VideoTrack | null,
}

export class RTCCient{
  //測試看看能不能像agora那樣設計，先暫時這樣設定type，不然typescript會叫我設定屬性...
  public _client: WebRtcClient | null= null;
  public _options: Options | null = null;
  public _track: Track = {
    audio: null,
    video: null,
  }

  constructor(){};

  createClient(){
    this._client = WebSDK.createClient({})
  }

  async switch(aid:string, vid:string){
    this._track.video?.setDevice(vid)
  }
  async setMuteVideo(mute:boolean){
    this._track.video?.setMuted(mute)
  }

  async share(aid:string, vid:string){
    const audio = this._track.audio = await WebSDK.createAudioTrack({trackId: aid, constraints: null})
    const video = this._track.video = await WebSDK.createVideoTrack({trackId: vid, constraints: null})
    video.play(document.querySelector('#video') as HTMLElement);
    this._client?.publish(video)
    this._client?.publish(audio)
  }

  async share1(aid:string, vid:string){
    const video = await WebSDK.createVideoTrack({trackId: vid, constraints: null})
    video.play(document.querySelector('#video1') as HTMLElement);
    this._client?.publish(video)
  }

  join(options: Options){
    const { uid, channel } = options;
    this._client?.join({ uid:uid, channel:channel })

    this._client?.emitter.on('user-joined', (user)=>{
      console.log(user);
    })
  }

  leave(){
    this._client?.leave();
  }

  getDevices():Promise<DDs>{
    return new Promise((ressovle, rej)=>{
      WebSDK.getDevices()?.then(res=>{
        ressovle(res);
      }).catch(err=>{
        rej(err);
      });
    });
  }

  getCodec(){
    return WebSDK.getCodec();
  }
}

