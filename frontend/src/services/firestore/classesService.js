import firebaseApp from '@/utils/firebase'
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  getFirestore
} from 'firebase/firestore'
import { CLASSES } from '@/utils/constants'

const db = getFirestore(firebaseApp)

export const addClass = async (userId, date) => {
  try {
    const docRef = await addDoc(collection(db, CLASSES), {
      userId: userId,
      date: new Date(date + 'T00:00:00')
    })
    return docRef
  } catch (error) {
    console.error('Error adding class: ', error.message)
    throw error
  }
}

export const deleteClass = async (classId) => {
  try {
    await deleteDoc(doc(db, CLASSES, classId))
  } catch (error) {
    console.error('Error deleting class: ', error.message)
    throw error
  }
}

export const getUserClasses = async (userId) => {
  try {
    const classessCollection = collection(db, CLASSES)

    const querySnapshot = await getDocs(
      query(classessCollection, where('userId', '==', userId), orderBy('date', 'desc'))
    )
    return querySnapshot
  } catch (error) {
    console.error('Error fetching user classes: ', error.message)
    throw error
  }
}

export const getClasses = async () => {
  try {
    const classesCollection = collection(db, CLASSES)

    const querySnapshot = await getDocs(query(classesCollection, orderBy('date', 'desc')))

    return querySnapshot
  } catch (error) {
    console.error('Error fetching classes: ', error.message)
    throw error
  }
}
