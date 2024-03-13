<template>
  <div class="header">
    <router-link to="/users">
      <img alt="Home" class="logo" src="@/assets/logo.png" />
    </router-link>
  </div>
</template>

<style scoped>
.header {
  position: absolute;
  top: 0;
  left: 0;
  padding: 10px;
  z-index: 999;
}
.logo {
  width: 50px;
  height: auto;
}
</style>
