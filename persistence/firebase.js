import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyBt_A0cjSzqYUP_vzSv1oLAha6xpfOtOQM',
  authDomain: 'cloud-storage-client-4ee14.firebaseapp.com',
  projectId: 'cloud-storage-client-4ee14',
  storageBucket: 'cloud-storage-client-4ee14.appspot.com',
  messagingSenderId: '458253175575',
  appId: '1:458253175575:web:ae5919df339bae361e0552',
  measurementId: 'G-3RP2ZQ7YFS',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
