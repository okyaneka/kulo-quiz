import type { Middleware } from '~/composables/types/interfaces'

const _default: Middleware = async (to) => {
  if (to.name)
    document.title = to.meta.name
      ? to.meta.name + ' - ' + import.meta.env.VITE_APP_NAME
      : import.meta.env.VITE_APP_NAME
}

export default _default
