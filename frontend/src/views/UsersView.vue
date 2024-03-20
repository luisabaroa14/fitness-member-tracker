<template>
  <div>
    <h2 style="margin-bottom: 10px">Users</h2>
    <router-link to="/create-user">Create User</router-link>
    <button style="margin: 0px 20px" @click="exportData">Export Data</button>
    <input type="text" v-model="searchInput" placeholder="Search" />
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
        <tr
          v-for="user in users.filter(
            (u) =>
              u.name.toLowerCase().includes(searchQuery) ||
              u.mail.toLowerCase().includes(searchQuery) ||
              u.id.toLowerCase().includes(searchQuery)
          )"
          :key="user.id"
        >
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
import { ref, onMounted, computed } from 'vue'
import { SUBSCRIPTIONS } from '@/utils/constants'
import { getUsers } from '@/services/firestore/usersService'
import { getPayments } from '@/services/firestore/paymentsService'
import { getClasses } from '@/services/firestore/classesService'

const users = ref([])
const payments = ref([])
const classes = ref([])

// Define a ref for the search query
const searchQuery = ref('')

const searchInput = computed({
  get: () => searchQuery.value,
  set: (newValue) => {
    searchQuery.value = newValue.toLowerCase()
  }
})

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
        let diffMonths =
          (endDate.getFullYear() - startDate.getFullYear()) * 12 +
          (endDate.getMonth() - startDate.getMonth())

        // Check if the start date is after the beginning of the month
        if (endDate.getDate() >= startDate.getDate()) {
          diffMonths++ // Increment month difference by one
        }

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

const fetchClasses = async () => {
  try {
    const querySnapshot = await getClasses()

    classes.value = querySnapshot.docs.map((doc) => {
      const c = doc.data()
      c.date = c.date.toDate()
      return { id: doc.id, ...c }
    })
  } catch (error) {
    console.error('Error fetching classes: ', error.message)
    alert('An error occurred while fetching classes.')
  }
}

const exportData = () => {
  // Prepare combined data
  const combinedData = {
    users: [],
    payments: [],
    classes: []
  }
  // Add user data
  users.value.forEach((user) => {
    const mappedUser = {
      id: user.id,
      name: user.name,
      mail: user.mail,
      startDate: user.startDate,
      subscriptionData: user.subscriptionData.map((subscription) => {
        return {
          type: SUBSCRIPTIONS[subscription.type].name,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          // Extra subscription data
          subscriptionName: SUBSCRIPTIONS[subscription.type].name,
          diffMonths: subscription.diffMonths,
          totalPaid: subscription.totalPaid,
          balance:
            subscription.diffMonths * SUBSCRIPTIONS[subscription.type].amount -
            subscription.totalPaid
        }
      }),
      // Extra user data
      totalBalance: user.totalBalance
    }
    combinedData.users.push(mappedUser)
  })

  // Add payment data
  payments.value.forEach((payment) => {
    combinedData.payments.push({
      userId: payment.userId,
      amount: payment.amount,
      date: payment.paymentDate
    })
  })

  // Add classes data
  classes.value.forEach((c) => {
    combinedData.classes.push({
      userId: c.userId,
      date: c.date
    })
  })

  // Convert data to JSON format
  const jsonData = JSON.stringify(combinedData, null, 2)

  // Create a Blob object
  const blob = new Blob([jsonData], { type: 'application/json' })

  // Create download link
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'data.json')
  document.body.appendChild(link)
  link.click()
}

onMounted(async () => {
  await fetchPayments()
  await fetchUsers()
  await fetchClasses()
})
</script>

<style>
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
