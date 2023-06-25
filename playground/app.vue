<script setup>
import { useAsyncData } from '#imports';

const { data } = await useAsyncData(`trial_data`, () => $fetch(`/my/real/path`), )
console.log(data.value)
</script>

<template>
  <div>
    {{ data }}
  </div>
</template>