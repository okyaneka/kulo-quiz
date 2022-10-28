import * as Sentry from '@sentry/vue'
import { BrowserTracing } from '@sentry/tracing'
import type { Vue } from '@sentry/vue/types/types'
import type { Router } from 'vue-router'

export default function (app: Vue, router: Router) {
  Sentry.init({
    app,
    dsn: 'https://94e40bccf8ac4ec595e2734551ed6cab@o4503963817345024.ingest.sentry.io/4503963822784512',
    integrations: [
      new BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router),
        tracingOrigins: ['kulo-quiz.web.app', 'quiz.kulooky.my.id', /^\//],
      }),
    ],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  })
}
