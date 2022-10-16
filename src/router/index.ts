import { createRouter, createWebHistory } from 'vue-router'

import { setupLayouts } from 'virtual:generated-layouts'
import generatedRoutes from 'virtual:generated-pages'
import middlewares from './middlewares'

const routes = setupLayouts(generatedRoutes)
const history = createWebHistory(import.meta.env.BASE_URL)

const router = createRouter({ routes, history })

router.beforeEach(async (to, from, next) => {
  let guard = undefined
  for (let i = 0; i < middlewares.length; i++) {
    guard = await middlewares[i](to, from, next)

    if (guard) return guard()
  }
  return next()
})

export default router
