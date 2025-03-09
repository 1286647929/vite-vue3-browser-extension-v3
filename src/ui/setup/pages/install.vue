<script setup lang="ts">
const displayName = __DISPLAY_NAME__
// const version = __VERSION__
</script>

<template>
  <div
    class="w-full h-full flex flex-col justify-center items-center text-center md:my-12"
  >
    <h1>🎉 安装成功! 🚀</h1>
    <p>
      感谢安装 {{ displayName }}! ❤️
      <br />
      现在可以关闭此标签页并开始使用扩展。
    </p>
  </div>
</template>

<style lang="scss" scoped></style>
