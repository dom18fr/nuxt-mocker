<script setup lang="ts">
import { useAsyncData, useRuntimeConfig } from '#imports';
import type { Test } from 'types/types';
const { data } = await useAsyncData(() => $fetch<Test>(`/my/real/path`))
const config = useRuntimeConfig().public.nuxtMocker.types.LanguageType
// console.log(config) 
</script>

<template>
  <pre>{{ data }}</pre>
</template>