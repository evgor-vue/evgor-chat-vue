<template>
  <div>
    <input
      class="form__input-field"
      :type="eyeIconClass === 'fa fa-eye-slash' ? 'password' : 'text'"
      :name="name"
      required
      :value="value"
      @input="$emit('passwordInput', $event.target.value)"
      @keyup.enter="$emit('enter')"
    />
    <i
      :class="eyeIconClass"
      @click="
        eyeIconClass === 'fa fa-eye-slash'
          ? (eyeIconClass = 'fa fa-eye')
          : (eyeIconClass = 'fa fa-eye-slash')
      "
    ></i>
  </div>
</template>

<script>
export default {
  data() {
    return {
      eyeIconClass: "fa fa-eye-slash",
    };
  },
  props: {
    value: String,
    name: String,
    enter: { type: Function, default: null },
  },
};
</script>