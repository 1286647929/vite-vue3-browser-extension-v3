/**
 * 浏览器扩展通信示例代码 (Vue2项目)
 * 
 * 此文件展示了如何在Vue2项目中与浏览器扩展进行通信
 * 可以复制此代码到您的Vue2项目中进行集成
 */

// 定义消息类型（与扩展中定义的保持一致）
const MessageType = {
  // 登录相关
  LOGIN_REQUEST: 'LOGIN_REQUEST',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  
  // 用户信息相关
  USER_INFO_REQUEST: 'USER_INFO_REQUEST',
  USER_INFO_RESPONSE: 'USER_INFO_RESPONSE',
  
  // 数据同步相关
  SYNC_DATA: 'SYNC_DATA',
  SYNC_RESPONSE: 'SYNC_RESPONSE',
  
  // 通用消息
  NOTIFICATION: 'NOTIFICATION',
  ERROR: 'ERROR',
  
  // 扩展控制
  SHOW_EXTENSION: 'SHOW_EXTENSION',
  HIDE_EXTENSION: 'HIDE_EXTENSION'
};

/**
 * 浏览器扩展通信工具
 * 可以在Vue2项目中使用此工具与浏览器扩展进行通信
 */
export const ExtensionCommunication = {
  // 配置
  config: {
    // 消息验证密钥，需要与扩展中的配置保持一致
    messageSecret: 'extension-vue2-secret-key',
    // 调试模式
    debug: true
  },
  
  /**
   * 初始化通信
   */
  init() {
    // 添加消息监听
    window.addEventListener('message', this._handleMessage.bind(this));
    
    if (this.config.debug) {
      console.log('浏览器扩展通信初始化完成');
    }
    
    return this;
  },
  
  /**
   * 处理来自扩展的消息
   * @param {MessageEvent} event 消息事件
   * @private
   */
  _handleMessage(event) {
    const message = event.data;
    
    // 验证消息格式
    if (!message || !message.type || message.source !== 'extension') {
      return;
    }
    
    if (this.config.debug) {
      console.log('收到扩展消息:', message);
    }
    
    // 触发对应的事件
    this._triggerEvent(message.type, message.payload);
  },
  
  /**
   * 触发事件
   * @param {string} type 事件类型
   * @param {any} data 事件数据
   * @private
   */
  _triggerEvent(type, data) {
    const event = new CustomEvent('extension:' + type, { detail: data });
    window.dispatchEvent(event);
  },
  
  /**
   * 发送消息到扩展
   * @param {string} type 消息类型
   * @param {any} payload 消息数据
   */
  sendMessage(type, payload) {
    const message = {
      type,
      payload,
      source: 'webpage',
      timestamp: Date.now()
    };
    
    if (this.config.debug) {
      console.log('发送消息到扩展:', message);
    }
    
    window.postMessage(message, '*');
  },
  
  /**
   * 监听扩展事件
   * @param {string} type 事件类型
   * @param {Function} callback 回调函数
   * @returns {Function} 移除监听器的函数
   */
  on(type, callback) {
    const eventName = 'extension:' + type;
    const handler = (event) => callback(event.detail);
    
    window.addEventListener(eventName, handler);
    
    // 返回移除监听器的函数
    return () => window.removeEventListener(eventName, handler);
  },
  
  /**
   * 请求登录
   * @param {Object} userData 用户数据
   */
  requestLogin(userData) {
    this.sendMessage(MessageType.LOGIN_REQUEST, userData);
  },
  
  /**
   * 请求登出
   */
  requestLogout() {
    this.sendMessage(MessageType.LOGOUT);
  },
  
  /**
   * 请求用户信息
   */
  requestUserInfo() {
    this.sendMessage(MessageType.USER_INFO_REQUEST);
  },
  
  /**
   * 显示扩展UI
   */
  showExtension() {
    this.sendMessage(MessageType.SHOW_EXTENSION);
  },
  
  /**
   * 隐藏扩展UI
   */
  hideExtension() {
    this.sendMessage(MessageType.HIDE_EXTENSION);
  }
};

/**
 * 在Vue2项目中使用示例
 */

/*
// 在main.js中初始化
import { ExtensionCommunication } from './extension-communication';

// 初始化通信
ExtensionCommunication.init();

// 将通信工具添加到Vue原型，方便在组件中使用
Vue.prototype.$extension = ExtensionCommunication;

// 在组件中使用
export default {
  methods: {
    // 登录并同步到扩展
    loginAndSync(userData) {
      // 本地登录逻辑...
      
      // 同步到扩展
      this.$extension.requestLogin(userData);
    },
    
    // 监听扩展消息
    setupExtensionListeners() {
      // 监听登录成功消息
      this.$extension.on(MessageType.LOGIN_SUCCESS, (data) => {
        console.log('扩展登录成功:', data);
      });
      
      // 监听用户信息响应
      this.$extension.on(MessageType.USER_INFO_RESPONSE, (data) => {
        console.log('获取到扩展用户信息:', data);
      });
    }
  },
  
  mounted() {
    this.setupExtensionListeners();
  }
};
*/