<script setup lang="ts">
import { useAsyncData, useState, useRuntimeConfig } from '#imports';

const count = useState<number>(() => 0)

const { data } = await useAsyncData(() => $fetch<Youp>(`/my/real/path`),{ watch: [ count ] })

const up = () => {
  count.value++
}

const mocks = useRuntimeConfig().public.nuxtMocker.types

</script>

<template>
  <div v-if="data">
    <div v-for="item in data">
      <div>lat: {{ item.lat }}</div>
      <div>long: {{ item.long }}</div>
    </div>
    <button @click="up">{{ count }}</button>
  </div>
</template>