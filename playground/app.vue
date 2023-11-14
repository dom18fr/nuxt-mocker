<script setup lang="ts">
import { useAsyncData } from '#imports';
import type { Yolo } from 'types/types'

const { data } = await useAsyncData(() => $fetch<Yolo>(`/my/real/path`))

</script>

<template>
  <pre>{{ data }}</pre>
</template>