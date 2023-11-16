<script setup lang="ts">
import { useAsyncData } from '#imports';
import type { Toto } from 'types/types'

const { data } = await useAsyncData(() => $fetch<Toto>(`/my/real/path`))

</script>

<template>
  <pre>{{ data }}</pre>
</template>