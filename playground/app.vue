<script setup lang="ts">
import { useAsyncData, useRuntimeConfig } from '#imports';
import type { ApiMediaEntityType } from 'types/types';
const { data } = await useAsyncData(() => $fetch<ApiMediaEntityType>(`/my/real/path`))
const { ApiMediaEntityType: apiMediaEntityType,  StringFieldItemType, StringFieldType} = useRuntimeConfig().public.nuxtMocker.types
// console.dir({apiMediaEntityType,  StringFieldItemType, StringFieldType}, { depth: 5 }) 
</script>

<template>
  <pre>{{ data }}</pre>
</template>