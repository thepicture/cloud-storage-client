<template>
  <v-snackbar :timeout="timeout" v-model="isVisible">
    <v-icon left>{{ icon }}</v-icon
    >{{ message }}
  </v-snackbar>
</template>

<script>
export default {
  name: 'vtoast',
  data() {
    return {
      isVisible: false,
      message: '',
      icon: 'mdi-check',
      timeout: 3000,
    }
  },
  methods: {
    show(data) {
      this.message = data.message || ''
      this.timer = data.timer || 2000
      this.icon = data.icon || 'mdi-check'
      this.isVisible = true
    },
  },
}
</script>
