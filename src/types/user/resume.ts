import { defineStore } from 'pinia'

interface ResumeInfo {
  name: string
  email: string
  phone: string
  education: string
  experience: string
  file?: File
}

export const useResumeStore = defineStore('resume', {
  state: () => ({
    resumeInfo: null as ResumeInfo | null,
  }),

  actions: {
    /**
     * 保存简历信息
     * @param {ResumeInfo} data - 简历信息
     */
    async saveResume(data: ResumeInfo) {
      try {
        // 这里可以添加与后端API的交互逻辑
        // 示例：将文件转换为 FormData
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
          if (value instanceof File) {
            formData.append(key, value)
          } else {
            formData.append(key, String(value))
          }
        })

        // TODO: 调用后端API上传数据
        // const response = await fetch('/api/resume/upload', {
        //   method: 'POST',
        //   body: formData
        // })

        // 临时模拟上传成功
        this.resumeInfo = data
        return true
      } catch (error) {
        console.error('保存简历失败：', error)
        throw error
      }
    },

    /**
     * 清除简历信息
     */
    clearResume() {
      this.resumeInfo = null
    }
  }
}) 