<script setup lang="ts">
const a = ref(0)
const test = () => {
  alert(`test${a.value}`)
  a.value++
}
</script>

<template>
  <div>
    <button @click="test">
      点我➕1
    </button>
  </div>
</template>

<style scoped>

</style>