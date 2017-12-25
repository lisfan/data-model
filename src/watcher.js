/**
 * @file 值观察类
 */

import validation from '@~lisfan/validation'

class Watcher {
  /**
   * 更新默认配置选项
   *
   * @since 1.0.0
   * @static
   * @property {string} data=undefined - 初始数据值，会被JSON.stringify转换成字符串
   * @property {boolean} deep=false - 是否深入观察数据变化
   * @property {boolean} immediate=false - 是否立即执行一次事件句柄
   * @property {function} handler=()=>{} - 观察事件句柄
   */
  static options = {
    data: undefined,
    deep: false,
    immediate: false,
    handler: () => {
    }
  }

  /**
   * 构造函数
   *
   * @see Watcher.options
   *
   * @param {object} options - 配置选项见{@link Watcher.options}
   */
  constructor(options) {
    this.$options = {
      ...Watcher.options,
      ...options
    }

    this._data = this.$options.data

    // 是否立即执行一次事件句柄
    if (this.$immediate) {
      this.$handler(this.$data)
    }
  }

  /**
   * 实例初始配置项
   *
   * @since 1.0.0
   *
   * @readonly
   */
  $options = undefined

  /**
   * 获取实例是否启用深入观察的状态
   *
   * @since 1.0.0
   *
   * @getter
   * @readonly
   *
   * @type {boolean}
   */
  get $deep() {
    return this.$options.deep
  }

  /**
   * 获取实例是否立即执行一次事件句柄的状态
   *
   * @since 1.0.0
   *
   * @getter
   * @readonly
   *
   * @type {boolean}
   */
  get $immediate() {
    return this.$options.immediate
  }

  /**
   * 获取实例的事件句柄
   *
   * @since 1.0.0
   *
   * @getter
   * @readonly
   *
   * @type {function}
   */
  get $handler() {
    return this.$options.handler
  }

  /**
   * 实例当前观察的数据
   *
   * @since 1.0.0
   *
   * @private
   */
  _data = undefined

  /**
   * 获取实例当前观察的数据
   *
   * @since 1.0.0
   *
   * @getter
   * @readonly
   *
   * @type {*}
   */
  get $data() {
    return this._data
  }

  /**
   * 触发数据变化观察
   *
   * @since 1.0.0
   *
   * @param {*} newData - 新数据
   *
   * @returns {Watcher}
   */
  emit(newData) {
    // 如果值未发生变化
    if (this.$data === newData && !validation.isPlainObject(newData)) {
      return this
    }

    // 如果newData是对象型值，则需判断如下条件决定是否触发emit，否则一定会触发emit
    // 1. newData是对象类型值
    // 2. newData值与原始值是相同的对象
    // 3. 启用了深度观察模式
    // 如果只是普通类型
    if (this.$data === newData && validation.isPlainObject(newData) && !this.$deep) {
      return this
    }

    // 若值发生了变化
    this.$handler(this.$data, newData)
    this._data = newData

    return this
  }
}

export default Watcher