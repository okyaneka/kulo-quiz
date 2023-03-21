export const useNotfoundStore = defineStore('notfound-guard', () => {
  const isNotFound = ref(false)

  function throwNotFound() {
    isNotFound.value = true
  }

  return { isNotFound, throwNotFound }
})
