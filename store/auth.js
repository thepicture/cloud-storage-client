import { createUserWithEmailAndPassword, signOut } from 'firebase/auth'

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
      commit('setUser', userCredential.user)
    } catch (error) {
      commit('setError', error.code)
    }
  },
  async logout({ commit }) {
    await signOut(auth)
    commit('setUser', null)
  },
  clearError({ commit }) {
    commit('setError', '')
  },
  async register({ commit }, { email, password }) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      commit('setUser', userCredential.user)
      return userCredential.user
    } catch (error) {
      commit('setError', error.code)
      return error
    }
  },
  async logout({ commit }) {
    await signOut(auth)
    commit('setUser', null)
  },
  clearError({ commit }) {
    commit('setError', '')
  },
}
