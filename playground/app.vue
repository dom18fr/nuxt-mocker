<script setup lang="ts">
import { useAsyncData, useState } from '#imports';

const count = useState<number>(() => 0)

const { data } = await useAsyncData(() => $fetch<Youp>(`/my/real/path`),{ watch: [ count ] })

const up = () => {
  count.value++
}
</script>

<template>
  <div v-if="data">
    <div>lat: {{ data.lat }}</div>
    <div>long: {{ data.long }}</div>
    <button @click="up">{{ count }}</button>
  </div>
</template>