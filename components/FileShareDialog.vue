<template>
  <v-dialog v-model="opened" max-width="500px">
    <v-card>
      <v-card-title>
        <span class="text-h5">File Share</span>
      </v-card-title>
      <v-container>
        <v-row>
          <v-col>
            <v-text-field
              label="Direct Link"
              v-model="link"
              readonly
            ></v-text-field>
          </v-col>
        </v-row>
      </v-container>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="handleLinkCopy"
          >Copy To Clipboard</v-btn
        >
        <v-btn color="blue darken-1" text @click="handleClose">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    opened: Boolean,
    link: String,
  },
  emits: ['linkcopy', 'close'],
  methods: {
    handleLinkCopy() {
      this.$emit('linkcopy')
    },
    handleClose() {
      this.$emit('close')
    },
  },
}
</script>
