<template>
  <v-app>
    <Notification ref="notification" />

    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in authDependentItems"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar :clipped-left="clipped" fixed app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <TooltipButton
        title="toggle theme"
        icon="mdi-weather-sunny"
        @click="changeTheme"
      />
      <v-toolbar-title>{{ title }}</v-toolbar-title>
      <v-spacer />
      <v-btn color="primary" @click="handleLogOut" v-if="isAuthenticated"
        >Log out</v-btn
      >
    </v-app-bar>
    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
    <v-footer :absolute="!fixed" app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script>
import { mapActions } from 'vuex'

import { CONSTANTS } from '@/config/index'

import { auth } from '@/persistence/firebase'

import TooltipButton from '~/components/TooltipButton.vue'

export default {
  name: 'DefaultLayout',
  data() {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: 'mdi-login',
          title: 'Auth',
          to: '/auth',
        },
        {
          icon: 'mdi-account-plus',
          title: 'Registration',
          to: '/registration',
        },
        {
          icon: 'mdi-folder',
          title: 'Folders',
          to: '/folders',
        },
      ],
      miniVariant: false,
      title: 'Cloud Storage Client',
      isDarkTheme: true,
      loggedOutPaths: ['/auth', '/registration'],
    }
  },
  computed: {
    isAuthenticated() {
      return !!this.$store.state.user
    },
    authDependentItems() {
      if (this.isAuthenticated) {
        return this.items.filter(
          (item) => !['/registration', '/auth'].includes(item.to)
        )
      } else {
        return this.items.filter((item) =>
          ['/registration', '/auth'].includes(item.to)
        )
      }
    },
  },
  methods: {
    ...mapActions(['authenticate', 'logout', 'restoreUserSession']),
    changeTheme() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark
      this.$cookies.set(CONSTANTS.IS_DARK_THEME, this.$vuetify.theme.dark)
    },
    handleLogOut() {
      this.logout()
      this.$root.notification.show({
        message: 'Log out successful!',
      })
      this.navigateTo('/auth')
    },
    navigateTo(path) {
      this.$router.replace(path)
    },
    _navigateDependingOnUserState() {
      if (this.isAuthenticated) {
        if (this.loggedOutPaths.includes(location.pathname)) {
          this.navigateTo('/folders')
        }
      } else {
        if (!this.loggedOutPaths.includes(location.pathname)) {
          this.navigateTo('/auth')
        }
      }
    },
  },
  created() {
    this.$vuetify.theme.dark = this.$cookies.get(CONSTANTS.IS_DARK_THEME)
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.restoreUserSession(user)
        this._navigateDependingOnUserState()
      }
    })
  },
  mounted() {
    this.$root.notification = this.$refs.notification
    this._navigateDependingOnUserState()
  },
  components: { TooltipButton },
}
</script>
