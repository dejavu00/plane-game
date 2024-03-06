<script setup>
import { onMounted } from 'vue'
import PlaneGame from './game'
onMounted(async () => {
  const container = document.getElementById('container')
  new PlaneGame({
    container,
  })
})

</script>

<template>
  <div id="container">

  </div>

</template>

<style scoped></style>
