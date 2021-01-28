import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    socket: null,
    rooms: [],
    room: null,
    messages: [],
    members: [],
  },

  getters: {
    getMessagesCount: (state) => {
      return state.messages.filter((msg) => msg.type === "message").length;
    },
  },

  mutations: {
    ADD_SOCKET: (state, payload) => {
      state.socket = payload;
    },

    ADD_ROOMS: (state, payload) => {
      state.rooms = payload;
    },

    ADD_ROOM: (state, payload) => {
      state.room = payload;
    },

    ADD_MESSAGES: (state, payload) => {
      state.messages = payload;
    },

    ADD_MEMBERS: (state, payload) => {
      state.members = payload;
    },

    ADD_MESSAGE: (state, payload) => {
      state.messages.push(payload);
    },

    RESET_ROOM: (state) => {
      state.room = null;
    },
    RESET_MESSAGES: (state) => {
      state.messages = [];
    },
    RESET_MEMBERS: (state) => {
      state.members = [];
    },
  },
  actions: {
    addSocket: (context, payload) => {
      context.commit("ADD_SOCKET", payload);
    },

    addRooms: (context, payload) => {
      context.commit("ADD_ROOMS", payload);
    },

    addRoomData: (context, payload) => {
      context.commit("ADD_ROOM", payload.room);
      context.commit("ADD_MEMBERS", payload.members);
      context.commit("ADD_MESSAGES", payload.messages);
    },

    updateMembers: (context, payload) => {
      context.commit("RESET_MEMBERS");
      context.commit("ADD_MEMBERS", payload);
    },

    addMessage: (context, payload) => {
      context.commit("ADD_MESSAGE", payload);
    },

    roomLeave: (context) => {
      context.commit("RESET_ROOM");
      context.commit("RESET_MESSAGES");
      context.commit("RESET_MEMBERS");
    },
  },
});
