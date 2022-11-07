import { createRouter, createWebHistory } from 'vue-router'

import { setupLayouts } from 'virtual:generated-layouts'
import generatedRoutes from 'virtual:generated-pages'

const routes = setupLayouts(generatedRoutes)
const history = createWebHistory(import.meta.env.BASE_URL)

const router = createRouter({ routes, history })

export default router
