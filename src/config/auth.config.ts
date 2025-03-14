/**
 * 认证相关配置
 */
export const AUTH_CONFIG = {
  /** 登录页面URL */
  // LOGIN_URL: 'http://8.133.192.113/',  // 这里替换为实际的登录页面URL
  LOGIN_URL: 'http://localhost:8080/',  // 这里替换为实际的登录页面URL

  /** token在storage中的key */
  TOKEN_KEY: 'authToken',
  
  /** 用户信息在storage中的key */
  USER_INFO_KEY: 'userInfo',
  
  /** 登录状态检查间隔(ms) */
  CHECK_INTERVAL: 3000,
  
  /** 允许与扩展通信的域名列表 */
  ALLOWED_ORIGINS: [
    'http://8.133.192.113',  // 这里需要与登录页面的域名匹配
    'http://localhost:8080'
  ],
  
  /** 通信相关配置 */
  COMMUNICATION: {
    /** 消息验证密钥，用于验证消息来源 */
    MESSAGE_SECRET: 'extension-vue2-secret-key',
    
    /** 消息超时时间(ms)，超过此时间的消息将被忽略 */
    MESSAGE_TIMEOUT: 5000,
    
    /** 是否启用严格模式，启用后将只接受指定域名的消息 */
    STRICT_MODE: true,
    
    /** 是否在控制台打印调试信息 */
    DEBUG: true
  },
  
  /** 用户同步配置 */
  USER_SYNC: {
    /** 是否自动同步用户信息 */
    AUTO_SYNC: true,
    
    /** 同步间隔(ms) */
    SYNC_INTERVAL: 30000,
    
    /** 用户信息字段映射，用于将外部应用的用户信息字段映射到扩展的用户信息字段 */
    FIELD_MAPPING: {
      username: 'name',
      email: 'email',
      avatar: 'avatar',
      role: 'role'
    }
  }
} as const