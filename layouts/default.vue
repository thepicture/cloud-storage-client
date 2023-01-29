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
          v-for="(item, i) in items"
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
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon @click="changeTheme">
            <v-icon v-on="on" v-bind="attrs">mdi-weather-sunny</v-icon>
          </v-btn>
        </template>
        <span>Toggle Theme</span>
      </v-tooltip>
      <v-toolbar-title>{{ title }}</v-toolbar-title>
      <v-spacer />
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
import { CONSTANTS } from '@/config/index'

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
    }
  },
  methods: {
    changeTheme() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark

      this.$cookies.set(CONSTANTS.IS_DARK_THEME, this.$vuetify.theme.dark)
    },
  },
  created() {
    this.$vuetify.theme.dark = this.$cookies.get(CONSTANTS.IS_DARK_THEME)
  },
  mounted() {
    this.$root.notification = this.$refs.notification
  },
}
</script>
