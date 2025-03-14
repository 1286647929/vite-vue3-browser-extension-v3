import { defineStore } from 'pinia'
import { computed } from 'vue'
import { AUTH_CONFIG } from '@/config/auth.config'
import { useBrowserLocalStorage } from '@/composables/useBrowserStorage'

interface UserInfo {
  name: string
  email: string
  avatar: string
  role: string
  joinDate: string
  lastLogin: string
  // 可以添加外部应用可能需要的其他字段
  token?: string
  externalId?: string
  permissions?: string[]
}

export const useUserStore = defineStore('user', () => {
  // 使用 useBrowserLocalStorage 来持久化存储用户信息和登录状态
  const { data: storedUserInfo } = useBrowserLocalStorage<UserInfo | null>(AUTH_CONFIG.USER_INFO_KEY, null)
  const { data: storedIsLoggedIn } = useBrowserLocalStorage<boolean>('isLoggedIn', false)
  const { data: storedToken } = useBrowserLocalStorage<string | null>(AUTH_CONFIG.TOKEN_KEY, null)

  // 计算属性，方便外部访问
  const isLoggedIn = computed(() => storedIsLoggedIn.value)
  const userInfo = computed(() => storedUserInfo.value)
  const token = computed(() => storedToken.value)

  // 登录
  const login = async (user: UserInfo) => {
    storedUserInfo.value = user
    storedIsLoggedIn.value = true
    
    // 如果用户信息中包含token，则保存token
    if (user.token) {
      storedToken.value = user.token
    }
    
    // 通知其他扩展组件登录成功
    chrome.runtime.sendMessage({
      type: 'LOGIN_STATUS_CHANGED',
      status: 'success',
      payload: user
    })
  }

  // 登出
  const logout = async () => {
    storedUserInfo.value = null
    storedIsLoggedIn.value = false
    storedToken.value = null
    
    // 通知其他扩展组件登出
    chrome.runtime.sendMessage({
      type: 'LOGIN_STATUS_CHANGED',
      status: 'logout'
    })
  }

  // 从外部应用同步用户信息
  const syncFromExternalApp = async (externalUserInfo: Partial<UserInfo>) => {
    if (!externalUserInfo) return
    
    // 如果当前已有用户信息，则合并，否则创建新的用户信息
    if (storedUserInfo.value) {
      storedUserInfo.value = {
        ...storedUserInfo.value,
        ...externalUserInfo
      }
    } else {
      // 确保必填字段有默认值
      await login({
        name: externalUserInfo.name || '外部用户',
        email: externalUserInfo.email || '',
        avatar: externalUserInfo.avatar || '',
        role: externalUserInfo.role || '用户',
        joinDate: externalUserInfo.joinDate || new Date().toLocaleDateString(),
        lastLogin: new Date().toLocaleDateString(),
        ...externalUserInfo
      })
    }
    
    return storedUserInfo.value
  }
  
  // 检查登录状态
  const checkLoginStatus = async (): Promise<boolean> => {
    // 从存储中获取最新状态
    const result = await chrome.storage.local.get(['isLoggedIn', AUTH_CONFIG.USER_INFO_KEY])
    const isLoggedInFromStorage = result.isLoggedIn || false
    
    // 如果存储状态与当前状态不一致，则更新
    if (isLoggedInFromStorage !== storedIsLoggedIn.value) {
      storedIsLoggedIn.value = isLoggedInFromStorage
    }
    
    // 如果存储中有用户信息但当前没有，则更新
    const userInfoFromStorage = result[AUTH_CONFIG.USER_INFO_KEY]
    if (isLoggedInFromStorage && userInfoFromStorage && !storedUserInfo.value) {
      storedUserInfo.value = userInfoFromStorage
    }
    
    return storedIsLoggedIn.value
  }

  return {
    isLoggedIn,
    userInfo,
    token,
    login,
    logout,
    syncFromExternalApp,
    checkLoginStatus
  }
})

// 导入所需的依赖已移至文件顶部