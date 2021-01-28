<template>
  <div class="form">
    <div class="form__container">
      <h1 class="form__head">
        Доступ только для зарегистрированных пользователей
      </h1>
      <p class="form__error" v-if="err">{{ err }}</p>
      <div class="form__button-wrapper">
        <router-link to="/login" class="form__button form__button--half-width">
          Вход
        </router-link>
      </div>
      <div class="form__divider">
        <span>или</span>
      </div>
      <div class=" form__button-wrapper">
        <router-link
          to="/sign-up"
          class="form__button form__button--half-width"
        >
          Регистрация
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
    props: {
    err: String,
  },
}
</script>