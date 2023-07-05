<script setup lang="ts">
import { useAsyncData, useState, useRuntimeConfig } from '#imports';

const count = useState<number>(() => 0)

const { data } = await useAsyncData(() => $fetch<Youp>(`/my/real/path`),{ watch: [ count ] })
const mocks = useRuntimeConfig().public.nuxtMocker.types

</script>

<template>
  <pre>{{mocks}}</pre>
  <button @click="count++">MORE</button>
  <pre>{{ data }}</pre>
</template>