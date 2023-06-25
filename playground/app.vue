<script setup lang="ts">
import { useAsyncData } from '#imports';

const { data } = await useAsyncData(`trial_data`, () => $fetch<Youp>(`/my/real/path`), )
</script>

<template>
  <div v-if="data">
    <div>
      {{ data }}
    </div>
    <div>
      <img :src="data.aLargeImage" alt="" />
    </div>
    <div>
      <img :src="data.anotherComplexType.image" alt=""/>
    </div>
  </div>
</template>