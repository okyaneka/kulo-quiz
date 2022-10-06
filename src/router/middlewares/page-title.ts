import type { RouteLocationNormalized } from 'vue-router'

export default async function (
  to: RouteLocationNormalized
): Promise<(() => void) | void | undefined> {
  to.name
  document.title = to.meta.title
    ? to.meta.title + ' - ' + import.meta.env.VITE_APP_NAME
    : import.meta.env.VITE_APP_NAME
}
