export type PolygenConfigItem = {
  probabilityPercent?: number;
  collectionMinLength?: number;
  collectionMaxLength?: number;
  imagesSize?: {
    width: number,
    height: number, 
  }
}

export type TypeConfigItem = { path: string } & PolygenConfigItem // @todo: add {factory?: Function | string} in it

export type RootMockConfigItem = {
  pattern: string;
  type?: string;
  delay?: number;
}

export type MockConfigItem = RootMockConfigItem & PolygenConfigItem // @todo: add {factory?: Function | string} in it

export type FlatTypesRegistry = Record<string, FlatType>

export type FlatType = {
  typeName?: string;
  literal?: string | number | boolean;
  union?: FlatType[];
  object?: FlatTypesRegistry;
  tuple?: FlatType[];
  isCollection: boolean;
  isNullable: boolean;
  path: string;
}

export type GeneratorCallable = [Function, Array<unknown>]

export type PolygenBaseOptions = {
  isCollection: boolean;
  isNullable: boolean;
}

export type PolygenOptions = PolygenBaseOptions & PolygenConfigItem

export type MockedData = Record<string, unknown>|Array<unknown>|string|number|boolean;