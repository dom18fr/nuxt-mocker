<script setup>
import { useAsyncData } from '#imports';

const { data } = await useAsyncData(`trial_data`, () => $fetch(`/my/real/path`))
console.log(data.value)
</script>

<template>
  <div>
  <h1>{{ data.title }}</h1>
  </div>
  {{ data }}
  <!-- <div v-html="data.yolo"></div>
  <div v-html="data.teub"></div>
  <div v-html="data.when"></div>
  <div v-html="data.is"></div> -->
</template>