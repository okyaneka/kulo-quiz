import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// Element Plus
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// Pages & Layouts
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    AutoImport({
      // targets to transform
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/,
        /\.vue\?vue/, // .vue
        /\.md$/, // .md
      ],

      imports: [
        'vue',
        'vue-router',
        'pinia',
        {
          '@vee-validate/zod': ['toFormValidator'],
          'firebase/firestore': [
            'addDoc',
            'collection',
            'deleteDoc',
            'doc',
            'getDoc',
            'getDocs',
            'limit',
            'orderBy',
            'query',
            'runTransaction',
            'setDoc',
            'startAfter',
            'Timestamp',
            'where',
            'writeBatch',
          ],
          'element-plus': ['ElMessage'],
          'vee-validate': ['useField', 'useForm'],
        },
      ],
      dirs: ['src/composables/**'],
      eslintrc: { enabled: true },
      dts: 'src/autoimport.d.ts',
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      dts: 'src/components.d.ts',
      extensions: ['vue', 'md'],
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      resolvers: [
        ElementPlusResolver({
          importStyle: 'sass',
        }),
      ],
      dirs: ['src/composables/components'],
    }),
    Pages(),
    Layouts({
      defaultLayout: 'default',
    }),
  ],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "~/styles/element/index.scss" as *;`,
      },
    },
  },
})
