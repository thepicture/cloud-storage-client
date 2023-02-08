<template>
  <v-card class="pl-4 pr-4 pb-4">
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
    <v-btn color="primary" dark class="mb-2 ml-4" @click="uploadFile">
      Upload File
    </v-btn>
    <FileEditDialog
      :newName="newName"
      :file="rawFile"
      :opened="isFileEditDialogOpened"
      :is-edit-mode="isEditMode"
      :rules="fileRules"
      @change="handleFileChange"
      @close="closeFileEditDialog"
      @save="saveFile"
    />
    <FileShareDialog
      :opened="isFileShareDialogOpened"
      :link="directLink"
      @linkcopy="copyDirectLinkToClipboard"
      @close="closeFileShareDialog"
    />
    <v-select
      label="View Type"
      prepend-icon="mdi-table"
      class="ml-4 mr-4"
      v-model="showAs"
      :items="viewTypes"
      @input="handleViewTypeSelect"
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
        {{ item.totalSizeInBytes | prettifyBytes }}
      </template>
      <template v-slot:item.name="{ item }">
        {{ `${item.name}${item.extension ? '.' + item.extension : ''}` }}
      </template>
      <template v-slot:item.actions="{ item }">
        <TooltipButton
          title="edit file"
          icon="mdi-pencil"
          @click="editFile(item)"
          small
        />
        <TooltipButton
          title="delete file"
          icon="mdi-delete"
          @click="deleteFile(item.id)"
          small
        />
        <TooltipButton
          title="Download"
          icon="mdi-download"
          tag="a"
          :href="item.href"
          small
        />
        <TooltipButton
          title="get download link"
          icon="mdi-share-variant"
          @click="getDirectDownloadLink(item)"
          small
        />
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
          <TooltipButton
            title="get download link"
            icon="mdi-share-variant"
            @click="getDirectDownloadLink(file)"
            small
          />
        </v-card-subtitle>
        <v-card-text>
          {{ file.totalSizeInBytes | prettifyBytes }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn outlined color="primary" @click="editFile(file)">Edit</v-btn>
          <v-btn outlined color="red" @click="deleteFile(file.id)"
            >Delete</v-btn
          >
          <a :href="file.href" class="pl-2">
            <v-btn color="primary" type="button">Download</v-btn>
          </a>
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
  TWENTY_MEGABYTES,
  DIRECT_LINK_BASE_URL,
} from '@/config/index'

import { FilenameGetter } from '@/utils/FilenameGetter'

import { FileURI } from '@/utils/FileURI'

import { Timestamp } from '@/utils/Timestamp'
import TooltipButton from '~/components/TooltipButton.vue'
import FileShareDialog from '~/components/FileShareDialog.vue'
import FileEditDialog from '~/components/FileEditDialog.vue'

export default {
  name: 'FilesPage',
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
    isFileEditDialogOpened: false,
    isFileShareDialogOpened: false,
    isEditMode: false,
    defaultFile: {
      id: 0,
      name: '',
      extension: '',
      createdAt: 0,
      deletedAt: Infinity,
      totalSizeInBytes: 0,
      bytes: [],
    },
    editedFile: {
      id: 0,
      name: '',
      extension: '',
      createdAt: 0,
      deletedAt: Infinity,
      totalSizeInBytes: 0,
      bytes: [],
    },
    rawFile: null,
    newName: '',
    files: [],
    directLink: '',
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
          href: `${this.$axios.defaults.baseURL}files/download/${
            file.id
          }/${encodeURIComponent(FilenameGetter.getFileName(file))}`,
        }))
      } else {
        files = this.files
          .map((file) => ({
            ...file,
            fileName: `${file.name}${
              file.extension ? '.' + file.extension : ''
            }`,
            href: `${this.$axios.defaults.baseURL}files/download/${
              file.id
            }/${encodeURIComponent(FilenameGetter.getFileName(file))}`,
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

    fileRules() {
      if (this.isEditMode) {
        return [
          (v) => !!v || 'New Name is Required',
          (v) => (!!v && !v.endsWith('.php')) || '.php cannot be uploaded',
        ]
      } else {
        return [
          (v) => !!v || 'File Should Be Presented',
          (v) => (!!v && !v.name.endsWith('.php')) || '.php cannot be uploaded',
          () =>
            this.editedFile.bytes.length < TWENTY_MEGABYTES ||
            'File Size should be less than 20mb',
        ]
      }
    },
    totalSizeOfFiles() {
      return filesize(
        this.files
          .map((file) => file.totalSizeInBytes)
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
    async saveFile(name) {
      if (this.isEditMode) {
        const [title, extension] = new FileURI(name).getValues()
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
            totalSizeInBytes: this.editedFile.bytes.length,
          },
        ]
        this.$root.notification.show({
          message: `File uploaded!`,
        })
      }
      this.closeFileEditDialog()
    },
    editFile(file) {
      this.rawFile = file
      this.editedFile = file
      this.newName = FilenameGetter.getFileName(file)
      this.isEditMode = true
      this.isFileEditDialogOpened = true
    },
    async deleteFile(fileId) {
      await this.$axios.delete(`/files/${fileId}`)
      this.files = this.files.filter((file) => file.id !== fileId)
      this.$root.notification.show({
        message: 'Deletion successful!',
      })
    },
    closeFileEditDialog() {
      this.editedFile = Object.assign({}, this.defaultFile)
      this.isFileValid = false
      this.isEditMode = false
      this.isFileEditDialogOpened = false
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
      if (file.name.lastIndexOf('.') !== -1) {
        name = file.name.split('.').slice(0, -1).join('')
        extension = file.name.split('.').pop()
      }
      this.editedFile = {
        name,
        extension,
        createdAt: +new Date(),
        deletedAt: Infinity,
        totalSizeInBytes: file.totalSizeInBytes,
        bytes: await this._getBytes(file),
      }
    },
    async getDirectDownloadLink(file) {
      this.$root.notification.show({
        message: 'Please wait...',
      })

      const response = await this.$axios.post(
        `/files/${file.id}/generate-direct-link`
      )

      const { data: hashLink } = response

      const fileName = encodeURIComponent(FilenameGetter.getFileName(file))

      const directLink = `${DIRECT_LINK_BASE_URL}/${hashLink}/${fileName}`

      this.directLink = directLink

      this.isFileShareDialogOpened = true
    },
    closeFileShareDialog() {
      this.isFileShareDialogOpened = false
      this.directLink = ''
    },
    copyDirectLinkToClipboard() {
      try {
        globalThis.navigator.clipboard.writeText(this.directLink)

        this.$root.notification.show({
          message: 'Link copied to Clipboard!',
        })
      } catch (error) {
        console.error(`Link copy error: ${error}`)

        this.$root.notification.show({
          message: 'Cannot copy link to Clipboard',
        })
      }
    },
    uploadFile() {
      this.isFileEditDialogOpened = true
    },
    async _getBytes(file) {
      const buffer = await file.arrayBuffer()
      const array = new Int8Array(buffer)
      return [...array]
    },
  },
  created() {
    this.showAs = this.$cookies.get(CONSTANTS.FOLDERS_VIEW_TYPE) || 'table'
  },
  async mounted() {
    const response = await this.$axios.get(
      `/files?folder_id=${this.$route.params.id}`
    )
    this.files = response.data.files
  },
  components: { TooltipButton, FileShareDialog, FileEditDialog },
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
