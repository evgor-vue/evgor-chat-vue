import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import io from "socket.io-client";
import axios from "axios";

Vue.config.productionTip = false;

axios.interceptors.request.use(function(config) {
  const token = sessionStorage.token;
  if (token) config.headers.Authorization = token;
  return config;
});

axios.interceptors.request.use(function (config) {
  if (sessionStorage.token) {
    const token = sessionStorage.token.split(" ")[1];
    const payload = JSON.parse(atob(token.split(".")[1]));

    if (payload.exp > Date.now() / 1000) {
      config.headers.Authorization = sessionStorage.token;
    } else {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("username");
      router.push({
        name: "Enter", params: {
          err: "Время сеанса истекло. Войдите в систему повторно"
        }
      });
    }
  }
  return config;
});

const SOCKET_ENDPOINT = "/";
const socket = io(SOCKET_ENDPOINT);
store.dispatch("addSocket", socket);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
