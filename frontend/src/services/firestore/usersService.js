import firebaseApp from '@/utils/firebase'
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  getFirestore
} from 'firebase/firestore'
import { USERS } from '@/utils/constants'

const db = getFirestore(firebaseApp)

export const addUser = async (user) => {
  try {
    const docRef = await addDoc(collection(db, USERS), {
      name: user.name,
      mail: user.mail,
      subscriptionData: [
        {
          type: user.subscriptionType,
          startDate: user.subscriptionStartDate
            ? new Date(user.subscriptionStartDate + 'T00:00:00')
            : null,
          endDate: user.subscriptionEndDate
            ? new Date(user.subscriptionEndDate + 'T00:00:00')
            : null
        }
      ],
      startDate: user.startDate ? new Date(user.startDate + 'T00:00:00') : null
    })
    return docRef.id
  } catch (error) {
    console.error('Error adding user: ', error.message)
    throw error
  }
}

export const updateUser = async (user, userId) => {
  try {
    const userRef = doc(db, USERS, userId)
    await updateDoc(userRef, user)
  } catch (error) {
    console.error('Error updating user: ', error.message)
    throw error
  }
}

export const getUser = async (userId) => {
  try {
    const docRef = doc(db, USERS, userId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return docSnap
    } else {
      console.error('User not found')
      return null
    }
  } catch (error) {
    console.error('Error fetching user: ', error.message)
    throw error
  }
}

export const getUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, USERS))
    return querySnapshot
  } catch (error) {
    console.error('Error fetching users: ', error.message)
    throw error
  }
}
