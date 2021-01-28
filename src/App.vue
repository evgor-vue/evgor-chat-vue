<template>
  <div id="app">
    <div class="wrapper">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: "",
    };
  },

  created: function () {
    //если нет JWT-токена или токен просрочен,
    //отправляем пользователя на страницу логина/регистрации
    if (sessionStorage.token) {
      const token = sessionStorage.token.split(" ")[1];
      const payload = JSON.parse(atob(token.split(".")[1]));

      if (payload.exp > Date.now() / 1000) {
        return;
      } else {
        this.$router.push({
          name: "Enter",
          params: {
            err: "Время сеанса истекло. Войдите в систему повторно",
          },
        });
      }
    } else {
      this.$router.push({ name: "Enter" });
    }
  },
};
</script>

<style lang="scss">
@import "../public/normalize.css";
@import "../public/styles.scss";
</style>
