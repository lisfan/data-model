/**
 * @file 计算类
 */

/**
 * @classdesc 计算类
 *
 * @class
 */
class Computer {
  /**
   * 构造函数
   *
   * @param {object} options - 配置参数
   * @param {function} [options.get] - 设置存值描述符
   * @param {function} [options.set] - 设置取值描述符
   */
  constructor(options) {
    this.$options = options
  }

  /**
   * 实例初始配置项
   *
   * @since 1.0.0
   *
   * @readonly
   *
   * @type {object}
   */
  $options = undefined

  /**
   * 获取取值器函数
   *
   * @since 1.0.0
   *
   * @getter
   * @readonly
   *
   * @type {function}
   */
  get $get() {
    return () => {
      this._value = this.$options.get()
      this._computed = true
    }
  }

  /**
   * 获取赋值器函数
   *
   * @since 1.0.0
   *
   * @getter
   * @readonly
   *
   * @type {function}
   */
  get $set() {
    return this.$options.set
  }

  /**
   * 存取是否已计算状态
   *
   * @since 1.0.0
   *
   * @private
   */
  _computed = undefined

  /**
   * 获取实例惰性值
   * 避免重复求值计算
   *
   * @since 1.0.0
   *
   * @getter
   * @readonly
   *
   * @type {boolean}
   */
  get $computed() {
    return this._computed
  }

  /**
   * 存取求值结果
   *
   * @since 1.0.0
   *
   * @private
   */
  _value = undefined

  /**
   * 获取实例值结果
   * 为避免重复求值计算，内部会根据$computed的值进行惰性求值
   *
   * @since 1.0.0
   *
   * @getter
   * @readonly
   *
   * @type {string}
   */
  get $value() {
    // 重新计算
    // !this.$computed && this.$get()
    this.$get()

    return this._value
  }
}

export default Computer