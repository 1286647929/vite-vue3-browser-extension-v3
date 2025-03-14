// Sample code if using extensionpay.com
// import { extPay } from '@/utils/payment/extPay'
// extPay.startBackground()

import { AUTH_CONFIG } from '@/config/auth.config'

// 定义响应类型
interface ResponseType {
  success: boolean
  error?: string
}

// 监听来自登录页面的消息
chrome.runtime.onMessage.addListener(
  (
    request: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: ResponseType) => void
  ) => {
    // 验证消息来源
    if (new URL(sender.url!).origin === new URL(AUTH_CONFIG.LOGIN_URL).origin) {
      if (request.type === 'LOGIN_SUCCESS' && request.token) {
        // 存储token
        chrome.storage.local.set({
          [AUTH_CONFIG.TOKEN_KEY]: request.token,
          [AUTH_CONFIG.USER_INFO_KEY]: request.userInfo || null
        })
        .then(async () => {
          // 通知所有标签页登录成功
          const tabs = await chrome.tabs.query({})
          tabs.forEach(tab => {
            if (tab.id) {
              chrome.tabs.sendMessage(tab.id, { type: 'LOGIN_STATUS_CHANGED', status: 'success' })
            }
          })
          sendResponse({ success: true })
        })
        .catch(error => {
          console.error('存储token失败:', error)
          sendResponse({ success: false, error: '存储token失败' })
        })
        
        // 返回true表示会异步调用sendResponse
        return true
      }
    }
    // 如果不是登录成功消息，直接返回
    return false
  }
)

// 监听登出请求
chrome.runtime.onMessage.addListener(
  (
    request: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: ResponseType) => void
  ) => {
    if (request.type === 'LOGOUT') {
      chrome.storage.local.remove([AUTH_CONFIG.TOKEN_KEY, AUTH_CONFIG.USER_INFO_KEY])
        .then(() => {
          sendResponse({ success: true })
        })
        .catch(error => {
          console.error('清除token失败:', error)
          sendResponse({ success: false, error: '清除token失败' })
        })
      return true // 异步响应
    }
    return false
  }
)

// 安装/更新处理
chrome.runtime.onInstalled.addListener(async (opt) => {
  // Check if reason is install or update. Eg: opt.reason === 'install' // If extension is installed.
  // opt.reason === 'update' // If extension is updated.
  if (opt.reason === "install") {
    chrome.tabs.create({
      active: true,
      // Open the setup page and append `?type=install` to the URL so frontend
      // can know if we need to show the install page or update page.
      url: chrome.runtime.getURL("src/ui/setup/index.html#/setup/install"),
    })

    return
  }

  if (opt.reason === "update") {
    chrome.tabs.create({
      active: true,
      url: chrome.runtime.getURL("src/ui/setup/index.html#/setup/update"),
    })

    return
  }
})

self.onerror = function (message, source, lineno, colno, error) {
  console.error("Error: " + message)
  console.error("Source: " + source)
  console.error("Line: " + lineno)
  console.error("Column: " + colno)
  console.error("Error object: " + error)
}

console.info("Background script is running")

export {}
