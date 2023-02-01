<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <v-card>
        <v-card-title class="headline" tag="h2"> Sign in </v-card-title>
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
              autocomplete="current-password"
              required
              :rules="passwordRules"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn outlined color="primary" nuxt to="/registration"
            >Sign Up</v-btn
          >
          <v-btn
            color="primary"
            nuxt
            type="submit"
            @click="submit"
            :disabled="!valid"
            >Login</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import { EMAIL_RULES, PASSWORD_RULES, AUTH_ERRORS } from '@/config/index'

export default {
  name: 'AuthPage',
  data: () => ({
    email: '',
    emailRules: EMAIL_RULES,
    passwordRules: PASSWORD_RULES,
    password: '',
    valid: false,
  }),
  computed: {
    ...mapState(['error', 'user']),
    formattedError() {
      return AUTH_ERRORS[this.error]
    },
  },
  methods: {
    ...mapActions(['authenticate', 'logout', 'clearError']),
    async submit() {
      if (
        await this.authenticate({
          email: this.email,
          password: this.password,
        })
      ) {
        this.reset()

        this.$router.replace('/')

        this.$root.notification.show({
          message: 'Authentication successful!',
        })
      } else {
        this.$root.notification.show({
          message: 'Please, check your credentials and try again.',
        })
      }
    },
    reset() {
      this.$refs.form.reset()
    },
  },
  mounted() {
    this.clearError()
  },
}
</script>
