export interface ComposablePageType {
  components: Word[],
}

export interface PageCommonType {
  langcode: 'fr' | 'en',
}

export interface HubPageLightType extends PageCommonType {}

export interface HubPageFullType extends HubPageLightType, ComposablePageType {}