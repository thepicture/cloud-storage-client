<template>
  <v-card class="pl-4 pr-4">
    <v-card-title>
      Files
      <v-btn outlined color="primary" dark class="ml-4" @click="$router.go(-1)"
        >Back</v-btn
      >
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>
    <v-dialog v-model="dialog" max-width="500px">
      <template v-slot:activator="{ on, attrs }">
        <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
          Upload File
        </v-btn>
      </template>
      <v-card>
        <v-card-title>
          <span class="text-h5"
            >{{ isEditMode ? 'Edit Existing' : 'Add a New' }} File</span
          >
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  label="File Name"
                  :rules="[
                    (v) => !!v || 'File Name is Required',
                    (v) =>
                      files.every((file) => file.name !== v) ||
                      'This File Already Exists',
                  ]"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="close"> Cancel </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="save"
            :disabled="!canSaveFile"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-select
      :items="viewTypes"
      label="View Type"
      prepend-icon="mdi-table"
      @input="handleViewTypeSelect"
      v-model="showAs"
      class="ml-4 mr-4"
    ></v-select>
    <v-data-table
      :headers="headers"
      :items="filteredGridFiles"
      :items-per-page="15"
      class="elevation-1"
      actions=""
      v-if="showAs === 'table'"
    >
      <template v-slot:item.createdAt="{ item }">
        {{ new Date(item.createdAt).toLocaleString() }}
      </template>
      <template v-slot:item.totalSizeInBytes="{ item }">
        {{ item.bytes.length | prettifyBytes }}
      </template>
      <template v-slot:item.name="{ item }">
        {{ `${item.name}${item.extension ? '.' + item.extension : ''}` }}
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon small class="mr-2" @click="editFile(item)"> mdi-pencil </v-icon>
        <v-icon small @click="deleteFile(item)"> mdi-delete </v-icon>
      </template>
    </v-data-table>
    <section class="section" v-else>
      <v-card
        class="card mb-4 mt-4"
        :key="file.name"
        v-for="file of filteredGridFiles"
      >
        <v-icon size="300">mdi-file</v-icon>
        <v-card-title primary-title>
          {{ file.fileName }}
        </v-card-title>
        <v-card-subtitle>
          Created at
          {{ new Date(file.createdAt).toLocaleDateString() }}
        </v-card-subtitle>
        <v-card-text>
          {{ file.bytes.length | prettifyBytes }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn outlined color="primary" @click="editFile(file)">Edit</v-btn>
          <v-btn outlined color="red" @click="deleteFile(file)">Delete</v-btn>
        </v-card-actions>
      </v-card>
      <p v-if="filteredGridFiles.length === 0">Nothing to show here!</p>
    </section>
  </v-card>
</template>

<script>
import { filesize } from 'filesize'

import { CONSTANTS } from '@/config/index'

export default {
  name: 'FilesPage',
  data: () => ({
    headers: [
      { text: 'File Name', value: 'name' },
      { text: 'Created At', value: 'createdAt' },
      { text: 'Total Size', value: 'totalSizeInBytes' },
      { text: 'Actions', value: 'actions', sortable: false },
    ],
    showAs: 'table',
    viewTypes: ['table', 'grid'],
    search: '',
    dialog: false,
    isEditMode: false,
  }),
  filters: {
    prettifyBytes(value) {
      return filesize(value, {
        base: 2,
        standard: 'jedec',
      })
    },
  },
  computed: {
    filteredGridFiles() {
      if (!this.search) {
        return this.files.map((file) => ({
          ...file,
          fileName: `${file.name}${file.extension ? '.' + file.extension : ''}`,
        }))
      }

      return this.files
        .map((file) => ({
          ...file,
          fileName: `${file.name}${file.extension ? '.' + file.extension : ''}`,
        }))
        .filter((file) =>
          JSON.stringify(file).toLowerCase().includes(this.search.toLowerCase())
        )
    },
    canSaveFile() {
      return true
    },
    totalSizeOfFiles() {
      return filesize(
        this.files
          .map((file) => file.bytes.length)
          .reduce((f1, f2) => f1 + f2, 0),
        {
          base: 2,
          standard: 'jedec',
        }
      )
    },
    files() {
      return this.$store.state.folders.list.find(
        (folder) => folder.name === decodeURIComponent(this.$route.params.name)
      ).files
    },
  },
  methods: {
    handleViewTypeSelect() {
      this.$cookies.set(CONSTANTS.FOLDERS_VIEW_TYPE, this.showAs)
    },
    save() {
      if (this.isEditMode) {
        this.$store.commit('folders/update', this.editedFolder)
      } else {
        this.$store.commit('folders/add', this.editedFolder)
      }

      this.close()
    },
    editFile(folder) {
      this.editedFolder = Object.assign({}, folder)

      this.isEditMode = true
      this.dialog = true
    },
    deleteFile(folder) {
      this.$store.commit('folders/delete', folder.name)
    },
    close() {
      this.editedFolder = Object.assign({}, this.defaultFolder)

      this.isEditMode = false
      this.dialog = false
    },
  },
  created() {
    this.showAs = this.$cookies.get(CONSTANTS.FOLDERS_VIEW_TYPE) || 'table'
  },
  mounted() {},
}
</script>

<style scoped>
.card {
  width: 300px;
}

.section {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
}
</style>
