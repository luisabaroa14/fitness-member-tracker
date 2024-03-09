<template>
  <div>
    <h2 style="margin-bottom: 10px">Users</h2>
    <router-link to="/create-user">Create User</router-link>
    <table class="w-100 h-100" style="margin-top: 20px">
      <thead>
        <tr>
          <th>Id</th>
          <th>Name</th>
          <th>Email</th>
          <th>Start Date</th>
          <th>Total Balance</th>
          <th>Subscriptions</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.name }}</td>
          <td>{{ user.mail }}</td>
          <td>{{ user.startDate?.toDateString() }}</td>
          <td>${{ user.totalBalance }}</td>
          <td>
            <ul v-if="user.subscriptionData.length > 0">
              <li v-for="(subscription, index) in user.subscriptionData" :key="index">
                <p>Type: {{ SUBSCRIPTIONS[subscription.type].name }}</p>
                <p>Months: {{ subscription.diffMonths }}</p>
                <p>
                  Debt: ${{ subscription.diffMonths * SUBSCRIPTIONS[subscription.type].amount }}
                </p>
                <p>Paid: ${{ subscription.totalPaid }}</p>
                <p>
                  Balance: ${{
                    subscription.diffMonths * SUBSCRIPTIONS[subscription.type].amount -
                    subscription.totalPaid
                  }}
                </p>
                <p>
                  Start Date: {{ subscription.startDate?.toDateString() || 'No date provided' }}
                </p>
                <p>End Date: {{ subscription.endDate?.toDateString() || 'No date provided' }}</p>
              </li>
            </ul>
            <span v-else>No subscriptions</span>
          </td>
          <td>
            <div class="router-links">
              <router-link :to="{ name: 'edit-user', params: { id: user.id } }"> Edit </router-link>
              <router-link :to="{ name: 'add-payment', params: { id: user.id } }">
                Add payment
              </router-link>
              <router-link :to="{ name: 'add-class', params: { id: user.id } }">
                Add class
              </router-link>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { SUBSCRIPTIONS } from '@/utils/constants'
import { getUsers } from '@/services/firestore/usersService'
import { getPayments } from '@/services/firestore/paymentsService'

const users = ref([])
const payments = ref([])

const fetchPayments = async () => {
  try {
    const querySnapshot = await getPayments()

    payments.value = querySnapshot.docs.map((doc) => {
      const payments = doc.data()
      payments.date = payments.date.toDate()
      return { id: doc.id, ...payments }
    })
  } catch (error) {
    console.error('Error fetching payments: ', error.message)
    alert('An error occurred while fetching payments.')
  }
}

const fetchUsers = async () => {
  try {
    const querySnapshot = await getUsers()
    querySnapshot.forEach((doc) => {
      const user = doc.data()
      user.startDate = user.startDate?.toDate()

      let totalBalance = 0

      user.subscriptionData.forEach((subscription) => {
        subscription.startDate = subscription.startDate?.toDate()
        subscription.endDate = subscription.endDate?.toDate()

        const startDate = new Date(subscription.startDate)
        let endDate = subscription.endDate ? new Date(subscription.endDate) : new Date()

        // Calculate the difference in months
        const diffMonths =
          (endDate.getFullYear() - startDate.getFullYear()) * 12 +
          (endDate.getMonth() - startDate.getMonth())

        subscription.diffMonths = diffMonths

        if (payments.value) {
          // Get the payments for the current subscription
          const subscriptionPayments = payments.value.filter((payment) => {
            return payment.date >= startDate && payment.date <= endDate && payment.userId === doc.id
          })

          // Calculate the total amount paid for the current subscription
          subscription.totalPaid = subscriptionPayments.reduce(
            (acc, payment) => acc + payment.amount,
            0
          )

          // Add the debt of the subscription to the total amount
          totalBalance +=
            subscription.diffMonths * SUBSCRIPTIONS[subscription.type].amount -
            subscription.totalPaid
        }
      })

      // Set the total debt of the user
      user.totalBalance = totalBalance

      users.value.push({ id: doc.id, ...user })
    })
  } catch (error) {
    console.error('Error fetching users: ', error.message)
    alert('An error occurred while fetching users.')
  }
}

onMounted(async () => {
  await fetchPayments()
  await fetchUsers()
})
</script>

<style scoped>
.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td,
li {
  padding: 8px;
  border-bottom: 1px solid #ddd;
  text-align: left;
}

thead th {
  background-color: #000000;
}

tfoot td {
  border-top: 2px solid #333;
  font-weight: bold;
}

.total-label {
  text-align: right;
}

.total-amount {
  text-align: center;
}

.router-links {
  display: flex;
  flex-direction: column;
}

.router-link {
  margin-bottom: 8px;
  font-size: 16px;
  /* Add other styles as needed */
}
</style>
