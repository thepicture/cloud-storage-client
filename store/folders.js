import { MOCK_FOLDERS } from '@/config'

export const state = () => ({
  list: MOCK_FOLDERS,
})

export const mutations = {
  add(state, folder) {
    state.list = [...state.list, folder]
  },
  delete(state, folderName) {
    state.list = state.list.filter((folder) => folder.name !== folderName)
  },
  update(state, updatedFolder) {
    state.list = state.list.slice().map((folder) => {
      if (folder.createdAt === updatedFolder.createdAt) {
        folder.name = updatedFolder.name
      }

      return folder
    })
  },
}
