<template>
  <v-dialog v-model="opened" max-width="500px">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ isEditMode ? 'Rename' : 'Upload' }} File</span>
      </v-card-title>
      <v-form v-model="valid" ref="form" class="mr-4">
        <v-card-text v-if="isEditMode">
          <v-container>
            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  label="File Name"
                  v-model="name"
                  :rules="rules"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-file-input
          label="Select File"
          show-size
          class="ml-5"
          :rules="rules"
          @change="handleFileChange"
          v-else
        ></v-file-input>
        <v-checkbox
          v-model="temporary"
          class="ml-5"
          :label="`Temporary`"
        ></v-checkbox>
        <section class="ml-5">
          <v-datetime-picker
            label="Deleted At"
            :date-picker-props="dateProps"
            v-model="datetime"
            v-if="temporary"
          >
            <template slot="dateIcon">
              <v-icon>mdi-calendar</v-icon>
            </template>
            <template slot="timeIcon">
              <v-icon>mdi-clock</v-icon>
            </template></v-datetime-picker
          >
        </section>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="handleClose">
            Cancel
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="handleSave"
            :disabled="!valid"
          >
            {{ isEditMode ? 'Save' : 'Upload' }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      valid: false,
      name: this.newName,
      deletedAt: Infinity,
      temporary: false,
      dateProps: {
        min: new Date().toISOString().substring(0, 10),
      },
      datetime: new Date(),
    }
  },
  props: {
    newName: String,
    rules: Array,
    opened: Boolean,
    isEditMode: Boolean,
    canSaveFile: Boolean,
  },
  watch: {
    newName(name) {
      this.name = name
    },
  },
  emits: ['change', 'close', 'save'],
  methods: {
    handleFileChange(file) {
      this.$emit('change', file)
    },
    handleClose() {
      this.$emit('close')
    },
    handleSave() {
      this.$emit('save', { name: this.name, deletedAt: this.deletedAt })
    },
  },
}
</script>
