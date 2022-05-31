<template>
  <Header></Header>
  <slot name="body"></slot>
  <Footer></Footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Header from './header.vue';
import Footer from './footer.vue';

export default defineComponent({
  components: {
    Header,
    Footer,
  },
  setup() {
    return {};
  },
});
</script>
