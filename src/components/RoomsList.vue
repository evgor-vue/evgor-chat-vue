<template>
  <div class="container">
    <div class="rooms">
      <section class="search">
        <div class="search__box">
          <input
            type="text"
            name="search"
            id=""
            placeholder="Искать чат"
            v-model="search"
            @input="searchRoom"
          />

          <button
            v-if="search"
            class="search__stop"
            @click="
              search = '';
              roomsList = rooms;
            "
          >
            X
          </button>

          <button
            class="search__sort-icon"
            @click="sortDisplay = !sortDisplay"
            data-desc="Сортировать"
          >
            <i class="fa fa-sort-amount-up"></i>
          </button>

          <ul v-if="sortDisplay" class="search__sort-container">
            <li class="search__sort-item" @click="sort('default')">
              <span>По умолчанию</span>
            </li>
            <li class="search__sort-item" @click="sort('members')">
              <span>По количеству участников</span>
            </li>
            <li class="search__sort-item" @click="sort('messages')">
              <span>По количеству сообщений</span>
            </li>
            <li class="search__sort-item" @click="sort('private')">
              <span>По типу чата</span>
            </li>
          </ul>
        </div>
      </section>
      <section class="rooms__list">
        <ul>
          <li v-for="room in roomsList" :key="room.id">
            <a :href="`/${room.slug}`" @click.prevent="clickRoom(room)">
              <Room :room="room" />
            </a>
          </li>
        </ul>
      </section>
      <section class="rooms__button">
        <router-link
          to="/new-room"
          class="form__button form__button--full-width"
        >
          Создать новый чат
        </router-link>
      </section>
    </div>

    <div class="rooms__error" v-show="error && !clickedRoom">
      <span>{{ error }}</span>
    </div>

    <div class="pop-up" v-if="clickedRoom">
      <div class="pop-up__container">
        <span class="form__head">Доступ в этот чат защищен паролем</span>
        <div class="form__divider"></div>
        <div class="form__input">
          <label htmlFor="password">Пароль для входа в чат</label>
          <PasswordInput
            name="password"
            :value="password"
            @passwordInput="(value) => (this.password = value)"
            @enter="enterPrivateRoom"
          />

          <p class="form__error" v-show="error">{{ error }}</p>
        </div>
        <button
          class="pop-up__close"
          @click="
            clickedRoom = null;
            password = '';
          "
        >
          <span>X</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import PasswordInput from "./PasswordInput";
import Room from "./Room";

import axios from "axios";
import { mapState, mapActions } from "vuex";

export default {
  data() {
    return {
      sortDisplay: false,
      search: "",
      roomsList: [],
      clickedRoom: null,
      password: "",
    };
  },
  components: {
    PasswordInput,
    Room,
  },
  props: {
    error: String,
  },
  created() {
    //если пользователь был перенаправлен на страницу из-за возникшей ошибки,
    //сбросит ошибку после отображения
    if (this.error) setTimeout(() => (this.error = ""), 5000);

    //получаем список чатов и подписываемся на его обновление
    axios
      .get("/api/room/")
      .then((res) => {
        this.addRooms(res.data.rooms);
        this.roomsList = res.data.rooms;
      })
      .catch(() => {
        this.error = "Сервер не отвечает";
      });
    this.socket.on("rooms-list", (data) => {
      this.addRooms(data);
      this.roomsList = this.rooms;
    });
  },
  beforeDestroy: function () {
    //отписка от обновлений списка чатов
    this.socket.removeListener("rooms-list");
  },
  computed: mapState(["rooms", "socket"]),
  watch: {
    //сброс сообщения о неверном пароле при вводе нового пароля
    password() {
      this.error = "";
    },
  },
  methods: {
    ...mapActions(["addRooms"]),

    //поиск по списку чатов
    searchRoom() {
      this.roomsList = this.rooms.filter((room) =>
        room.name.toLowerCase().match(this.search.trim().toLowerCase())
      );
    },

    //проверка типа чата
    //если чат общий, переход на страницу с окном этого чата
    //если чат приватный, вызов всплывающего окна с формой ввода пароля
    clickRoom(room) {
      if (room.private) {
        this.clickedRoom = room;
      } else {
        this.$router.push({
          name: "ChatRoom",
          params: {
            slug: room.slug,
          },
        });
      }
    },
    //передача пароля от приватного чата на сервер и обработка возможных ошибок
    enterPrivateRoom() {
      if (this.password.length > 0) {
        axios
          .post(`/api/room/${this.clickedRoom.slug}`, {
            password: this.password,
          })
          .then((response) => {
            if (response.data.status === "success") {
              this.$router.push({
                name: "ChatRoom",
                params: {
                  slug: this.clickedRoom.slug,
                },
              });
              this.clickedRoom = null;
            } else if (response.data.status === "failed") {
              this.error = response.data.error;
            }
          })
          .catch((err) => {
            if (err.response.status === 401) this.error = "Неверный пароль";
            else this.error = "Сервер не отвечает";
          });
      }
    },
    //сортировка списка чатов по указанному критерию
    //закрытие всплывающего окна с вариантами сортировки
    sort(type) {
      if (type === "default") this.roomsList = this.rooms;
      else if (type === "private") {
        let privated = [];
        let opened = [];
        this.rooms.forEach((room) => {
          if (room.private) privated.push(room);
          else opened.push(room);
        });
        this.roomsList = [...opened, ...privated];
      } else {
        const quickSort = (array) => {
          if (array.length < 2) {
            return array;
          }
          const chosenIndex = array.length - 1;
          const chosen = array[chosenIndex];
          const a = [];
          const b = [];
          for (let i = 0; i < chosenIndex; i++) {
            const temp = array[i];
            temp[type] > chosen[type] ? a.push(temp) : b.push(temp);
          }

          const output = [...quickSort(a), chosen, ...quickSort(b)];
          return output;
        };

        this.roomsList = quickSort(this.roomsList);
      }
      this.sortDisplay = false;
    },
  },
};
</script>