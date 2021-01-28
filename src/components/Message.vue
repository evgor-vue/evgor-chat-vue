<template>
  <li class="msg">
    <div
      v-if="message.type === 'message'"
      :class="[
        'msg__message',
        message.author.username === user ? 'msg__message--mine' : '',
      ]"
    >
      <div
        class="msg__author"
        :style="[
          message.author.username !== user
            ? userAvatar(message.author.username)
            : '',
        ]"
      >
        <span>
          {{ message.author.username.charAt(0).toUpperCase() }}
        </span>

        <div class="msg__author-name" v-if="message.author.username !== user">
          {{ message.author.username }}
        </div>

        <div
          :class="[
            'msg__author-status',
            members.includes(message.author.username)
              ? 'msg__author-status--online'
              : 'msg__author-status--offline',
          ]"
        ></div>
      </div>
      <div class="msg__body">
        <div
          :class="
            message.author.username === user ? 'msg__text--mine' : 'msg__text'
          "
        >
          <span v-html="showEmojis(message.text)"></span>
        </div>
        <div class="msg__time">
          <span>{{ beautifyDate(message.createdAt) }}</span>
        </div>
      </div>
    </div>

    <div
      class="msg__notification"
      v-if="message.type === 'join' || message.type === 'leave'"
    >
      <span>
        {{ message.user }}
        {{ message.type === "join" ? " входит в " : " покидает " }}
        чат
      </span>
    </div>
  </li>
</template>

<script>
import { mapState } from "vuex";
import emojis from "../utils/emojis";
import beautifyDate from "../utils/beautifyDate";

export default {
  props: {
    message: Object,
    user: String,
  },

  computed: {
    ...mapState(["members"]),
  },
  methods: {
    beautifyDate,
    //назначаем цвет для аватара пользователя
    userAvatar(author) {
      const color = [
        "#3399ff",
        "#00ffff",
        "#ffcc00",
        "#99ff33",
        "#009900",
        "#0066ff",
        "#cc0066",
        "#ff0066",
        "#6600ff",
        "#00cc66",
      ];
      let hash = 0;
      for (let symbol of author) {
        hash += symbol.charCodeAt(0);
      }
      hash = hash % 10;
      return { "background-color": color[hash] };
    },

    //отображение изображений смайлов в тексте сообщения
    showEmojis(message) {
      emojis.forEach((emoji) => {
        let re = new RegExp(emoji.symbol, "g");
        message = message.replace(
          re,
          `<img src="${require("../assets/emoji/" +
            emoji.name +
            ".png")}" class='msg__smile'/>`
        );
      });
      return message;
    },
  },
};
</script>