/**
 * @file 值观察类
 * @author lisfan <goolisfan@gmail.com>
 * @version 1.0.0
 * @licence MIT
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
   * @param {object} options - 配置参数
   * @param {boolean} [options.data] - 初始数据值，会被JSON.stringify转换成字符串
   * @param {boolean} [options.deep=false] - 是否深入观察数据变化
   * @param {boolean} [options.immediate=false] - 是否立即执行一次事件句柄
   * @param {function} [options.handler=()=>{}] - 观察事件句柄
   */
  constructor(options) {
    this.$options = {
      ...Watcher.options,
      ...options
    }

    this._data = this.$options.data

    // 实例初始化完成
    if (this.$immediate) {
      this.emit(this.$data)
    }
  }

  /**
   * 实例数据
   *
   * @since 1.0.0
   * @private
   * @readonly
   */
  _data = null

  /**
   * 实例初始配置项
   *
   * @since 1.0.0
   * @readonly
   */
  $options = undefined

  /**
   * 获取deep标记
   *
   * @since 1.0.0
   * @getter
   * @readonly
   * @returns {string}
   */
  get $deep() {
    return this.$options.deep
  }

  /**
   * 获取immediate标记
   *
   * @since 1.0.0
   * @getter
   * @readonly
   * @returns {string}
   */
  get $immediate() {
    return this.$options.immediate
  }

  /**
   * 获取观察事件句柄
   *
   * @since 1.0.0
   * @getter
   * @readonly
   * @returns {string}
   */
  get $handler() {
    return this.$options.handler
  }

  /**
   * 获取原始数据
   *
   * @since 1.0.0
   * @getter
   * @readonly
   * @returns {string}
   */
  get $data() {
    return this._data
  }

  /**
   * 触发事件
   *
   * @since 1.0.0
   * @param {*} newData - 新数据
   */
  emit(newData) {
    // 如果newData是普通类型值，则都会触发emit
    // 如果newData是对象型值，则需判断如下条件决定是否触发emit，否则一定会触发emit
    // 1. newData是对象类型值
    // 2. newData值与原始值是相同的对象
    // 3. 启用了深度观察模式，

    // 如果值未发生变化，则不触发事件
    if (this.$data === newData) {
      // 普通类型
      if (!validation.isPlainObject(newData)) {
        return this
      }

      // 对象类型
      if (!this.$deep) {
        return this
      }
    }

    this.$handler(this.$data, newData)
    this._data = newData

    return this
  }
}

export default Watcher