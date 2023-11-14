export default defineNuxtConfig({
  modules: ['../src/module'],
  nuxtMocker: {
    useMocks: true,
    mocks: [
      {
        pattern: '^.*/real/.*$',
        factory: 'yoloFactory'
      }
    ],
    factoriesPath: '../../playground/factories'
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL,
    }
  }
})
