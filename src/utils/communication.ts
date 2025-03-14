/**
 * 浏览器扩展与外部Vue2项目通信工具
 */
import { AUTH_CONFIG } from '@/config/auth.config'

// 定义消息类型
export enum MessageType {
  // 登录相关
  LOGIN_REQUEST = 'LOGIN_REQUEST',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  
  // 用户信息相关
  USER_INFO_REQUEST = 'USER_INFO_REQUEST',
  USER_INFO_RESPONSE = 'USER_INFO_RESPONSE',
  
  // 数据同步相关
  SYNC_DATA = 'SYNC_DATA',
  SYNC_RESPONSE = 'SYNC_RESPONSE',
  
  // 通用消息
  NOTIFICATION = 'NOTIFICATION',
  ERROR = 'ERROR',
  
  // 扩展控制
  SHOW_EXTENSION = 'SHOW_EXTENSION',
  HIDE_EXTENSION = 'HIDE_EXTENSION',

  // 检测是否安装拓展
  CHECK_EXTENSION_INSTALLED = 'CHECK_EXTENSION_INSTALLED'
}

// 定义消息接口
export interface ExtensionMessage {
  type: MessageType;
  payload?: any;
  timestamp?: number;
  source?: 'extension' | 'webpage';
}

/**
 * 验证消息来源是否合法
 * @param origin 消息来源
 * @returns 是否合法
 */
const isValidOrigin = (origin: string): boolean => {
  return AUTH_CONFIG.ALLOWED_ORIGINS.some(allowedOrigin => {
    return origin === allowedOrigin || origin.startsWith(allowedOrigin);
  });
};

/**
 * 发送消息到外部网页
 * @param message 消息对象
 */
export const sendMessageToWebpage = (message: Omit<ExtensionMessage, 'source' | 'timestamp'>): void => {
  const fullMessage: ExtensionMessage = {
    ...message,
    source: 'extension',
    timestamp: Date.now()
  };
  
  // 向所有允许的源发送消息
  window.postMessage(fullMessage, '*');
};

/**
 * 发送消息到扩展的其他部分（如background、popup等）
 * @param message 消息对象
 */
export const sendMessageToExtension = (message: Omit<ExtensionMessage, 'source' | 'timestamp'>): Promise<any> => {
  const fullMessage: ExtensionMessage = {
    ...message,
    source: 'extension',
    timestamp: Date.now()
  };
  
  return chrome.runtime.sendMessage(fullMessage);
};

/**
 * 监听来自外部网页的消息
 * @param callback 回调函数
 */
export const listenToWebpageMessages = (callback: (message: ExtensionMessage, origin: string) => void): () => void => {
  const messageHandler = (event: MessageEvent) => {
    // 验证消息来源
    if (!isValidOrigin(event.origin)) {
      console.warn(`收到来自未授权源的消息: ${event.origin}`);
      return;
    }
    
    // 验证消息格式
    const message = event.data;
    if (!message || !message.type || message.source !== 'webpage') {
      return;
    }
    
    callback(message, event.origin);
  };
  
  window.addEventListener('message', messageHandler);
  
  // 返回清理函数
  return () => window.removeEventListener('message', messageHandler);
};

/**
 * 监听来自扩展其他部分的消息
 * @param callback 回调函数
 */
export const listenToExtensionMessages = (callback: (message: ExtensionMessage, sender: chrome.runtime.MessageSender) => boolean | void): () => void => {
  const messageHandler = (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    // 验证消息格式
    if (!message || !message.type) {
      return false;
    }
    
    const result = callback(message, sender);
    if (result !== undefined) {
      return result;
    }
    return false;
  };
  
  chrome.runtime.onMessage.addListener(messageHandler);
  
  // 返回清理函数
  return () => chrome.runtime.onMessage.removeListener(messageHandler);
};

/**
 * 创建与外部Vue2应用的通信桥接
 * 用于在content-script中初始化通信
 */
