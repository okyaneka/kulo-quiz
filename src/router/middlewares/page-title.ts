import type { Middleware } from '~/composables/types/interfaces'

const _default: Middleware = async (to) => {
  if (to.name) setDocTitle(to.meta.name as string)
}

export default _default
