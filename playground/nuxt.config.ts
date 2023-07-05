export default defineNuxtConfig({
  modules: ['../src/module'],
  nuxtMocker: {
    useMocks: true,
    mocks: [
      {
        pattern: '^.*/real/.*$',
        type: 'Youp',
      }
    ]
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL,
    }
  }
})
