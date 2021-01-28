<template>
  <div class="form">
    <div class="form__container">
      <div class="form__top-buttons" v-if="this.path !== '/new-room'">
        <router-link
          to="/login"
          :class="[
            'form__button',
            'form__button--half-width',
            this.path === '/login' ? 'form__button--disabled' : '',
          ]"
        >
          Вход
        </router-link>

        <router-link
          to="/sign-up"
          :class="[
            'form__button',
            'form__button--half-width',
            this.path === '/sign-up' ? 'form__button--disabled' : '',
          ]"
        >
          Регистрация
        </router-link>
      </div>

      <form @submit.prevent="submit">
        <h1 class="form__head">
          {{ titles[this.path] }}
        </h1>

        <div class="form__divider"></div>
        <div class="form__input">
          <label for="name">
            {{ this.path === "/new-room" ? "Название чата" : "Ваше имя" }}
          </label>
          <input
            class="form__input-field"
            type="text"
            name="name"
            required
            v-model="name"
          />

          <p class="form__error" v-show="errors.name">{{ errors.name }}</p>
        </div>

        <div class="form__toggle" v-if="this.path === '/new-room'">
          <ul>
            <li>Приватный</li>
            <li>
              <label for="">
                <input type="checkbox" v-model="privated" />
                <span class="form__slider"></span>
              </label>
            </li>
            <li>Общий</li>
          </ul>
        </div>

        <template v-if="this.path !== '/new-room' || privated">
          <div class="form__input">
            <label for="password">
              {{
                this.path === "/new-room" ? "Пароль для входа в чат" : "Пароль"
              }}
            </label>
            <PasswordInput
              name="password"
              :value="password"
              @passwordInput="(value) => (this.password = value)"
            />

            <p class="form__error" v-show="errors.password">
              {{ errors.password }}
            </p>
          </div>

          <div class="form__input" v-if="this.path !== '/login'">
            <label for="confirmPassword">Подтвердите пароль</label>
            <PasswordInput
              name="confirmPassword"
              :value="confirmPassword"
              @passwordInput="(value) => (this.confirmPassword = value)"
            />

            <p class="form__error" v-show="errors.confirmPassword">
              {{ errors.confirmPassword }}
            </p>
          </div>
        </template>

        <button
          type="submit"
          class="form__button form__button--full-width"
          :disabled="submitButtonState"
        >
          {{ buttonLabels[this.path] }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import PasswordInput from "./PasswordInput.vue";

export default {
  data() {
    return {
      name: "",
      privated: false,
      password: "",
      confirmPassword: "",
      submitButtonState: true,
      errors: {
        name: "",
        password: "",
        confirmPassword: "",
      },
      titles: {
        "/login": "Вход в систему",
        "/sign-up": "Регистрация",
        "/new-room": "Создание нового чата",
      },
      buttonLabels: {
        "/login": "Войти",
        "/sign-up": "Зарегистрироваться",
        "/new-room": "Создать",
      },
    };
  },
  components: {
    PasswordInput,
  },
  methods: {
    //кнопка отправки формы активируется только при правильном заполнении всех полей
    checkForm() {
      if (this.path === "/new-room" && !this.privated) {
        if (this.name && !this.errors.name) {
          this.submitButtonState = false;
        } else {
          this.submitButtonState = true;
        }
      } else if (this.path === "/login") {
        if (this.name && this.password) {
          this.submitButtonState = false;
        } else {
          this.submitButtonState = true;
        }
      } else {
        if (
          this.name &&
          this.password &&
          this.confirmPassword &&
          !this.errors.name &&
          !this.errors.password &&
          !this.errors.confirmPassword
        ) {
          this.submitButtonState = false;
        } else {
          this.submitButtonState = true;
        }
      }
    },

    //шаблон подключения к серверу
    connectToServer(url, form, resCallback) {
      axios
        .post(url, form)
        .then((response) => {
          resCallback(response);
        })
        .catch((err) => {
          if (err.response.status === 401) {
            this.errors.name = "Неверное имя пользователя или пароль";
          } else {
            this.errors.name = "Сервер не отвечает";
          }
        });
    },

    //проверка доступности имени пользователя/чата на сервере
    checkName(url, nameObj, error) {
      this.connectToServer(url, nameObj, (response) => {
        if (response.data.status === "success") {
          this.errors.name = "";
        } else if (response.data.status === "failed") {
          this.errors.name = error;
          this.checkForm();
        }
      });
    },

    //отправка формы
    submit() {
      if (this.path === "/login") {
        this.authUser("/api/user/login", {
          username: this.name,
          password: this.password,
        });
      }

      if (this.path === "/sign-up") {
        this.authUser("/api/user/register", {
          username: this.name,
          password: this.password,
        });
      }

      if (this.path === "/new-room") {
        this.connectToServer(
          "/api/room/new",
          {
            name: this.name,
            password: this.privated ? this.password : "",
            private: this.privated,
            slug: this.slugify(this.name),
          },
          () => {
            this.$router.push({ name: "Home" });
          }
        );
      }
    },

    //регистрация/вход пользователя в систему
    authUser(url, form) {
      this.connectToServer(url, form, (response) => {
        sessionStorage.username = response.data.user.username;
        sessionStorage.token = response.data.token;
        this.$router.push({ name: "Home" });
      });
    },

    //создаем слаг из названия чата
    slugify(name) {
      let slug = name.toLowerCase().split(" ").join("-");
      return slug;
    },
  },
  computed: {
    path() {
      return this.$route.path;
    },
  },
  watch: {
    //проверяем имя пользователя/чата на соответствие требованиям
    //при несоответствии выдаем ошибку
    //на странице регистрации сразу проверяем, что имя пользователя/чата свободно
    name() {
      if (this.path !== "/login") {
        if (this.name.length > 0 && this.name.length < 5) {
          this.errors.name = "Должно содержать не менее 5 символов";
          this.checkForm();
        } else if (this.name.length > 15) {
          this.errors.name = "Должно содержать не более 15 символов";
          this.checkForm();
        } else if (this.name.match(/[@#$%^?&*)(+="/|:;\\]/g)) {
          this.errors.name = "Не может содержать специальные символы";
        } else {
          this.errors.name = "";
          this.checkForm();
          if (this.path === "/sign-up") {
            this.checkName(
              "/api/user/name",
              {
                username: this.name,
              },
              "Имя пользователя уже занято"
            );
          }
          if (this.path === "/new-room") {
            this.checkName(
              "/api/room/name",
              {
                name: this.name,
              },
              "Такой чат уже существует"
            );
          }
        }
      } else {
        this.errors.name = "";
        this.checkForm();
      }
    },

    //проверяем пароль на соответствие требованиям
    //проверяем совпадение обоих паролей в форме регистрации
    //при несоответствии выдаем ошибку
    password() {
      if (this.path !== "/login") {
        if (this.password.length > 0 && this.password.length < 8) {
          this.errors.password = "Пароль должен содержать не менее 8 символов";
          this.checkForm();
        } else {
          this.errors.password = "";
          this.checkForm();
        }
        if (
          this.confirmPassword.length > 0 &&
          this.password !== this.confirmPassword
        ) {
          this.errors.confirmPassword = "Пароли не совпадают";
          this.checkForm();
        } else {
          this.errors.confirmPassword = "";
          this.checkForm();
        }
      } else {
        this.errors.name = "";
        this.checkForm();
      }
    },
    confirmPassword() {
      if (this.path !== "/login") {
        if (
          this.confirmPassword.length > 0 &&
          this.password !== this.confirmPassword
        ) {
          this.errors.confirmPassword = "Пароли не совпадают";
          this.checkForm();
        } else {
          this.errors.confirmPassword = "";
          this.checkForm();
        }
      } else {
        this.checkForm();
      }
    },
    privated() {
      this.checkForm();
    },
    //сбрасываем форму при переходе на другую страницу
    $route() {
      this.name = "";
      this.password = "";
      this.confirmPassword = "";
      this.errors = {
        name: "",
        password: "",
        confirmPassword: "",
      };
    },
  },
};
</script>