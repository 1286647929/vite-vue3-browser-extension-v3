<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 发送消息给content-script
const minimizeWindow = () => {
  window.parent.postMessage('minimize-iframe', '*')
}
</script>

<template>
  <div class="navbar bg-primary text-primary-content p-2">
    <div class="flex gap-2 items-center">
      <RouterLink
        :to="userStore.isLoggedIn ? '/user' : '/user/login'"
      >
        <i-ph-user-circle
          :class="userStore.isLoggedIn ? '' : 'animate-pulse'"
        />
      </RouterLink>
      <span class="text-base font-semibold">{{ userStore.userInfo?.name || '未登录用户' }}</span>
    </div>
    <div class="flex-none">
      <ul class="menu menu-horizontal menu-xs">
        <li>
          <div
            class="flex gap-1 items-center"
            style="cursor: pointer;"
            @click="minimizeWindow"
          >
            <i-ph-minus-circle />
            最小化
          </div>
        </li>
        <li v-if="userStore.isLoggedIn">
          <RouterLink
            to="/"
            class="flex-1 pl-2"
          >
            <i-ph-paper-plane />
            简历上传
          </RouterLink>
        </li>
        <!-- <li>
          <RouterLink to="/options-page">
            <i-ph-gear />
            设置
          </RouterLink>
        </li> -->
      </ul>
    </div>
  </div>
</template>

<style scoped></style>