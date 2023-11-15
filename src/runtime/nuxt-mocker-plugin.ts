import { defineNuxtPlugin, useRoute } from "#app";
import { useRuntimeConfig } from "#imports";
import delay from "delay";
import { getCallable, isMockable } from "./fakerGenerator";
import { MockConfigItem, FlatType, FlatTypesRegistry, GeneratorCallable, MockedData, PolygenOptions, TypeConfigItem } from "./nuxtMockerTypes";

export default defineNuxtPlugin(() => {
  const baseFetch = globalThis.$fetch;
  // @ts-ignore
  globalThis.$fetch = mockableFetch(baseFetch);
  
  return {
    provide: {},
    name: "nuxt-mocker-plugin",
    enforce: "post",
  };
});

// @todo: Better use ofetch.create() (see https://github.com/unjs/ofetch/issues/79)
const mockableFetch =
  // @ts-ignore
  (baseFetch) => async (path: string, options: Record<string, unknown>) => {
    const config = getMockConfig(path);
    const types = useRuntimeConfig().public.nuxtMocker.types
    const typeConfig = useRuntimeConfig().public.nuxtMocker.typeConfig
    if (config?.factory) {
      // @ts-ignore 
      const factories = await import('@/factories/index.ts').catch()
      const { factory, delay: delayValue, ...factoryConfig } = config
      await delay(delayValue || 0)
      // @ts-ignore
      return factories.default[factory](factoryConfig, delegateBuildMock(factoryConfig, types, typeConfig))
    }
    if (config) {
      const types = useRuntimeConfig().public.nuxtMocker.types
      const typeConfig = useRuntimeConfig().public.nuxtMocker.typeConfig
      if (types) {
        const querySeed = useRoute().query.seed
        const seed = querySeed ? parseInt(String(querySeed)): undefined
        await delay(config.delay || 0)
        // @ts-ignore
        const type = types[config.type]
        // @ts-ignore
        return buildMock(config, type, types, config.type, typeConfig, seed)
      }
    }

    return baseFetch(path, options);
  };

const getMockConfig = (path: string) => {
  const mocks = useRuntimeConfig().public.nuxtMocker.mocks as MockConfigItem[]
  return mocks.reduce(
    (acc: MockConfigItem | undefined, mockConfigItem) => {
      const pattern = new RegExp(mockConfigItem.pattern);
      if (!acc && path.match(pattern) !== null) {
        return mockConfigItem;
      }

      return acc;
    },
    undefined
  );
};

const delegateBuildMock = (mockConfigItem: MockConfigItem, types: FlatTypesRegistry, typeConfig: TypeConfigItem[]) => (type: string) => {

  return buildMock(mockConfigItem, types[type], types, type, typeConfig)
}

const buildMock = (
  mockConfig: MockConfigItem,
  type: FlatType,
  types: FlatTypesRegistry,
  path: string,
  typeConfig: TypeConfigItem[],
  seed?: number,
) => {
  if (type.typeName) {

    return buildMockNode(type, types, mockConfig, path, typeConfig, seed)
  }
  if (type.tuple) {

    return type.tuple.map(
      (tupledType, index) => buildMockNode(tupledType, types, mockConfig, `${path}[${index}]`, typeConfig, seed)
    )
  }
  if (type.union) {
    const index = randomUnionIndex(type.union)
    
    return buildMockNode(type.union[index], types, mockConfig, `${path}[${index}]`, typeConfig, seed)
  }
  if (type.object) {

    return Object.keys(type.object).reduce(
      (mocked: Record<string, MockedData>, key) => {
        const memberType = (type.object as FlatTypesRegistry)[key]
        const value = buildMockNode(memberType, types, mockConfig, `${path}.${key}`, typeConfig, seed)

        return {
          ...mocked,
          ...(value ? { [key]: value }: {})
        }
      }, 
      {}
    );
  }
  if (type.literal) {

    return type.literal
  }
};


const buildMockNode = (type: FlatType, types: FlatTypesRegistry, mockConfig: MockConfigItem, path: string, typeConfig: TypeConfigItem[], seed?: number) => {
  const { path: typeConfigItemPath, ...currentTypeConfig } = typeConfig.filter(
    typeConfigItem => typeConfigItem.path === path
  )[0] || {}
  const polygenOptions = {
    ...mockConfig,
    ...currentTypeConfig,
    isCollection: type.isCollection,
    isNullable: type.isNullable
  }
  if (type.typeName) {
    if (isMockable(type.typeName)) {
      const [ generator, parameters = [] ] = getCallable(type.typeName, seed, [ polygenOptions.imagesSize ]) as GeneratorCallable
      
      return polygen(generator, parameters, polygenOptions)
    }
    const subtype = types[type.typeName]
    if (subtype) {

      return polygen(
        buildMock,
        [ mockConfig, {...type, typeName: undefined, object: subtype.object}, types, path, typeConfig, seed ],
        polygenOptions,
      )
    }
  }

  return polygen(
    buildMock,
    [ mockConfig, type, types, path, typeConfig, seed ],
    polygenOptions,
  )
}

const polygen = (
  generator: Function, 
  parameters: unknown[], 
  { 
    isCollection,
    collectionMaxLength: max = 3,
    collectionMinLength: min = 1,
    isNullable,
    probabilityPercent = 50
  }: PolygenOptions
) => {
  
  if (isNullable && Math.random() * 100 > probabilityPercent) {

    return undefined
  }

  if (!isCollection) {

    return generator(...parameters)
  }

  const length = Math.round(Math.random() * (max - min) + min)

  return [...Array(length).keys()].map(
    () => generator(...parameters)
  )
}

const randomUnionIndex = (union: FlatType[]) => Math.floor(Math.random() * union.length)