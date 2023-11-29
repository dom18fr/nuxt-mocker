export type StringFieldItemType = { 
  value: Word 
};
export type StringFieldType = StringFieldItemType[]; // @todo: this is properly extracted, but runtime generation fails

export interface ApiMediaEntityType {
  truc: StringFieldType,
  yolo: {
    toto: Words
  }
}