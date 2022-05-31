<template>
  <section class="outer h-full">
    <section class="container h-full">
      <h1>Demo</h1>
      <div id="control" class="flex flex-col">
        <div id="buttons" class="mb-1">
          <!-- <button
              class="text-md border rounded border-green-600 px-2 py-1 hover:bg-green-600 hover:text-white mr-1"
              @click="ClickTestEvt"
            >
              Test
            </button>
            <button
              class="text-md border rounded border-green-600 px-2 py-1 hover:bg-green-600 hover:text-white mr-1"
              @click="ClickVideoMutedEvt"
            >
              Video Muted
            </button>
            <button
              class="text-md border rounded border-green-600 px-2 py-1 hover:bg-green-600 hover:text-white mr-1"
              @click="ClickVideoClosedEvt"
            >
              Video Closed
            </button> -->
          <!-- <button @click="(e) => clickVideoMuteEvt(e)">Video</button> -->
        </div>
        <!-- <Select
          :devices="devices?.audioInput"
          label="AudioInput"
          @handleChange="ChangeAudioInputIdEvt"
        ></Select>
        <Select
          :devices="devices?.audioOutput"
          label="AudioOutput"
          @handleChange="ChangeAudioOutputIdEvt"
        ></Select>
        <Select
          :devices="devices?.videoInput"
          label="VideoInput"
          @handleChange="ChangeVideoIdEvt"
        ></Select> -->
      </div>
      <div id="videoview">
        <div id="local">
          <p>Local</p>
          <div id="testvideo"></div>
          <!-- <video id="video" ref="localRef" autoplay></video> -->
        </div>
        <div id="remote">
        </div>
      </div>
    </section>
  </section>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from 'vue';

import Layout from '@/components/layout/layout.vue';
import Select from '@/components/UI/select.vue';
import {RTCCient} from '@/services/webrtc';
import { DDs } from '@/services/type';

export default defineComponent({
  components: {
    Layout,
    Select,
  },
  setup() {
    const client = ref(new RTCCient());
    const localRef = ref<HTMLMediaElement | null>(null);
    const devices = ref<DDs | undefined>();
    const wsClient = ref(new RTCCient())
    const test = reactive({
      audio:true,
      video:true,
    })

    const clickStartEvt = (e: any) => {
      const options = {
        uid: '',
        channel: 'test1',
      }
      client.value.join(options);
    };


    // const clickVideoMuteEvt = (e: any) => {
    //   if (cameraOpen.value) {
    //     cameraOpen.value = false;
    //     client.value.closeVideo();
    //   } else {
    //     cameraOpen.value = true;
    //     client.value.openVideo();
    //   }
    // };
    // const GetDeviceskEvt = () => {
    //   client.value.getDevices()?.then((devs) => {
    //     devices.value = devs;
    //   });
    // };
    // const ChangeAudioOutputIdEvt = (id: string) => {
    //   console.log(id);
    //   client.value.changeLocalAudioOutputId(id);
    // };
    // const ChangeAudioInputIdEvt = (id: string) => {
    //   client.value.changeLocalAudioInputId(id);
    // };
    // const ChangeVideoIdEvt = (id: string) => {
    //   client.value.changeLocalVideoId(id);
    // };

    onMounted(() => {
      client.value.createClient()
      // GetDeviceskEvt();
    });
    return {
      localRef,
      devices,
      clickStartEvt,
      // ChangeAudioInputIdEvt,
      // ChangeAudioOutputIdEvt,
      // ChangeVideoIdEvt,
      // clickVideoMuteEvt,

    };
  },
});
</script>

<style lang="scss" scoped>
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
    & > #testvideo {
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
