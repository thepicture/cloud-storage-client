export const AUTH_ERRORS = {
  'auth/user-not-found': 'Email does not exist',
}

export const EMAIL_REGEXP = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/

export const EMAIL_RULES = [
  (v) => !!v || 'Enter email',
  (v) => EMAIL_REGEXP.test(v) || 'Email must be valid',
]

export const PASSWORD_RULES = [(v) => !!v || 'Enter password']
