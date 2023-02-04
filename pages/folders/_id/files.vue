<template>
  <v-card class="pl-4 pr-4">
    <v-card-title>
      Files
      <v-btn outlined color="primary" dark class="ml-4" @click="$router.go(-1)"
        >Back</v-btn
      >
      <v-card-subtitle>{{ totalSizeOfFiles }} Total</v-card-subtitle>
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
        class="mb-4"
      ></v-text-field>
    </v-card-title>
    <v-dialog v-model="dialog" max-width="500px">
      <template v-slot:activator="{ on, attrs }">
        <v-btn color="primary" dark class="mb-2 ml-4" v-bind="attrs" v-on="on">
          Upload File
        </v-btn>
      </template>
      <v-card>
        <v-card-title>
          <span class="text-h5"
            >{{ isEditMode ? 'Rename' : 'Upload' }} File</span
          >
        </v-card-title>
        <v-form v-model="valid" ref="form" class="mr-4">
          <v-card-text v-if="isEditMode">
            <v-container>
              <v-row>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    label="File Name"
                    v-model="newName"
                    :rules="fileRules"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-file-input
            :rules="fileRules"
            label="Select File"
            show-size
            class="ml-5"
            v-model="rawFile"
            @change="handleFileChange"
            v-else
          ></v-file-input>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="close"> Cancel </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="save"
              :disabled="!canSaveFile"
            >
              {{ isEditMode ? 'Save' : 'Upload' }}
            </v-btn>
          </v-card-actions>
        </v-form>
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
    <v-select
      :items="fileTypes"
      label="File Type"
      prepend-icon="mdi-filter"
      v-model="fileType"
      class="ml-4 mr-4"
    ></v-select>
    <v-select
      :items="extensionTypes"
      label="Extension Type"
      prepend-icon="mdi-filter"
      v-model="extensionType"
      class="ml-4 mr-4"
    ></v-select>
    <v-data-table
      :headers="headers"
      :items="filteredFiles"
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
        <v-icon small class="mr-2" @click="deleteFile(item.id)">
          mdi-delete
        </v-icon>
        <v-icon @click="downloadFile(item)">mdi-download</v-icon>
      </template>
    </v-data-table>
    <section class="section" v-else>
      <v-card
        class="card mb-4 mt-4"
        :key="file.name"
        v-for="file of filteredFiles"
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
          <v-btn outlined color="red" @click="deleteFile(file.id)"
            >Delete</v-btn
          >
          <v-btn color="primary" @click="downloadFile(file)">Download</v-btn>
        </v-card-actions>
      </v-card>
      <p v-if="filteredFiles.length === 0">Nothing to show here!</p>
    </section>
  </v-card>
</template>

<script>
import { filesize } from 'filesize'

import {
  CONSTANTS,
  EXTENSION_TYPE,
  FILE_TYPE,
  FILE_TYPE_MIMES,
} from '@/config/index'

import { FilenameGetter } from '@/utils/FilenameGetter'

import { FileURI } from '@/utils/FileURI'

import { Timestamp } from '@/utils/Timestamp'

