export default defineNuxtConfig({
  modules: ['../src/module'],
  nuxtMocker: {
    useMocks: true,
    mocks: [
      {
        pattern: '^.*/real/.*$',
        type: 'Youp',
        imagesSize: {
          width: 1024,
          height: 768
        }
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
      },
      {
        path: 'Youp.anotherComplexType.image',
        imagesSize: {
          width: 240,
          height: 120
        }

      }
    ]
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL,
    }
  }
})
