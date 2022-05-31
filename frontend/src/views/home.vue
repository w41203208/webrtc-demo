<template>
  <section class="flex flex-col justify-center items-center h-screen">
    <div class="flex flex-col">
      <Form
        :uid="inputReactive.uid"
        :channel="inputReactive.channel"
        @setChannel="setCHANNEL"
        @setUid="setUID"
      >
        <template #button>
          <div class="flex">
            <button
              class="text-md border rounded border-green-600 px-2 py-1 hover:bg-green-600 hover:text-white mr-1"
              @click="ClickJoinRoomEvt"
            >
              Join Room
            </button>

          </div>
        </template>
      </Form>
    </div>

  </section>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import {RTCCient} from '@/services/webrtc';
import Form from '@/components/UI/form.vue';

export default defineComponent({
  components: {
    Form,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const inputReactive = reactive({
      uid: '',
      channel: 'test',
    });

    const setUID = (uid: string) => {
      inputReactive.uid = uid;
    };
    const setCHANNEL = (channel: string) => {
      inputReactive.channel = channel;
    };

    const ClickJoinRoomEvt = () => {
      router.push({ path: '/room', query: { uid: inputReactive.uid, channel: inputReactive.channel } })
    };


    onMounted(()=>{
    })

    return {
      setUID,
      setCHANNEL,
      ClickJoinRoomEvt,
      inputReactive,
    };
  },
});
</script>

<style lang="scss" scoped>

.ming-nav {
  @apply w-24 h-8  flex items-center justify-center rounded-t cursor-pointer;
  margin-bottom: -1px;
  &.active {
    @apply border border-b-0 border-purple-400 bg-white;
  }
}
.disabled {
  @apply bg-gray-300 border border-gray-400 text-gray-400;
}
</style>
