export default defineNuxtConfig({
  modules: ['../src/module'],
  nuxtMocker: {
    useMocks: true,
    mocks: [
      {
        pattern: '^.*/real/.*$',
        type: 'Youp'
      }
    ],
    typeConfig: [
      {
        path: 'Youp.longList',
        collectionMinLength: 15,
        collectionMaxLength: 30,
      },
      {
        path: 'Youp.shortList',
        collectionMinLength: 1,
        collectionMaxLength: 2,
      }
    ]
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL,
    }
  }
})
