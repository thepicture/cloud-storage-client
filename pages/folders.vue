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
      :search="search"
      v-if="showAs === 'table'"
    ></v-data-table>
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
          {{ folder.createdAt }}
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
  }),
  computed: {
    humanReadableFolders() {
      return this.folders.map((folder) => ({
        ...folder,
        createdAt: new Date(folder.createdAt).toLocaleDateString(),
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
  },
  methods: {
    handleViewTypeSelect() {
      this.$cookies.set(CONSTANTS.FOLDERS_VIEW_TYPE, this.showAs)
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
