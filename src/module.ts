import { defineNuxtModule, addPlugin, createResolver } from "@nuxt/kit"
import extractTsTypes from "./extractTsTypes"
import { MockConfigItem, FlatTypesRegistry, TypeConfigItem } from "./runtime/nuxtMockerTypes"

export interface ModuleOptions {
  useMocks: boolean;
  mocks: MockConfigItem[];
  typeConfig: TypeConfigItem[];
  types: FlatTypesRegistry;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxtMocker',
    configKey: 'nuxtMocker'
  },
  // Default configuration options of the Nuxt module
  defaults: {
    useMocks: false,
    mocks: [],
    typeConfig: [],
    types: {},
  } as ModuleOptions,
  async setup ({ useMocks, mocks: rawMocks, typeConfig }: ModuleOptions, nuxt) {
    if (useMocks) {
      const types: FlatTypesRegistry = await extractTsTypes()
      const mocks: MockConfigItem[] = rawMocks.map(
        (mock) => {
          return {
            ...mock,
            collectionMinLength: mock.collectionMinLength || 1,
            collectionMaxLength: mock.collectionMaxLength || 3,
            probabilityPercent: mock.probabilityPercent || 100,
          }
        },
        []
      )
      nuxt.options.runtimeConfig = {
        ...nuxt.options.runtimeConfig,
        nuxtMocker: {
          mocks,
          typeConfig,
          // @ts-ignore
          types,
        }
      }
      const { resolve } = createResolver(import.meta.url)
      addPlugin({
        src: resolve('./runtime/nuxt-mocker-plugin'),
        mode: 'server'
      })
    }
  }
})
