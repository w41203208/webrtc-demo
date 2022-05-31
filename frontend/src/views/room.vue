<template>
  <section class="outer h-full">
    <section class="container h-full">
      <h1>Demo</h1>
      <div id="control" class="flex flex-col">
        <Select
          :devices="devices?.audioInput"
          label="AudioInput"
          @handleChange="ChangeAudioInputIdEvt"
        >
        </Select>
        <Select
          :devices="devices?.audioOutput"
          label="AudioOutput"
          @handleChange="ChangeAudioOutputIdEvt"
        >
        </Select>
        <Select
          :devices="devices?.videoInput"
          label="VideoInput"
          @handleChange="ChangeVideoIdEvt"
        >
        </Select>
        <Select
          label="SenderCodec"
          @handleChange="ChangeSenderCodecEvt"
        >
          <template v-slot:option>
            <option>無</option>
            <option
              v-for="c in codecs?.sender"
              :key="c.id"
              :value="c.id"
            >
              {{ c.codec.mimeType }}{{ c.codec.sdpFmtpLine ? ` - ${c.codec.sdpFmtpLine}` : ''}}
            </option>
          </template>
        </Select>
        <Select
          label="ReceiverCodec"
          @handleChange="ChangeReceiverCodecEvt"
        >
          <template v-slot:option>
            <option>無</option>
            <option
              v-for="c in codecs?.receiver"
              :key="c.id"
              :value="c.id"
            >
              {{ c.codec.mimeType }}{{ c.codec.sdpFmtpLine ? ` - ${c.codec.sdpFmtpLine}` : ''}}
            </option>
          </template>
        </Select>
        <div class="mb-1 mt-1 flex flex-col">
          <div id="buttons" class="flex flex-wrap">
            <button @click="(e) => clickCallEvt(e)">Call</button>
            <button @click="(e)=>clickShareEvt(e)">Share</button>
            <button @click="clickSwitchEvt">switch</button>
            <button @click="(e)=>clickShare1Evt(e)">Share1</button>
            <button @click="clickLeaveEvt">Leave</button>
            <button @click="(e) => clickRecvonlyEvt(e)">change RecvOnly</button>
            <button @click="(e) => clickSendRecvEvt(e)">change SendRecv</button>
            <button @click="getPeers">getPeers</button>
            <button @click="ClickVideoMuteEvt">{{ localReactive.trackControl.video ? "Open Video" : "Close Video"}}</button>
            <!-- <div class="ming-cbtn" @click="ClickVideoMuteEvt">
              <ion-icon v-if="localReactive.trackControl.video" name="videocam-outline"></ion-icon>
              <svg v-else class="w-5 h-5 text-black"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round">  <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" />  <line x1="1" y1="1" x2="23" y2="23" /></svg>
            </div> -->
            <!-- <div class="ming-cbtn" @click="(e)=>clickAudioMuteEvt(e)">
              <ion-icon v-if="localReactive.trackControl.auido" name="mic-outline"></ion-icon>
              <ion-icon v-else name="mic-off-outline"></ion-icon>
            </div> -->
          </div>
        </div>
      </div>
      <div id="videoview">
        <div id="local">
          <p>Local</p>
          <div id="video"></div>
          <div id="video1"></div>
        </div>
        <div id="remote" class=" overflow-x-auto">
        </div>
      </div>
    </section>
  </section>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref, PropType, onUnmounted } from 'vue';
import Layout from '@/components/layout/layout.vue';
import Select from '@/components/UI/select.vue';
import {RTCCient} from '@/services/webrtc';
import { useRoute, useRouter } from 'vue-router';
import { DDs, Codecable } from '@/services/type';



