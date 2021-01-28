<template>
  <section class="msg-form">
    <textarea
      ref="messageInput"
      name=""
      rows="3"
      placeholder="Введите свое сообщение"
      v-model="message"
      @keyup.enter="submit"
      @keyup="$emit('typing')"
    ></textarea>
    <button
      class="msg-form__emoji-button"
      @click="emojisWindow = !emojisWindow"
    >
      <img src="../assets/emoji/slightly-smiling-face.png" />
    </button>
    <button class="msg-form__submit-button" @click="submit">
      <i class="fa fa-paper-plane"></i>
    </button>

    <template v-if="emojisWindow">
      <ul class="emojis">
        <li v-for="(emoji, index) in emojis" :key="index">
          <button class="emoji" @click="addEmoji(index)">
            <img :src="require(`../assets/emoji/${emoji.name}.png`)" />
          </button>
        </li>
      </ul>
      <button
        class="emojis__close"
        @click="
          emojisWindow = !emojisWindow;
          $refs.messageInput.focus();
        "
      >
        <span>X</span>
      </button>
    </template>
  </section>
</template>

<script>
import emojis from "../utils/emojis";

export default {
  data() {
    return {
      message: "",
      emojisWindow: false,
      emojis,
    };
  },
  methods: {
    //отправка сообщения в чат через родительский компонент
    submit() {
      if (this.message.trim().length > 0) {
        this.emojisWindow = false;
        this.$emit("msgSubmit", this.message);
        this.message = "";
      }
    },

    //добавление смайла в текст сообщения
    //и закрытие окна с набором смайлов
    addEmoji(i) {
      this.message = this.message + " " + emojis[i]["symbol"] + " ";
      this.emojisWindow = false;
      this.$refs.messageInput.focus();
    },
  },
};
</script>