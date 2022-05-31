<template>
  <div>
    <label for="devices">{{ label }}：</label>
    <select
      name="devices"
      id="devices"
      class="rounded border-2 border-black p-1"
      @change="handleChange"
    >
      <slot name="option">
        <option
          v-for="device in devices"
          :key="device.deviceId"
          :value="device.deviceId"
        >
          {{ device.label }}
        </option>
      </slot>
    </select>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  props: {
    devices: {
      type: Array as PropType<MediaDeviceInfo[] | undefined>,
    },
    label: {
      type: String as PropType<string | undefined>,
    },
  },
  emits: ['handleChange'],
  setup(props, { emit }) {
    const handleChange = (e: any) => {
      emit('handleChange', e.target.value);
    };
    return {
      handleChange,
    };
  },
});
</script>