export default defineComponent({
  components: {
    Layout,
    Select,
  },
  setup(props, {}) {
    const router = useRouter()
    const route = useRoute()
    const wsClient = ref(new RTCCient())
    const localUid = ref('')
    const localReactive = reactive({
      trackInitOpen:{
        audio: false,
        video: false,
      },
      trackControl:{
        auido: false,
        video: false,
      },
      trackid:{
        video: '',
        audio: '',
      }
    })
    const codecs = ref<Codecable>()
    const devices = ref<DDs>()
    const options = reactive({
      uid: route.query.uid as string,
      channel: route.query.channel as string
    })
    const clickShareEvt = (e:any)=>{
      const {audio, video} = localReactive.trackid;
      wsClient.value.share(audio, video);
    }
    const clickShare1Evt = (e:any)=>{
      const {audio, video} = localReactive.trackid;
      wsClient.value.share1(audio, video);
    }
    const clickSwitchEvt = () =>{
      const {audio, video} = localReactive.trackid;
      wsClient.value.switch(audio, video);
    }
    const clickCallEvt = (e:any)=>{
      wsClient.value.join(options);
    }
    const clickLeaveEvt = () =>{
      wsClient.value.leave();
      // router.push('/')
    }


    const clickAudioMuteEvt = (e:any)=>{
      let audio = localReactive.trackControl.auido;
      audio ? audio = false : audio = true;
      localReactive.trackControl.auido = audio;
    }
    const ClickVideoMuteEvt = () =>{
      let video = localReactive.trackControl.video;
      if(video){
        wsClient.value.setMuteVideo(!video);
        video = false;
      }else{
        wsClient.value.setMuteVideo(!video);
        video = true;
      }
      localReactive.trackControl.video = video;
    }

    const getPeers = ()=>{
      wsClient.value._client?.getPeer();
    }

    const ChangeAudioOutputIdEvt = (id: string) => {
      wsClient.value._client?.getPeer();
    };
    const ChangeAudioInputIdEvt = (id: string) => {
      localReactive.trackid.audio = id
    };
    const ChangeVideoIdEvt = (id: string) => {
      localReactive.trackid.video = id
    };
    const ChangeReceiverCodecEvt = (id: string) => {
      wsClient.value._client!._receiverCodec = codecs.value?.receiver.filter(c=>c.id === id)[0].codec
    }
    const ChangeSenderCodecEvt = (id: string) => {
      wsClient.value._client!._senderCodec = codecs.value?.sender.filter(c=>c.id === id)[0].codec
    }

    const clickGetDevicesEvt = ()=>{
      wsClient.value.getDevices().then((dds:DDs)=>{
        devices.value = dds
      });
    }
    const clickGetCodecEvt = ()=>{
      codecs.value = wsClient.value.getCodec()
    }
    const clickRecvonlyEvt = (e:any) =>{
      wsClient.value._client?.changeTransceiver('recvonly')
    }
    const clickSendRecvEvt = (e:any) =>{
      wsClient.value._client?.changeTransceiver('sendrecv')
    }

    onUnmounted(()=>{
      wsClient.value.leave();
    })
    onMounted(()=>{
      wsClient.value.createClient()
      clickGetDevicesEvt()
      clickGetCodecEvt()
    })
    return {
      localUid,
      clickLeaveEvt,
      clickAudioMuteEvt,
      ClickVideoMuteEvt,
      clickShareEvt,
      clickSwitchEvt,
      clickShare1Evt,
      clickCallEvt,
      clickRecvonlyEvt,
      clickSendRecvEvt,
      localReactive,
      devices,
      codecs,

      getPeers,
      ChangeAudioInputIdEvt,
      ChangeAudioOutputIdEvt,
      ChangeVideoIdEvt,
      ChangeReceiverCodecEvt,
      ChangeSenderCodecEvt,
    }
  },
});
</script>

<style lang="scss" scoped>
.ming-cbtn{
  @apply p-2 cursor-pointer border rounded flex text-lg w-10 h-10 justify-center items-center;
}
.outer {
  display: flex;
  justify-content: center;
  align-items: center;
}
.container {
  padding: 10px 20px;
}
h1 {
  border-bottom: 1px solid black;
  padding: 10px 15px;
  font-size: 2rem;
}

#control {
  padding: 5px 10px;
  #buttons {
    & > button {
      margin-right: 5px;
      padding: 2px 16px;
      border: 1px solid rgb(36, 110, 221);
      border-radius: 4px;
      color: black;
      transition: 0.3s;
      &:hover {
        background: rgb(36, 110, 221);
        color: white;
      }
    }
  }
}
#videoview {
  height: 80%;
  color: white;
  #local {
    height: calc(80% - 150px);
    min-width: 200px;
    min-height: 200px;
    border-radius: 5px;
    background: rgb(155, 155, 155);
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    & > p {
      position: absolute;
      top: 2px;
      left: 2px;
    }
    & > #video {
      min-width: 50%;
      min-height: 70%;
      height: 80%;
    }
    & > #video1 {
      min-width: 50%;
      min-height: 70%;
      height: 80%;
    }
  }
  #remote {
    height: calc(60% - 100px);
    min-height: 150px;
    min-width: 100px;
    display: flex;
    & > div {
      margin: 0.5rem;
      border-radius: 5px;
      background: rgb(99, 99, 99);
      width: calc(50% - 20px);
      &:first-child {
        margin-left: 0;
      }
      &:last-child {
        margin-right: 0;
      }
      & > video {
        margin: auto;
        height: 80%;
      }
    }
  }
}
</style>
