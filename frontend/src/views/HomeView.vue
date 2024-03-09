<template>
  <div class="center-item">
    <img alt="Home" class="logo" src="@/assets/logo.svg" width="125" height="125" />
    <div class="button-container">
      <router-link to="/users">View Users</router-link>
    </div>
  </div>
</template>

<script setup></script>

<style>
.logo {
  width: 200px;
  height: auto;
}
</style>
