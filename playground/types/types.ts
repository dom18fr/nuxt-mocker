export interface Test {
  simpleString: Word,
  template: 'home',
  langcode: LanguageType,
  yolo: Toto,
  test: 'yop' | 'nope' | false,
  num: 1 | 2 | 3
}

export type LanguageType = 'fr' | 'en';

type Toto = {
  to: true | false;
}