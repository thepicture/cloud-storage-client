import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'

import { auth } from '@/persistence/firebase'

export const state = () => ({
  user: null,
  error: '',
})

export const mutations = {
  setUser(state, user) {
    state.user = user
  },
  setError(state, error) {
    state.error = error
  },
}

export const actions = {
  async authenticate({ commit }, { email, password }) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      )
      if (userCredential) {
        commit('setUser', {
          accessToken: userCredential.user.accessToken,
        })
        return true
      }
    } catch (error) {
      commit('setError', error.code)
      return false
    }
  },
  async register({ commit }, { email, password }) {
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      commit('setUser', {
        accessToken: user.accessToken,
      })
      return true
    } catch (error) {
      commit('setError', error.code)
      return false
    }
  },
  async logout({ commit }) {
    await auth.signOut()

    commit('setUser', null)
  },
  clearError({ commit }) {
    commit('setError', '')
  },
}
