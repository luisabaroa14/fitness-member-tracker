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
import { PAYMENTS } from '@/utils/constants'

const db = getFirestore(firebaseApp)

export const addPayment = async (userId, amount, date) => {
  // // Example of adding a subcollection to a user
  // const paymentsCollectionRef = collection(db, USERS, userId, PAYMENTS)
  // // Add payment to the user's payments collection
  // await addDoc(paymentsCollectionRef, {
  //   amount: amount,
  //   date: new Date(date + 'T00:00:00')
  // })

  try {
    const docRef = await addDoc(collection(db, PAYMENTS), {
      userId: userId,
      amount: amount,
      date: new Date(date + 'T00:00:00')
    })
    return docRef
  } catch (error) {
    console.error('Error adding payment: ', error.message)
    throw error
  }
}

export const deletePayment = async (paymentId) => {
  try {
    await deleteDoc(doc(db, PAYMENTS, paymentId))
  } catch (error) {
    console.error('Error deleting payment: ', error.message)
    throw error
  }
}

export const getUserPayments = async (userId) => {
  try {
    const paymentsCollection = collection(db, PAYMENTS)

    const querySnapshot = await getDocs(
      query(paymentsCollection, where('userId', '==', userId), orderBy('date', 'desc'))
    )
    return querySnapshot
  } catch (error) {
    console.error('Error fetching user payments: ', error.message)
    throw error
  }
}

export const getPayments = async () => {
  try {
    const paymentsCollection = collection(db, PAYMENTS)

    const querySnapshot = await getDocs(query(paymentsCollection, orderBy('date', 'desc')))

    return querySnapshot
  } catch (error) {
    console.error('Error fetching payments: ', error.message)
    throw error
  }
}
