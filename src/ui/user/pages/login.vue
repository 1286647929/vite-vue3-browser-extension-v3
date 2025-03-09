<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useUserStore } from "@/stores/user"

const router = useRouter()
const userStore = useUserStore()

const loginForm = ref({
  email: "",
  password: "",
})

const loading = ref(false)
const errorMsg = ref("")

const handleLogin = async () => {
  if (!loginForm.value.email || !loginForm.value.password) {
    errorMsg.value = "请填写邮箱和密码"
    return
  }

  loading.value = true
  errorMsg.value = ""

  try {
    // 这里模拟登录，实际项目中应该调用API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    await userStore.login({
      name: "测试用户",
      email: loginForm.value.email,
      avatar: "",
      role: "普通用户",
      joinDate: "2024-01-01",
      lastLogin: new Date().toLocaleDateString(),
    })

    // 登录成功后，先关闭 iframe，然后重新打开（这样会显示简历上传页面）
    window.parent.postMessage('minimize-iframe', '*')
    setTimeout(() => {
      window.parent.postMessage('show-iframe', '*')
    }, 100)

    router.push("/")
  } catch (error) {
    errorMsg.value = "登录失败，请重试"
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <div class="card bg-base-100 shadow-xl w-full max-w-md">
      <div class="card-body">
        <h2 class="card-title text-2xl mb-6 justify-center">登录</h2>

        <!-- 错误提示 -->
        <div
          v-if="errorMsg"
          class="alert alert-error mb-4"
        >
          <i-ph-warning-circle />
          <span>{{ errorMsg }}</span>
        </div>

        <!-- 登录表单 -->
        <form @submit.prevent="handleLogin">
          <div class="form-control">
            <label class="label">
              <span class="label-text">邮箱</span>
            </label>
            <input
              v-model="loginForm.email"
              type="email"
              placeholder="请输入邮箱"
              class="input input-bordered"
              required
            />
          </div>

          <div class="form-control mt-4">
            <label class="label">
              <span class="label-text">密码</span>
            </label>
            <input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              class="input input-bordered"
              required
            />
            <label class="label">
              <a
                href="#"
                class="label-text-alt link link-hover"
              >
                忘记密码？
              </a>
            </label>
          </div>

          <div class="form-control mt-6">
            <button
              class="btn btn-primary"
              :class="{ loading }"
              :disabled="loading"
            >
              {{ loading ? "登录中..." : "登录" }}
            </button>
          </div>
        </form>

        <!-- 注册链接 -->
        <div class="text-center mt-4">
          <span class="text-sm">还没有账号？</span>
          <RouterLink
            to="/register"
            class="link link-primary text-sm ml-1"
          >
            立即注册
          </RouterLink>
        </div>
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
