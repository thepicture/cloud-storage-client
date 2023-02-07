<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on, attrs }">
      <a
        :href="href"
        icon
        class="text-decoration-none ml-2 mr-2"
        v-if="tag === 'a'"
      >
        <v-icon v-on="on" v-bind="attrs" :aria-label="title" small>
          {{ icon }}
        </v-icon>
      </a>
      <v-btn icon @click.stop="handleClick" v-else>
        <v-icon v-on="on" v-bind="attrs" :aria-label="title" :small="small">
          {{ icon }}
        </v-icon>
      </v-btn>
    </template>
    <span>{{ title | capitalize }}</span>
  </v-tooltip>
</template>

<script>
export default {
  props: {
    icon: String,
    title: String,
    tag: String,
    href: String,
    small: Boolean,
  },
  emits: ['click'],
  filters: {
    capitalize(text) {
      return text
        .split(/\s/)
        .map((letter) => letter[0].toUpperCase() + letter.slice(1))
        .join(' ')
    },
  },
  methods: {
    handleClick() {
      this.$emit('click')
    },
  },
}
</script>
