<template>
  <div id="app" ref="app">
    <router-view/>
  </div>
</template>

<script>
// import eruda from 'eruda'
export default {
  name: 'App',
  created () {
    // eruda.init()
  }
}
</script>
<style>
body {
  background: #222;
}
#app {
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
</style>
