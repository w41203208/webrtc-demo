import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve, path } from 'path';
import fs from 'fs';

// https://vitejs.dev/config/
export default ({ mode }) => {
  const env = loadEnv(mode, __dirname);
  return defineConfig({
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    // server: {
    //   https: {
    //     key: fs.readFileSync(`${__dirname}/.cert/localhost-key.pem`),
    //     cert: fs.readFileSync(`${__dirname}/.cert/localhost.pem`),
    //   },
    // },
    plugins: [vue()],
    env,
  });
};
