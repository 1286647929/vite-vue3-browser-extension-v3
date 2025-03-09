<script setup lang="ts">
import { ref } from "vue"

// 用户信息状态
const userInfo = ref({
  name: "测试用户",
  email: "test@example.com",
  avatar: "", // 可以添加默认头像
  role: "普通用户",
  joinDate: "2024-01-01",
  lastLogin: new Date().toLocaleDateString(),
})

const userStore = useUserStore()
const logout = () => {
  userStore.logout()
}

// 可以添加编辑用户信息的方法
const editProfile = () => {
  // 实现编辑功能
  console.log("编辑用户信息")
}
</script>

<template>
  <div class="p-6">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-2xl mb-6">
          用户信息
          <button
            class="btn btn-ghost btn-circle btn-sm"
            @click="editProfile"
          >
            <i-ph-pencil />
          </button>
        </h2>

        <!-- 用户基本信息 -->
        <div class="flex items-center gap-4 mb-6">
          <div class="avatar placeholder">
            <div class="bg-neutral text-neutral-content rounded-full w-16">
              <span class="text-2xl">{{ userInfo.name.charAt(0) }}</span>
            </div>
          </div>
          <div>
            <h3 class="text-xl font-semibold">{{ userInfo.name }}</h3>
            <p class="text-gray-500">{{ userInfo.role }}</p>
          </div>
        </div>

        <!-- 详细信息 -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <i-ph-envelope class="text-gray-500" />
            <span>{{ userInfo.email }}</span>
          </div>
          <div class="flex items-center gap-2">
            <i-ph-calendar class="text-gray-500" />
            <span>加入时间：{{ userInfo.joinDate }}</span>
          </div>
          <div class="flex items-center gap-2">
            <i-ph-clock class="text-gray-500" />
            <span>上次登录：{{ userInfo.lastLogin }}</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="card-actions justify-end mt-6">
          <button
            class="btn btn-primary"
            @click="logout"
          >
            <i-ph-sign-out />
            退出登录
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  max-width: 600px;
  margin: 0 auto;
}
</style>
