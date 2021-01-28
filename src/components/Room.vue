<template>

  <div class="room">
    <div class="room__name">
      <span>{{ room.name }}</span>
    </div>
    <div class="room__details">
      <span class="room__members">
        <i class="fas fa-users"></i> {{ room.members }}
      </span>

      <span class="room__messages">
        <i class="fas fa-comment"></i> {{ room.messages }}
      </span>

      <span class="room__access">
        <i :class="['fa', room.private ? 'fa-user-lock' : 'fa-lock-open']"></i>
        {{ room.private ? "  Закрытый" : "  Общий" }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    room: Object,
  },
};
</script>