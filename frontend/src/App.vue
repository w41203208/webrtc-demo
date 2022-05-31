<template>
  <main class="h-screen flex flex-col">
    <router-view></router-view>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',

  setup() {
    return {};
  },
});
</script>

<style></style>
