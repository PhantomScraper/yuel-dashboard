// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  app: {
    head: {
      title: 'Zillow Dashboard',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Real Estate Dashboard' }
      ]
    }
  },

  runtimeConfig: {
    mongoUri: process.env.MONGO_URI,
    mongoDbName: process.env.MONGO_DB_NAME,
    public: {
      /** SHOW_300=true | 1 — dashboard shows only 2 tabs (300k–500k + Tracking price 300_500k) */
      show300:
        process.env.SHOW_300 === 'true'
        || process.env.SHOW_300 === '1'
        || process.env.NUXT_PUBLIC_SHOW_300 === 'true'
        || process.env.NUXT_PUBLIC_SHOW_300 === '1',
    },
  },

  compatibilityDate: '2025-04-26'
})