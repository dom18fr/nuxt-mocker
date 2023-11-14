export type Yolo = Toto | Tata

export type Test = 'io' | 'kk'

export interface Toto {
  truc: string
}

export interface Tata {
  machin: string,
  yolo: Test | Toto
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