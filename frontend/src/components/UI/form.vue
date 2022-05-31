<template>
  <section class="flex flex-col justify-start w-80 px-3">
    <div class="mb-2 flex flex-col">
      <p class="ming-p-title">UID</p>
      <input
        type="text"
        class="ming-input"
        :value="uid"
        @input="(e) => handleChangeUID(e)"
      />
    </div>
    <div class="mb-2 flex flex-col">
      <p class="ming-p-title">channel</p>
      <input
        type="text"
        class="ming-input"
        :value="channel"
        @input="(e) => handleChangeCHANNEL(e)"
      />
    </div>

    <slot name="button"> </slot>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  props: {
    uid: {
      type: String as PropType<string | null>,
    },
    channel: {
      type: String as PropType<string>,
    },
    role: {
      type: Number as PropType<number>,
    },
  },
  emits: ['setUid', 'setChannel', 'setRole'],
  setup(props, { emit }) {
    const handleChangeUID = (e: any) => {
      emit('setUid', e.target.value);
    };
    const handleChangeCHANNEL = (e: any) => {
      emit('setChannel', e.target.value);
    };
    const handleCheckBoxROLE = (e: any) => {
      emit('setRole', parseInt(e.target.value));
    };
    return {
      handleChangeUID,
      handleChangeCHANNEL,
      handleCheckBoxROLE,
    };
  },
});
</script>
<style lang="scss" scoped>
.ming-input {
  @apply outline-none border px-2 py-1 rounded focus:border-blue-400 hover:border-blue-400;
}
.ming-p-title {
  @apply text-lg mb-1 text-left;
}
</style>
