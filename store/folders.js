import { MOCK_FOLDERS } from '@/config'

import { FolderDatabase } from '@/persistence/database/FolderDatabase'

export const state = () => ({
  list: [],
})

export const getName = (name) => {
  const splitted = name.split('.')
  if (splitted.length === 1) {
    return name
  } else {
    splitted.pop()

    return splitted.join('')
  }
}

export const getExtension = (name) => {
  const splitted = name.split('.')
  if (splitted.length === 1) {
    return ''
  } else {
    return splitted.pop()
  }
}

export const getFileName = (file) => {
  if (file.extension) {
    return `${file.name}.${file.extension}`
  } else {
    return file.name
  }
}

export const mutations = {
  add(state, folder) {
    state.list = [...state.list, folder]
  },
  addFile(state, { file, folderName }) {
    state.list = state.list.map((folder) => {
      if (folder.name === folderName) {
        folder.files = [...folder.files, file]
      }

      return folder
    })
  },
  delete(state, folderName) {
    state.list = state.list.filter((folder) => folder.name !== folderName)
  },
  deleteFile(state, { folderName, file }) {
    state.list = state.list.map((folder) => {
      if (folder.name === folderName) {
        folder.files = folder.files.filter(
          (f) => getFileName(f) !== getFileName(file)
        )
      }

      return folder
    })
  },
  update(state, updatedFolder) {
    state.list = state.list.slice().map((folder) => {
      if (folder.createdAt === updatedFolder.createdAt) {
        folder.name = updatedFolder.name
      }

      return folder
    })
  },
  updateFile(state, { file, newName, folderName }) {
    state.list = state.list.map((folder) => {
      if (folder.name === folderName) {
        folder.files = folder.files.map((f) => {
          if (getFileName(f) === getFileName(file)) {
            f.name = getName(newName)
            f.extension = getExtension(newName)
          }

          return f
        })
      }

      return folder
    })
  },
}
