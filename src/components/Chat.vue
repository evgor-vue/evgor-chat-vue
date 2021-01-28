<template>
  <div class="chat">
    <section class="chat__head" v-if="room">
      <div class="chat__name">
        <span>{{ room.name }}</span>
      </div>
      <div class="chat__info">
        <span>
          <i class="fa fa-users"></i>
          {{ members.length }} / <i class="fa fa-comment"></i>
          {{ getMessagesCount }}
        </span>
      </div>
    </section>
    <section class="chat__messages" ref="messages">
      <ul>
        <Message
          v-for="message in messages"
          :key="message._id"
          :message="message"
          :user="username"
        />
      </ul>
    </section>
    <div class="typing__wrapper" v-show="typing.action">
      <div class="typing__event">
        <span>{{ typing.user }} печатает</span>
      </div>
    </div>
    <MessageInput @msgSubmit="msgSubmit" @typing="onTyping" />
  </div>
</template>

<script>
import Message from "./Message";
import MessageInput from "./MessageInput";

import { mapState, mapActions, mapGetters } from "vuex";

export default {
  data() {
    return {
      typing: {
        action: false,
        user: "",
      },
      username: "",
    };
  },
  props: {
    slug: String,
  },
  components: {
    Message,
    MessageInput,
  },
  created() {
    const conn_sound = new Audio(require("../assets/sounds/connect.mp3"));
    const typing_sound = new Audio(require("../assets/sounds/typing.mp3"));
    const msg_sound = new Audio(require("../assets/sounds/message.mp3"));
    this.username = sessionStorage.username;

    //подписываемся на чат
    this.socket.emit("user-join", {
      type: "join",
      room: this.slug,
      token: sessionStorage.token,
    });

    //переподписка на чат в случае потери связи
    this.socket.on("reconnect", () => {
      this.socket.emit("user-join", {
        type: "join",
        room: this.$route.params.slug,
        token: sessionStorage.token,
      });
    });

    //сообщаем о выходе при закрытии браузера
    window.addEventListener("unload", () => {
      this.socket.emit("user-leave", {
        type: "leave",
        user: this.username,
        room: this.$route.params.slug,
      });
    });

    //в случае неудачной аутентификации возвращаем
    //пользователя на страницу регистрации/входа в систему
    this.socket.on("expired", () => {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("username");
      this.$router.push({
        name: "Enter",
        params: {
          err: "Время сеанса истекло. Войдите в систему повторно",
        },
      });
    });

    //при попытке получить доступ к закрытому чату без пароля
    //возвращаем на страницу со списком чатов
    this.socket.on("access-denied", () => {
      this.$router.push({
        name: "Home",
        params: {
          error: "Вход в этот чат защищен паролем",
        },
      });
    });

    //получаем список всех сообщений в чате
    this.socket.on("welcome", (data) => {
      this.addRoomData(data);
    });

    //при получении нового сообщения обновляем список и счетчик сообщений
    this.socket.on("message-broadcast", (data) => {
      this.addMessage(data);
      msg_sound.play();
    });

    //при входе нового пользователя в чат обновляем список участников
    //и добавляем соответствующее сообщение
    this.socket.on("user-join", (data) => {
      this.addMessage(data.message);
      this.updateMembers(data.members);
      conn_sound.play();
    });

    //при выходе пользователя из чата обновляем список участников
    //и добавляем соответствующее сообщение
    this.socket.on("user-leave", (data) => {
      this.addMessage(data.message);
      this.updateMembers(data.members);
      conn_sound.play();
    });

    //показываем, что пользователь печатает
    this.socket.on("user-typing", (data) => {
      this.typing.action = true;
      this.typing.user = data.user;
      typing_sound.play();
      setTimeout(() => {
        this.typing.action = false;
        this.typing.user = "";
      }, 1000);
    });
  },
  updated() {
    //прокрутка к последним сообщениям
    this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight;
  },
  beforeDestroy() {
    //уведомляем сервер о своем выходе из чата и отписываемся от всех событий сокета
    this.socket.emit("user-leave", {
      type: "leave",
      user: this.username,
      room: this.$route.params.slug,
    });

    this.socket.removeListener("access-denied");
    this.socket.removeListener("expired");
    this.socket.removeListener("welcome");
    this.socket.removeListener("message-broadcast");
    this.socket.removeListener("user-join");
    this.socket.removeListener("user-leave");
    this.socket.removeListener("user-typing");
    this.socket.removeListener("reconnect");
    window.removeEventListener("unload", () => {
      this.socket.emit("user-leave", {
        type: "leave",
        user: this.username,
        room: this.$route.params.slug,
      });
    });
    this.roomLeave();
  },
  computed: {
    ...mapState(["socket", "messages", "members", "room"]),
    ...mapGetters(["getMessagesCount"]),
  },
  methods: {
    ...mapActions(["addMessage", "addRoomData", "updateMembers", "roomLeave"]),

    //отправка сообщения в чат
    msgSubmit(msg) {
      const msgObj = {
        message: {
          type: "message",
          author: { username: this.username },
          text: msg,
          createdAt: Date.now(),
        },
        room: this.$route.params.slug,
      };
      this.socket.emit("message", msgObj);
    },

    //уведомляем сервер, что пользователь набирает сообщение
    onTyping() {
      this.socket.emit("user-typing", {
        type: "typing",
        user: this.username,
        room: this.$route.params.slug,
      });
    },
  },
};
</script>