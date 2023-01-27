<template>
  <v-card class="pl-4 pr-4">
    <v-card-title>
      Folders
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
          New Folder
        </v-btn>
      </template>
      <v-card>
        <v-card-title>
          <span class="text-h5">Add a New Folder</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="editedFolder.name"
                  label="Folder Name"
                  :rules="[
                    (v) => !!v || 'Folder Name is Required',
                    (v) =>
                      folders.every((folder) => folder.name !== v) ||
                      'This Folder Already Exists',
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
            :disabled="!canSaveFolder"
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
      :items="humanReadableFolders"
      :items-per-page="15"
      class="elevation-1"
      actions=""
      :search="search"
      v-if="showAs === 'table'"
      ><template v-slot:item.createdAt="{ item }">
        {{ new Date(item.createdAt).toLocaleString() }}
      </template></v-data-table
    >
    <section class="section" v-else>
      <v-card
        class="card mb-4 mt-4"
        :key="folder.createdAt + folder.owner"
        v-for="folder of filteredGridFolders"
      >
        <v-icon size="300">mdi-folder</v-icon>
        <v-card-title primary-title>
          {{ folder.name }}
        </v-card-title>
        <v-card-subtitle>
          Created by {{ folder.owner }} at
          {{ new Date(folder.createdAt).toLocaleDateString() }}
        </v-card-subtitle>
        <v-card-text>
          {{ folder.filesCount }}
          {{ `file${folder.filesCount === 1 ? '' : 's'}` }}
        </v-card-text>
        <v-card-text>
          {{ folder.totalSizeInBytes }}
        </v-card-text>
      </v-card>
    </section>
  </v-card>
</template>

<script>
import { filesize } from 'filesize'

import { CONSTANTS } from '@/config/index'

const MOCK_FOLDERS = new Array(16)
  .fill([
    {
      name: 'Documents',
      createdAt: +new Date() - 12 * 60 * 60 * 1000,
      owner: 'You',
      filesCount: 10,
      totalSizeInBytes: 1024 * 512,
    },
    {
      name: 'Pictures',
      createdAt: +new Date() - 6 * 60 * 60 * 1000,
      owner: 'You',
      filesCount: 20,
      totalSizeInBytes: 1024 * 1024 * 6,
    },
    {
      name: 'Videos',
      createdAt: +new Date() - 3 * 60 * 60 * 1000,
      owner: 'You',
      filesCount: 6,
      totalSizeInBytes: 1024 * 1024 * 30,
    },
    {
      name: 'Music',
      createdAt: +new Date() - 30 * 60 * 1000,
      owner: 'You',
      filesCount: 12,
      totalSizeInBytes: 1024 * 1024 * 8,
    },
  ])
  .reduce((a1, a2) => [...a1, ...a2], [])

export default {
  name: 'FoldersPage',
  data: () => ({
    headers: [
      { text: 'Name', value: 'name' },
      { text: 'Created At', value: 'createdAt' },
      { text: 'Owner', value: 'owner' },
      { text: 'Files Count', value: 'filesCount' },
      { text: 'Total Size', value: 'totalSizeInBytes' },
    ],
    folders: MOCK_FOLDERS,
    showAs: 'table',
    viewTypes: ['table', 'grid'],
    search: '',
    defaultFolder: {
      name: '',
      calories: 0,
      fat: 0,
      carbs: 0,
      protein: 0,
    },
    editedFolder: {
      name: '',
    },
    dialog: false,
  }),
  computed: {
    humanReadableFolders() {
      return this.folders.map((folder) => ({
        ...folder,
        createdAt: folder.createdAt,
        totalSizeInBytes: filesize(folder.totalSizeInBytes, {
          base: 2,
          standard: 'jedec',
        }),
      }))
    },
    filteredGridFolders() {
      if (!this.search) {
        return this.humanReadableFolders
      }

      return this.humanReadableFolders.filter((folder) =>
        JSON.stringify(folder).toLowerCase().includes(this.search.toLowerCase())
      )
    },
    canSaveFolder() {
      return (
        !!this.editedFolder.name &&
        this.folders.every((folder) => folder.name !== this.editedFolder.name)
      )
    },
  },
  methods: {
    handleViewTypeSelect() {
      this.$cookies.set(CONSTANTS.FOLDERS_VIEW_TYPE, this.showAs)
    },
    save() {
      this.folders = [
        ...this.folders,
        {
          ...this.editedFolder,
          createdAt: Number(new Date()),
          owner: 'You',
          filesCount: 0,
          totalSizeInBytes: 0,
        },
      ]

      this.close()
    },
    close() {
      this.editedFolder = Object.assign({}, this.defaultFolder)

      this.dialog = false
    },
  },
  created() {
    this.showAs = this.$cookies.get(CONSTANTS.FOLDERS_VIEW_TYPE) || 'table'
  },
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
