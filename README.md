# 这一版代码是2019年初的版本；这个仓库用于重构代码；计划重构两次；第一次重构主要是加强组件化思维的理解，以及代码中不太合理的部分修正；第二次重构打算基于vue3.x版本，估计得等到2020年下半年的事情；
# vue-music值得学习的地方
## 一、使用类实现工厂函数的功能
export default class Singer {
  constructor({ id, name }) {
    this.id = id
    this.name = name
    this.avatar = `https://y.gtimg.cn/music/photo_new/T001R300x300M000${id}.jpg?max_age=2592000`
  }
}

类的好处：
1、代码集中在一起维护
2、类的扩展性比对象的扩展性好很多

## 二、使用vConsole在移动端调试，fiddler抓包工具

## 三、转场动画
 
## 四、es6+
1. 字符串拼接 `${}`，模板字符串里，还可以书写js表达式
2. 动态字符串作为方法名, 例如：['list' + id]() {}

## 五、贝塞尔曲线