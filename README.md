# DataModel

## 数据模型类

[API documentation](https://lisfan.github.io/data-model/)

## Feature 特性

- 模仿vue的model操作风格
- 支持computed
- 支持watch


-    * - 可以自定义业务对象的数据结构
  * - 可以自定义业务对象的数据结构
   * - 这样可以明确自己想要的数据，精简数据结构，过滤掉后端接口无用的数据，同时在最后可让后端删除无用的数据字段
   * - 同时提前确定你想要的基础数据响应结构，避免后期插入新响应数据带来影响和麻烦（当然也会失去部分扩展性）
   * - 也可以对接口字段名称作映射，改变接口中你不舒服的字段名称，从而使用自定义的名称
- 用来管理和操作业务对象抽象化后的数据模型
- 不提供移除字段的api，你可以设置为undefined或者null
- computed功能
- 惰性求值的
- watch功能
- 处理todo
- 优化实例数据模型值合并方式，只取存在数据模型中的值


## Detail 详情

- 该类应该作为基类，被其它具体的业务操作对象类所继承
- 数据模型的结构在实例化时就已经定好格式，若传进去的数据字段不存在于数据模型结构中，将会被忽略（这样有利于你精简或者规划你想要的数据结构）

## Install 安装

```bash
npm install -S @~lisfan/data-model
```

## Usage 起步

```js
import EventQueues from '@~lisfan/data-model'

const eventQueues = new EventQueues({
  debug: true, // 开始日志调式，默认false
  name: 'custom', // 设置日志器名称标记，默认值为'EventQueues'
  separator: '.', // 子命名空间的分割符，默认'.'
})

// 绑定主命名空间
eventQueues.on('name', (val) => {
  console.log('name', val)
})
// 绑定具体的子命名空间
eventQueues.on('name.subname', (preResult) => {
  console.log('name.subname', preResult)
})

// 绑定多个具体的子命名空间
eventQueues.on('name.subname.subname2', (preResult) => {
  console.log('name.subname.subname2', preResult)
})

// 指定事件函数
const specFun = () => {
  console.log('specFun')
}

// 绑定指定事件
eventQueues.on('name.subname3', specFun)

// 移除该子命名空间下指定事件队列项
eventQueues.off('name.subname3', specFun)

// 移除该子命名空间下所有队列
eventQueues.off('name.subname')

// 执行主命名空间下的队列事件
eventQueues.emit('name', 'firstArg', 'secondArg').then((result) => {
  console.log('emit result', result)
})
```

