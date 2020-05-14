<template>
  <div @touchmove.prevent="">
    <header>
      <slot name="header"></slot>
    </header>
    <nav>
      <slot name="nav"></slot>
    </nav>
    <main ref="main" :style="'bottom:' + calcBottom">
      <slot name="main"></slot>
    </main>
    <div>
      <slot name="player"></slot>
    </div>
    <slot></slot>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  computed: {
    ...mapGetters(['calcBottom'])
  }
}
</script>

<style>
header {
  position: relative;
  height: 44px;
  text-align: center;
  color: #ffcd32;
  font-size: 0;
}
nav {
  height: 44px;
  line-height: 44px;
  font-size: 14px;
  margin-bottom: 14px;
}
main {
  position: fixed;
  top: 88px;
  width: 100%;
}
</style>
