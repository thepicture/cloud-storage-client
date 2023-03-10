import colors from 'vuetify/es5/util/colors'

export default {
  target: 'static',

  head: {
    titleTemplate: '%s - cloud-storage-client',
    title: 'cloud-storage-client',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  css: [],

  plugins: [
    {
      src: '~/plugins/date-time-picker.js',
      mode: 'client',
    },
  ],

  components: true,

  buildModules: ['@nuxtjs/vuetify'],

  modules: ['cookie-universal-nuxt', '@nuxt/http', '@nuxtjs/axios'],

  axios: {
    baseURL: 'https://cloud-storage-server.thepicture.repl.co/',
  },

  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
        },
      },
    },
  },

  build: {},

  serverMiddleware: [
    {
      path: '/api',
      handler: '~/api/index.js',
    },
  ],
}
