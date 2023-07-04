import { Faker, faker } from "@faker-js/faker";
import injectRandomHtml from "./injectRandomHtml";

export const isMockable = (name: string) => {
  
  return getCallablesDefinitions(faker).hasOwnProperty(name)
}

export const getCallable = (name: string, seed?: number, generatorParams?: Array<any>) => {
  faker.seed(seed)
  const definitions = getCallablesDefinitions(faker, generatorParams) as Record<string, unknown>

  return definitions[name] || [() => undefined, []]
}
 
const getCallablesDefinitions = (faker: Faker, generatorParams: Array<any> = []) => ({
  string : [ faker.lorem.sentence ],
  number: [ faker.number.int ],
  boolean: [ faker.datatype.boolean ],
  Date: [ faker.date.anytime ],
  Word: [ faker.lorem.word ],
  RelativePath: [
    (options: { min: number, max: number }) => (
      '/' + 
      faker.helpers.slugify(
        faker.lorem.words(options)
      )
    ),
    [ { min: 1, max: 4 } ]
  ],
  AbsolutePath: [
    ({ 
      protocol, 
      ...wordsOptions 
    }: { protocol: 'http'|'https', min: number, max: number }) => (
      faker.internet.url({ appendSlash: true, protocol }) +
      faker.helpers.slugify(
        faker.lorem.words(wordsOptions)
      )
    ),
    [ { protocol: 'https', min: 1, max: 4 } ]
  ],
  Words: [
    faker.lorem.words,
    [ { min: 2, max: 5 } ]
  ],
  PlainLongString: [
    faker.lorem.paragraphs,
    [{ min: 1, max: 3 }]
  ],
  HtmlLongString: [
    injectRandomHtml,
    [ faker.lorem.paragraphs({min: 1, max: 3}) ]
  ],
  FirstName: [
    faker.person.firstName,
  ],
  LastName: [
    faker.person.lastName,
  ],
  FullName: [
    faker.person.fullName,
  ],
  StreetAddress: [
    faker.location.streetAddress,
    [ false ]
  ],
  PostalCode: [
    faker.location.zipCode,
    [ '#####' ]
  ],
  City: [
    faker.location.city
  ],
  CountryCode: [
    faker.location.countryCode,
    [ 'alpha-2' ]
  ],
  Country: [
    faker.location.country
  ],
  Latitude: [
    faker.location.latitude
  ],
  Longitude: [
    faker.location.longitude
  ],
  Int: [
    faker.number.int
  ],
  Float: [
    faker.number.float
  ],
  ImageSrc: [
    faker.image.url,
    [ ...generatorParams ]
  ]
})