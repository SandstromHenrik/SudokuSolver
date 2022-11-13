import { createApp } from "vue";
import App from "./App.vue";

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

import constants from './helpers/constants'

const app = createApp(App)

app.config.globalProperties.$const = constants

app.mount("#app")
