type Youp = {
  shortList: Word[];
  oo: {
    yololo: HtmlLongString;
    toto: Date[];
  }
  aLargeImage: ImageSrc;
  anotherComplexType: AnotherComplexType;
}

type AnotherComplexType = {
  prenom: FirstName;
  nom: LastName;
  image: ImageSrc;
}