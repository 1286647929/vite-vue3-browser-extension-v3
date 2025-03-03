<script setup lang="ts">
import { ref } from 'vue'
import { useResumeStore } from '../types/user/resume'

// 使用 Pinia Store
const resumeStore = useResumeStore()
const { saveResume } = resumeStore
const { resumeInfo } = storeToRefs(resumeStore)

// 基本信息
const formData = ref({
  name: '',
  email: '',
  phone: '',
  education: '',
  experience: ''
})

// 文件相关
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const previewUrl = ref('')

/**
 * 处理文件选择
 * @param {Event} event - 文件选择事件
 */
const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    selectedFile.value = input.files[0]
    // 创建文件预览URL
    previewUrl.value = URL.createObjectURL(input.files[0])
  }
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  if (!selectedFile.value) {
    alert('请选择简历文件')
    return
  }

  try {
    // 这里可以调用 Store 中的方法保存数据
    await saveResume({
      ...formData.value,
      file: selectedFile.value
    })
    alert('简历上传成功！')
  } catch (error) {
    console.error('上传失败：', error)
    alert('上传失败，请重试')
  }
}

/**
 * 重置表单
 */
const resetForm = () => {
  formData.value = {
    name: '',
    email: '',
    phone: '',
    education: '',
    experience: ''
  }
  selectedFile.value = null
  previewUrl.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<template>
  <div class="resume-upload p-6">
    <h2 class="text-2xl font-bold mb-6 text-center">简历上传</h2>

    <!-- 基本信息表单 -->
    <div class="form-control w-full max-w-md mx-auto">
      <label class="label">
        <span class="label-text">姓名</span>
      </label>
      <input
        v-model="formData.name"
        type="text"
        placeholder="请输入姓名"
        class="input input-bordered input-primary w-full"
      />

      <label class="label mt-4">
        <span class="label-text">邮箱</span>
      </label>
      <input
        v-model="formData.email"
        type="email"
        placeholder="请输入邮箱"
        class="input input-bordered input-primary w-full"
      />

      <label class="label mt-4">
        <span class="label-text">电话</span>
      </label>
      <input
        v-model="formData.phone"
        type="tel"
        placeholder="请输入电话"
        class="input input-bordered input-primary w-full"
      />

      <label class="label mt-4">
        <span class="label-text">教育背景</span>
      </label>
      <textarea
        v-model="formData.education"
        placeholder="请输入教育背景"
        class="textarea textarea-bordered textarea-primary w-full"
      />

      <label class="label mt-4">
        <span class="label-text">工作经验</span>
      </label>
      <textarea
        v-model="formData.experience"
        placeholder="请输入工作经验"
        class="textarea textarea-bordered textarea-primary w-full"
      />
    </div>

    <!-- 文件上传区域 -->
    <div class="file-upload mt-8 text-center">
      <input
        ref="fileInput"
        type="file"
        accept=".pdf,.doc,.docx"
        class="file-input file-input-bordered file-input-primary w-full max-w-md"
        @change="handleFileSelect"
      />
      <div class="text-sm text-gray-500 mt-2">
        支持的文件格式：PDF、Word文档
      </div>
    </div>

    <!-- 文件预览 -->
    <div
      v-if="selectedFile"
      class="preview mt-4 text-center"
    >
      <div class="text-sm text-primary">
        已选择文件：{{ selectedFile.name }}
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex gap-4 justify-center mt-8">
      <button
        class="btn btn-primary"
        @click="handleSubmit"
      >
        <i-ph-upload />
        上传简历
      </button>
      <button
        class="btn btn-outline"
        @click="resetForm"
      >
        <i-ph-trash />
        重置
      </button>
    </div>
  </div>
</template>

<style scoped>
.resume-upload {
  max-width: 800px;
  margin: 0 auto;
}
</style> 