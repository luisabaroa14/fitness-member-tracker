import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import CreateUserView from '@/views/CreateUserView.vue'
import UsersView from '@/views/UsersView.vue'
import EditUserView from '@/views/EditUserView.vue'
import AddPaymentView from '@/views/AddPaymentView.vue'
import AddClassView from '@/views/AddClassView.vue'
import LogInView from '@/views/LogInView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import { isAdminAuthenticated, isStaffAuthenticated } from '@/utils/loginStatus'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      component: LogInView
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { adminOnly: true }
    },
    {
      path: '/create-user',
      name: 'create-user',
      component: CreateUserView,
      meta: { adminOnly: true }
    },
    {
      path: '/users',
      name: 'users',
      component: UsersView,
      meta: { adminOnly: true }
    },
    {
      path: '/edit-user/:id',
      name: 'edit-user',
      component: EditUserView,
      meta: { adminOnly: true }
    },
    {
      path: '/add-payment/:id',
      name: 'add-payment',
      component: AddPaymentView,
      meta: { adminOnly: true }
    },
    {
      path: '/add-class/:id',
      name: 'add-class',
      component: AddClassView,
      meta: { adminOnly: false }
    },
    {
      path: '/not-found',
      name: 'not-found',
      component: NotFoundView,
      meta: { adminOnly: true }
    },
    // Catch-all route for any other routes that are not found
    {
      path: '/:catchAll(.*)',
      redirect: '/not-found'
    }
  ]
})

// Navigation guard to check if the route requires authentication
router.beforeEach((to, from, next) => {
  // Allow access to the login page
  if (to.path === '/login') {
    next()
  } else {
    // Check if the user has admin access or staff access to non-admin routes
    if (isAdminAuthenticated() || (isStaffAuthenticated() && !to.meta.adminOnly)) {
      next()
    } else {
      // Redirect to the login page for unauthorized access
      next('/login')
    }
  }
})

export default router
