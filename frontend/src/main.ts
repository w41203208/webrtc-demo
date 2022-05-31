import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import Antd from 'ant-design-vue';
import store from './store';
import '@/index.css';
import 'ant-design-vue/dist/antd.css';

createApp(App).use(router).use(store).use(Antd).mount('#app');
