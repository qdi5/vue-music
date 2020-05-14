<template>
  <div class="loading">
    <img width="24" height="24" src="./loading.gif" alt="loading">
    <p class="text">{{ text }}</p>
  </div>
</template>
<script>
export default {
  name: 'loading',
  props: {
    text: {
      type: String,
      default: '正在加载…'
    }
  }
}
</script>
<style lang="less" scoped>
.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: hsla(0,0%,100%,.5);
  font-size: 12px;
  z-index: 199304140958;
  .text {
    line-height: 20px;
    margin: 0;
    padding: 0;
  }
}
</style>
