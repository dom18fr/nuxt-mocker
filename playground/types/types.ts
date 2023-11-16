export interface Tata {
  machin: Words,
  yolo: Words,
}
interface Titi extends Tata {
  truc: string
}

export interface Toto extends Titi, Youp {
  bidule: RelativePath
}

interface Youp {
  youp: Words
}

// export type PageContent = {
//   heading: {
//     title: Words
//     template: 'news' | 'event'
//   }
//   meta: {
//     title: Words
//     description?: PlainLongString
//   },
//   paragraphs: ContribParagraph[]
// }

// export type ContribParagraph = TwoColumnsParagraph | KeyFiguresParagraph | CtaParagraph

// export type AnyParagraph = ContribParagraph | KeyFigureParagraph

// export type TwoColumnsParagraph = {
//   firstColumnParagraphs: ContribParagraph[]
//   secondColumnParagraphs: ContribParagraph[]
// }

// export type KeyFiguresParagraph = {
//   keyFiguresParagraphs: KeyFigureParagraph[]
// }

// export type KeyFigureParagraph = {
//   axe: 'toto' | 'tata'
//   figure: Word
//   description: PlainLongString
//   secondaryDescription: PlainLongString
// }

// export type CtaParagraph = {
//   url: RelativePath,
//   label: Word,
//   target: '_blank' | '_self'
// }