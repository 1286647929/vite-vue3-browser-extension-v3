<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useUserStore } from "@/stores/user"
import { AUTH_CONFIG } from "@/config/auth.config"

const router = useRouter()
const userStore = useUserStore()
const checking = ref(false)

// 定义消息类型
interface Message {
  type: string
  status: string
}

// 跳转到登录页面
const redirectToLogin = () => {
  // 打开新窗口进行登录
  window.open(AUTH_CONFIG.LOGIN_URL, '_blank')
}

// 检查登录状态的定时器
let checkLoginInterval: number | null = null

// 开始检查登录状态
const startCheckingLoginStatus = () => {
  if (checking.value) return
  checking.value = true
  
  // 监听来自background的消息
  const messageListener = (
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: () => void
  ): boolean => {
    if (message.type === 'LOGIN_STATUS_CHANGED' && message.status === 'success') {
      // 获取存储的用户信息
      chrome.storage.local.get(AUTH_CONFIG.USER_INFO_KEY).then(async (result) => {
        const userInfo = result[AUTH_CONFIG.USER_INFO_KEY]
        
        if (userInfo) {
          await userStore.login(userInfo)
        } else {
          // 如果没有用户信息，使用默认值
          await userStore.login({
            name: "已登录用户",
            email: "",
            avatar: "",
            role: "普通用户",
            joinDate: new Date().toLocaleDateString(),
            lastLogin: new Date().toLocaleDateString(),
          })
        }

        // 登录成功后，先关闭 iframe，然后重新打开（这样会显示简历上传页面）
        window.parent.postMessage('minimize-iframe', '*')
        setTimeout(() => {
          window.parent.postMessage('show-iframe', '*')
        }, 100)

        router.push("/")
        
        // 清理监听器
        chrome.runtime.onMessage.removeListener(messageListener)
        checking.value = false
      })
    }
    return true // 表示我们会异步处理消息
  }

  // 添加消息监听
  chrome.runtime.onMessage.addListener(messageListener)
}

// 组件卸载时清理
onUnmounted(() => {
  checking.value = false
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <div class="card bg-base-100 shadow-xl w-full max-w-md">
      <div class="card-body text-center">
        <h2 class="card-title text-2xl mb-6 justify-center">登录提示</h2>

        <div class="mb-6">
          <i-ph-identification-card-thin class="text-6xl text-primary mb-4" />
          <p class="text-lg mb-2">您需要登录才能使用此功能</p>
          <p class="text-sm text-gray-500 mb-6">点击下方按钮跳转到登录页面</p>
        </div>

        <div class="form-control">
          <button
            class="btn btn-primary"
            :class="{ 'loading': checking }"
            :disabled="checking"
            @click="redirectToLogin(); startCheckingLoginStatus()"
          >
            {{ checking ? '等待登录中...' : '前往登录' }}
          </button>
        </div>

        <p class="text-sm text-gray-500 mt-4">
          登录完成后请返回此页面，系统会自动检测您的登录状态
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.9);
}
</style>