export default {
  name: 'FilesPage',
  async asyncData(context) {
    const response = await context.$axios.get(
      `/files?folder_id=${context.route.params.id}`
    )

    return {
      files: response.data.files,
    }
  },
  data: () => ({
    headers: [
      { text: 'File Name', value: 'name' },
      { text: 'Created At', value: 'createdAt' },
      { text: 'Total Size', value: 'totalSizeInBytes' },
      { text: 'Actions', value: 'actions', sortable: false },
    ],
    viewTypes: ['table', 'grid'],
    showAs: 'table',
    extensionTypes: Object.values(EXTENSION_TYPE),
    extensionType: EXTENSION_TYPE.WITH_AND_WITHOUT_EXTENSIONS,
    fileTypes: Object.values(FILE_TYPE),
    fileType: FILE_TYPE.ALL,
    search: '',
    dialog: false,
    isEditMode: false,
    valid: false,
    defaultFile: {
      id: 0,
      name: '',
      extension: '',
      createdAt: 0,
      deletedAt: Infinity,
      bytes: [],
    },
    editedFile: {
      id: 0,
      name: '',
      extension: '',
      createdAt: 0,
      deletedAt: Infinity,
      bytes: [],
    },
    rawFile: null,
    newName: '',
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
    filteredFiles() {
      let files = this.files.slice()

      if (!this.search) {
        files = files.map((file) => ({
          ...file,
          fileName: `${file.name}${file.extension ? '.' + file.extension : ''}`,
        }))
      } else {
        files = this.files
          .map((file) => ({
            ...file,
            fileName: `${file.name}${
              file.extension ? '.' + file.extension : ''
            }`,
          }))
          .filter((file) =>
            JSON.stringify(file)
              .toLowerCase()
              .includes(this.search.toLowerCase())
          )
      }

      if (this.extensionType !== EXTENSION_TYPE.WITH_AND_WITHOUT_EXTENSIONS) {
        files = files.filter((file) =>
          this.extensionType === EXTENSION_TYPE.WITH_EXTENSION_ONLY
            ? file.extension?.length > 0
            : file.extension?.length === 0
        )
      }

      if (this.fileType !== FILE_TYPE.ALL) {
        files = files.filter((file) => {
          if (!file.extension) {
            return false
          }

          const extension = file.extension.toLowerCase()

          if (this.fileType === FILE_TYPE.OTHER) {
            return !Object.values(FILE_TYPE_MIMES)
              .reduce((acc, value) => [...acc, ...value])
              .includes(extension)
          }

          return FILE_TYPE_MIMES[this.fileType].includes(extension)
        })
      }

      return files
    },
    canSaveFile() {
      return this.valid
    },
    fileRules() {
      if (this.isEditMode) {
        return [
          (v) => !!v || 'New Name is Required',
          (v) => (!!v && !v.endsWith('.php')) || '.php cannot be uploaded',
          (v) =>
            (!!v &&
              this.files.every(
                (file) => FilenameGetter.getFileName(file) !== v
              )) ||
            'File with this name already exists',
        ]
      } else {
        return [
          (v) => !!v || 'File Should Be Presented',
          (v) => (!!v && !v.name.endsWith('.php')) || '.php cannot be uploaded',
          (v) =>
            (!!v &&
              this.files.every(
                (file) => FilenameGetter.getFileName(file) !== this.rawFile.name
              )) ||
            'File with this name already exists',
        ]
      }
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
  },
  methods: {
    handleViewTypeSelect() {
      this.$cookies.set(CONSTANTS.FOLDERS_VIEW_TYPE, this.showAs)
    },
    async save() {
      if (this.isEditMode) {
        const [title, extension] = new FileURI(this.newName).getValues()

        await this.$axios.patch(`/files/${this.editedFile.id}`, {
          newTitle: title,
          newExtension: extension,
        })

        this.files = this.files.map((file) => {
          if (file.id === this.editedFile.id) {
            file.name = title
            file.extension = extension
          }

          return file
        })

        this.$root.notification.show({
          message: 'Rename successful!',
        })
      } else {
        const [title, extension] = [
          this.editedFile.name,
          this.editedFile.extension,
        ]

        const id = await this.$axios.post(`/files`, {
          title,
          extension,
          deletedAt: null,
          bytes: this.editedFile.bytes,
          folderId: Number(this.$route.params.id),
        })

        this.files = [
          ...this.files,
          {
            id: id.data,
            name: title,
            extension: extension,
            createdAt: Timestamp.nowAsSeconds() * 1000,
            deletedAt: null,
            owner: this.$store.state.user.email,
            folderId: this.editedFile.folderId,
            bytes: this.editedFile.bytes,
          },
        ]

        this.$root.notification.show({
          message: `File uploaded!`,
        })
      }

      this.close()
    },
    editFile(file) {
      this.rawFile = file
      this.editedFile = file
      this.newName = FilenameGetter.getFileName(file)

      this.isEditMode = true
      this.dialog = true
    },
    async deleteFile(fileId) {
      await this.$axios.delete(`/files/${fileId}`)
      this.files = this.files.filter((file) => file.id !== fileId)

      this.$root.notification.show({
        message: 'Deletion successful!',
      })
    },
    close() {
      this.editedFile = Object.assign({}, this.defaultFile)

      this.valid = false
      this.isEditMode = false
      this.dialog = false

      this.rawFile = null

      try {
        this.$refs.form.reset()
      } catch {}
    },
    /**
     *
     * @param {File} file
     */
    async handleFileChange(file) {
      if (!file) {
        return
      }

      let name
      let extension

      const bytes = await this._getBytes(file)

      if (file.name.lastIndexOf('.') !== -1) {
        name = file.name.split('.').slice(0, -1).join('')
        extension = file.name.split('.').pop()
      }

      this.editedFile = {
        name,
        extension,
        createdAt: +new Date(),
        deletedAt: Infinity,
        bytes,
      }
    },
    downloadFile(file) {
      const bytes = new Int8Array(file.bytes.length)
      file.bytes.forEach((byte, index) => (bytes[index] = byte))

      const blob = new Blob([bytes])

      const anchor = document.createElement('a')
      anchor.href = URL.createObjectURL(blob)
      anchor.download = FilenameGetter.getFileName(file)

      anchor.click()
    },
    /**
     * @param {File} file
     */
    async _getBytes(file) {
      const buffer = await file.arrayBuffer()
      const array = new Int8Array(buffer)

      return [...array]
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
