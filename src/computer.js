/**
 * @file 值计算类
 * @author lisfan <goolisfan@gmail.com>
 * @version 1.0.0
 * @licence MIT
 */

class Computer {
  /**
   * @param {object} options - 配置参数
   * @param {function} [options.get] - 设置存值描述符
   * @param {function} [options.set] - 设置取值描述符
   */
  constructor(options) {
    this.$options = options
  }

  /**
   * 实例配置项
   *
   * @since 1.0.0
   * @readonly
   */
  $options = undefined

  /**
   * 获取取值器函数
   *
   * @since 1.0.0
   * @getter
   * @readonly
   * @returns {string}
   */
  get $get() {
    return () => {
      this._value = this.$options.get()
      this.$computed = true
    }
  }

  /**
   * 获取赋值器函数
   *
   * @since 1.0.0
   * @getter
   * @readonly
   * @returns {string}
   */
  get $set() {
    return this.$options.set
  }

  /**
   * 取值结果
   *
   * @since 1.0.0
   * @private
   */
  _value = undefined

  /**
   * 获取实例惰性值
   * 避免重复求值计算
   *
   * @since 1.0.0
   * @getter
   * @readonly
   * @returns {string}
   */
  get $value() {
    if (this.$computed) {
      return this._value
    }

    // 重新计算
    this.$get()
    return this._value
  }

  /**
   * 取值结果的状态
   *
   * @since 1.0.0
   * @returns {string}
   */
  $computed = false
}

export default Computer