<script setup lang="ts">
const displayName = __DISPLAY_NAME__
const version = __VERSION__
</script>

<template>
  <div
    class="w-full h-full flex flex-col justify-center items-center text-center md:my-12"
  >
    <h1>🎉 更新成功! 🚀</h1>
    <p>
      感谢安装 {{ displayName }}! ❤️
      <br />
      现在可以关闭此标签页并开始使用扩展。
    </p>

    <p>
      New Version: {{ version }}
      <br />
      <RouterLink
        to="/common/change-log"
        class="btn"
      >
        Change Log
      </RouterLink>
    </p>

    <hr />

    <div class="flex flex-wrap gap-2">
      <RouterLink
        v-for="route in appRouter.getRoutes()"
        :key="route.path"
        :to="route.path"
        class="btn"
      >
        {{ route.path }}
      </RouterLink>
    </div>
  </div>
</template>
