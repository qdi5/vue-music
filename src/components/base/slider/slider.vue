<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot></slot>
    </div>
    <div class="dots">
    </div>
  </div>
</template>

<script>
import BScroll from 'better-scroll'
import { addClass, hasClass } from '@/utils/dom.js'
export default {
  props: {
    // 是否无缝滚动
    loop: {
      type: Boolean,
      default: true
    },
    // 自动轮播
    autoPlay: {
      type: Boolean,
      default: true
    },
    // 间隔时间
    interval: {
      type: Number,
      default: 4000
    }
  },
  mounted(){
    this._setSliderWidth()
  },
  methods: {
    _setSliderWidth() {
      this.children = this.$refs.sliderGroup.children
      let width = 0
      let sliderWidth = this.$refs.slider.clientWidth
      for (let i = 0; i < this.children.length; i++) {
        let child = this.children[i]
        addClass(child, 'slider-item')
        child.style.width = sliderWidth + 'px'
        width += sliderWidth
      }
      if (this.loop) {
        width += 2 * sliderWidth
      }
      this.$refs.sliderGroup.style.width = width + 'px'
    },
    _initSlider() {
      this.slider = new BScroll(this.$refs.slider, {
        scrollX: true,
        scrollY: false,
        // 惯性
        momentum: false,
        snap: {
          loop: this.loop,
          // 手指滑动多少后滚动，阈值
          threshold: 0.3,
          // 滚动速度
          speed: 400
        }
      })
    }
  }
}
</script>

<style>

</style>