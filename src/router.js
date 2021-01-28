import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "Home",
      component: () => import("./components/RoomsList.vue"),
      props: true
    },

    {
      path: "/enter",
      name: "Enter",
      component: () => import("./components/Enter.vue"),
      props: true
    },

    {
      path: "/sign-up",
      name: "SignUp",
      component: () => import("./components/Form.vue"),
    },

    {
      path: "/login",
      name: "Login",
      component: () => import("./components/Form.vue"),
    },

    {
      path: "/new-room",
      name: "NewRoom",
      component: () => import("./components/Form.vue"),
    },

    {
      path: "/room/:slug",
      name: "ChatRoom",
      component: () => import("./components/Chat.vue"),
      props: true
    },
  ],
});
