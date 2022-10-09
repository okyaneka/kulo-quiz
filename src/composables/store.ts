export const useNotfoundStore = defineStore('notfound-guard', () => {
  const isNotFound = ref(false)

  return { isNotFound }
})
