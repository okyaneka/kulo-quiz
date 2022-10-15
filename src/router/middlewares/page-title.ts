import type { Middleware } from '~/composables/types/interfaces'

const _default: Middleware = async (to) => {
  if (to.name)
    document.title = to.meta.title
      ? to.meta.title + ' - ' + import.meta.env.VITE_APP_NAME
      : import.meta.env.VITE_APP_NAME
}

export default _default
