<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <v-card>
        <v-card-title class="headline" tag="h2"> Registration </v-card-title>
        <v-card-text>
          {{ formattedError }}
          <v-form v-model="valid" ref="form">
            <v-text-field
              label="E-mail"
              v-model="email"
              autocomplete="email"
              required
              :rules="emailRules"
            ></v-text-field>
            <v-text-field
              label="Password"
              v-model="password"
              autocomplete="new-password"
              required
              :rules="passwordRules"
            ></v-text-field>
            <v-text-field
              label="Repeat password"
              v-model="repeatedPassword"
              autocomplete="new-password"
              required
              :rules="[
                (v) => !!v || 'Password must be repeated',
                (v) => v === this.password || 'Passwords must match',
              ]"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn outlined color="primary" nuxt to="/auth">Sign In</v-btn>
          <v-btn
            color="primary"
            nuxt
            type="submit"
            @click="submit"
            :disabled="!valid"
            >Create account</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import {
  EMAIL_RULES,
  REGISTRATION_PASSWORD_RULES,
  AUTH_ERRORS,
} from '@/config/index'

export default {
  name: 'RegistrationPage',
  data: () => ({
    email: '',
    emailRules: EMAIL_RULES,
    passwordRules: REGISTRATION_PASSWORD_RULES,
    password: '',
    repeatedPassword: '',
    valid: false,
  }),
  computed: {
    ...mapState(['error', 'user']),
    formattedError() {
      return AUTH_ERRORS[this.error]
    },
  },
  watch: {
    password: 'validateForm',
    repeatedPassword: 'validateForm',
  },
  methods: {
    ...mapActions(['authenticate', 'register', 'logout', 'clearError']),
    async submit(event) {
      event.preventDefault()

      const userOrError = await this.register({
        email: this.email,
        password: this.password,
      })

      if (!('message' in userOrError)) {
        this.$root.notification.show({
          message: 'Account registered successfully!',
        })

        this.$router.replace('/')
      }
    },
    reset() {
      this.$refs.form.reset()
    },
    validateForm() {
      this.$refs.form.validate()
    },
  },
  mounted() {
    this.clearError()
  },
}
</script>
