<template>
  <div class="no-result">
    <div class="no-result-icon"></div>
    <p class="no-result-text"> {{ text }} </p>
  </div>
</template>
<script>
export default {
  props: {
    text: {
      type: String,
      default: '暂无数据'
    }
  }
}
</script>
<style lang="less" rel="stylesheet/less" scoped>
@import '~@/styles/mixin.less';

.no-result {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  .no-result-icon {
    width: 86px;
    height: 90px;
    margin: 0 auto;
    .bg-img('no-result');
    background-size: 86px 90px;
    .no-result-text {
      margin-top: 30px;
      font-size: 14px;
      color: hsla(0,0%,100%,.3);
    }
  }
}
</style>
