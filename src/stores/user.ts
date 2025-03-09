interface UserInfo {
  name: string
  email: string
  avatar: string
  role: string
  joinDate: string
  lastLogin: string
}

export const useUserStore = defineStore('user', () => {
  // 使用 useBrowserLocalStorage 来持久化存储用户信息和登录状态
  const { data: storedUserInfo } = useBrowserLocalStorage<UserInfo | null>('userInfo', null)
  const { data: storedIsLoggedIn } = useBrowserLocalStorage<boolean>('isLoggedIn', false)

  // 计算属性，方便外部访问
  const isLoggedIn = computed(() => storedIsLoggedIn.value)
  const userInfo = computed(() => storedUserInfo.value)

  // 登录
  const login = async (user: UserInfo) => {
    storedUserInfo.value = user
    storedIsLoggedIn.value = true
  }

  // 登出
  const logout = async () => {
    storedUserInfo.value = null
    storedIsLoggedIn.value = false
  }

  return {
    isLoggedIn,
    userInfo,
    login,
    logout
  }
}) 