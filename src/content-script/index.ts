// This import scss file is used to style the iframe that is injected into the page
import "./index.scss"

const src = chrome.runtime.getURL("src/ui/content-script-iframe/index.html")

// 创建 iframe
const iframe = new DOMParser().parseFromString(
  `<iframe class="crx-iframe" src="${src}"></iframe>`,
  "text/html",
).body.firstElementChild as HTMLIFrameElement

if (iframe) {
  // 创建悬浮球
  const floatingBall = document.createElement('div')
  floatingBall.className = 'crx-floating-ball'
  
  // 创建悬浮球图标
  const ballIcon = document.createElement('div')
  ballIcon.className = 'ball-icon'
  ballIcon.innerHTML = '+'
  floatingBall.appendChild(ballIcon)
  
  // 创建菜单
  const menu = document.createElement('div')
  menu.className = 'crx-menu'
  
  // 菜单项配置
  const menuItems = [
    { icon: '📄', text: '显示窗口', action: 'show-window' },
    { icon: '⚙️', text: '设置', action: 'settings' },
    { icon: '❓', text: '帮助', action: 'help' }
  ]
  
  // 创建菜单项
  menuItems.forEach(item => {
    const menuItem = document.createElement('div')
    menuItem.className = 'menu-item'
    menuItem.innerHTML = `
      <div class="item-icon">${item.icon}</div>
      <div class="item-text">${item.text}</div>
    `
    menuItem.addEventListener('click', () => handleMenuClick(item.action))
    menu.appendChild(menuItem)
  })
  
  // 添加到页面
  document.body.appendChild(floatingBall)
  document.body.appendChild(menu)
  document.body.appendChild(iframe)
  
  // 状态变量
  let isDragging = false
  let currentX = window.innerWidth - 70
  let currentY = 100
  let initialX = 0
  let initialY = 0
  let isMenuVisible = false
  
  // 更新位置函数
  const updatePosition = (x: number, y: number) => {
    // 更新悬浮球位置
    floatingBall.style.left = `${x}px`
    floatingBall.style.top = `${y}px`
    
    // 更新菜单位置
    menu.style.left = `${x - 150}px`
    menu.style.top = `${y}px`
    
    // 更新iframe位置（如果显示的话）
    if (iframe.classList.contains('visible')) {
      iframe.style.left = `${x - 200}px`
      iframe.style.top = `${y}px`
    }
  }
  
  // 初始化位置
  updatePosition(currentX, currentY)
  
  // 处理菜单点击
  const handleMenuClick = (action: string) => {
    switch (action) {
      case 'show-window':
        showIframe()
        toggleMenu(false)
        break
      case 'settings':
        // 处理设置
        console.log('打开设置')
        break
      case 'help':
        // 处理帮助
        console.log('打开帮助')
        break
    }
  }
  
  // 显示iframe
  const showIframe = () => {
    iframe.classList.add('visible')
    floatingBall.style.opacity = '0'
    floatingBall.style.pointerEvents = 'none'
  }
  
  // 隐藏iframe
  const hideIframe = () => {
    iframe.classList.remove('visible')
    floatingBall.style.opacity = '1'
    floatingBall.style.pointerEvents = 'auto'
  }
  
  // 切换菜单显示状态
  const toggleMenu = (show?: boolean) => {
    isMenuVisible = show !== undefined ? show : !isMenuVisible
    menu.classList.toggle('visible', isMenuVisible)
    ballIcon.innerHTML = isMenuVisible ? '×' : '+'
  }
  
  // 添加拖拽处理
  floatingBall.addEventListener('mousedown', (e: MouseEvent) => {
    isDragging = true
    initialX = e.clientX - currentX
    initialY = e.clientY - currentY
    
    floatingBall.style.cursor = 'grabbing'
  })
  
  document.addEventListener('mousemove', (e: MouseEvent) => {
    if (isDragging) {
      e.preventDefault()
      
      currentX = e.clientX - initialX
      currentY = e.clientY - initialY
      
      // 确保不超出屏幕边界
      currentX = Math.max(0, Math.min(currentX, window.innerWidth - floatingBall.offsetWidth))
      currentY = Math.max(0, Math.min(currentY, window.innerHeight - floatingBall.offsetHeight))
      
      updatePosition(currentX, currentY)
    }
  })
  
  document.addEventListener('mouseup', () => {
    isDragging = false
    floatingBall.style.cursor = 'move'
  })
  
  // 点击悬浮球显示/隐藏菜单
  floatingBall.addEventListener('click', (e: MouseEvent) => {
    if (!isDragging) {
      e.stopPropagation()
      toggleMenu()
    }
  })
  
  // 点击其他区域关闭菜单
  document.addEventListener('click', () => {
    if (isMenuVisible) {
      toggleMenu(false)
    }
  })
  
  // 监听 iframe 发来的消息
  window.addEventListener('message', (event) => {
    if (event.data === 'minimize-iframe') {
      hideIframe()
    }
  })
}

// 错误处理
self.onerror = function (message, source, lineno, colno, error) {
  console.info("Error: " + message)
  console.info("Source: " + source)
  console.info("Line: " + lineno)
  console.info("Column: " + colno)
  console.info("Error object: " + error)
}

console.info("hello world from content-script")