export const initCommunicationBridge = (): void => {
  // 监听来自网页的消息
  listenToWebpageMessages((message, origin) => {
    console.log(`收到来自 ${origin} 的消息:`, message);
    
    // 根据消息类型处理
    switch (message.type) {
      case MessageType.LOGIN_REQUEST:
        // 处理登录请求
        handleLoginRequest(message.payload);
        break;
        
      case MessageType.USER_INFO_REQUEST:
        // 处理获取用户信息请求
        handleUserInfoRequest();
        break;
        
      case MessageType.LOGOUT:
        // 处理登出请求
        handleLogoutRequest();
        break;
        
      case MessageType.SHOW_EXTENSION:
        // 显示扩展UI
        window.postMessage('show-iframe', '*');
        break;
        
      case MessageType.HIDE_EXTENSION:
        // 隐藏扩展UI
        window.postMessage('minimize-iframe', '*');
        break;

      case MessageType.CHECK_EXTENSION_INSTALLED:
        // 检查扩展是否已安装
        sendMessageToWebpage({
          type: MessageType.CHECK_EXTENSION_INSTALLED,
          payload: { installed: true }
        });
        break;
        
      default:
        // 转发消息到扩展其他部分
        chrome.runtime.sendMessage(message);
        break;
    }
  });
};

/**
 * 处理登录请求
 * @param userData 用户数据
 */
async function handleLoginRequest(userData: any): Promise<void> {
  try {
    // 存储用户信息
    await chrome.storage.local.set({
      [AUTH_CONFIG.USER_INFO_KEY]: userData,
      'isLoggedIn': true
    });
    
    // 通知扩展其他部分登录成功
    chrome.runtime.sendMessage({
      type: MessageType.LOGIN_SUCCESS,
      payload: userData,
      source: 'extension',
      timestamp: Date.now()
    });
    
    // 通知网页登录成功
    sendMessageToWebpage({
      type: MessageType.LOGIN_SUCCESS,
      payload: { success: true }
    });
  } catch (error) {
    console.error('处理登录请求失败:', error);
    
    // 通知网页登录失败
    sendMessageToWebpage({
      type: MessageType.LOGIN_FAILURE,
      payload: { error: '登录处理失败' }
    });
  }
}

/**
 * 处理获取用户信息请求
 */
async function handleUserInfoRequest(): Promise<void> {
  try {
    // 从存储中获取用户信息
    const result = await chrome.storage.local.get([AUTH_CONFIG.USER_INFO_KEY, 'isLoggedIn']);
    const userInfo = result[AUTH_CONFIG.USER_INFO_KEY];
    const isLoggedIn = result.isLoggedIn || false;
    
    // 响应用户信息请求
    sendMessageToWebpage({
      type: MessageType.USER_INFO_RESPONSE,
      payload: {
        userInfo,
        isLoggedIn
      }
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    
    // 通知网页获取用户信息失败
    sendMessageToWebpage({
      type: MessageType.ERROR,
      payload: { error: '获取用户信息失败' }
    });
  }
}

/**
 * 处理登出请求
 */
async function handleLogoutRequest(): Promise<void> {
  try {
    // 清除存储的用户信息和登录状态
    await chrome.storage.local.set({
      [AUTH_CONFIG.USER_INFO_KEY]: null,
      'isLoggedIn': false
    });
    
    // 通知扩展其他部分登出成功
    chrome.runtime.sendMessage({
      type: MessageType.LOGOUT,
      source: 'extension',
      timestamp: Date.now()
    });
    
    // 通知网页登出成功
    sendMessageToWebpage({
      type: MessageType.NOTIFICATION,
      payload: { message: '已成功登出' }
    });
  } catch (error) {
    console.error('处理登出请求失败:', error);
    
    // 通知网页登出失败
    sendMessageToWebpage({
      type: MessageType.ERROR,
      payload: { error: '登出处理失败' }
    });
  }
}