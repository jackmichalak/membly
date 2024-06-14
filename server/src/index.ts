import dotenv from 'dotenv'
dotenv.config();

import Router from './router'

(async () => {
  try {
    new Router().start()
  } catch (e) {
    console.warn("Top-level error in router", e)
  }
})()
