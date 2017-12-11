/**
 * @file 数据模型类
 * @author lisfan <goolisfan@gmail.com>
 * @version 1.1.0
 * @licence MIT
 */

import validation from '@~lisfan/validation'
import Logger from '@~lisfan/validation'
// 数据模型的实例计数器

let counter = 0
/**
 * 私有方法集合
 * @private
 */
const _actions = {
  /**
   * 设置新值，新值不存在时，使用默认值代替
   * @param {*} newValue - 新值
   * @param {*} defaultValue - 新值不存在时，使用默认值替代
   * @private
   * @return {*} 返回新值，或原始值
   */
  setValue(newValue, defaultValue) {
    if (!_.isUndefined(newValue)) {
      return newValue
    }

    // 判断一下默认值是否为数组和对象，若是则创建一份拷贝
    if (_.isArray(defaultValue) || _.isObject(defaultValue)) {
      return _.cloneDeep(defaultValue)
    }

    return defaultValue
  },
  /**
   * 数据更新时间戳
   * @param {*} self - 当前实例
   */
  updatedTime(self) {
    self.$updatedTimeStamp = new Date().getTime()
  },
}

class DataModel {
  /**
   * 默认配置选项
   *
   * @since 1.1.0
   * @static
   * @readonly
   * @memberOf DataModel
   * @property {boolean} debug=false - 打印器调试模式是否开启
   * @property {string} name='DataModel' - 打印器名称标记
   */
  static options = {
    debug: false,
    name: 'DataModel',
  }

  /**
   * 更新默认配置选项
   *
   * @since 1.1.0
   * @static
   * @param {object} options - 配置选项
   * @param {boolean} [options.debug=false] - 打印器调试模式是否开启
   * @param {string} [options.name='DataModel'] - 打印器名称标记
   */
  static config(options) {
    DataModel.options = {
      ...DataModel.options,
      ...options
    }

    return DataModel
  }

  /**
   * 定义数据模型结构及初始默认值
   * [注] 继承类需要覆盖此静态属性
   *
   * @since 1.0.0
   * @static
   * @override
   */
  static STRUCTURE = {}

  /**
   * 定义数据模型结构中不可变的数据字段
   * [注] 继承类需要覆盖此静态属性
   *
   * @since 1.0.0
   * @static
   * @override
   */
  static INVARIANT_STRUCTURE = {}

  $uid = ++counter // 该实例的唯一id(生成后就不再发生变化)
  $createdTimeStamp = new Date().getTime()  // 实例初始化的时间戳
  $updatedTimeStamp = new Date().getTime()  // 每次数据更新时，时间戳就会更新

  /**
   * 构造函数
   *
   * @param {object} [data={}] - 实例化的数据
   */
  constructor(data = {}) {
    // 获取继承类构造函数
    const ctr = this.constructor

    // 初始化打印器实例
    this._logger = new Logger({
      ...DataModel.options,
      ...ctr.options
    })

    // 使用给定的数据进行实例数据结构初始化
    const STRUCTURE = {
      ...ctr.STRUCTURE,
      ...ctr.INVARIANT_STRUCTURE
    }

    // 处理数据
    const transformData = this._transformData(data)

    Object.keys(STRUCTURE).forEach((key) => {
      // 如果数据不可变，则不可重设该值
      if (key in ctr.INVARIANT_STRUCTURE) {
        this[key] = _actions.setValue(ctr.INVARIANT_STRUCTURE[key])
      } else {
        this[key] = _actions.setValue(transformData[key], ctr.STRUCTURE[key])
      }
    })

    return this
  }

  /**
   * 日志打印器，方便调试
   *
   * @since 1.1.0
   * @private
   */
  _logger = undefined

  /**
   * 获取打印器实例的名称标记
   *
   * @since 1.1.0
   * @getter
   * @readonly
   * @return {string}
   */
  get $name() {
    return this._logger.$name
  }

  /**
   * 获取实例的调试配置项
   *
   * @since 1.1.0
   * @getter
   * @readonly
   * @return {boolean}
   */
  get $debug() {
    return this._logger.$debug
  }

  /**
   * 设置实例属性数据
   * - 若键名存在于不可变枚举中，则不会被覆盖并抛出提醒
   * - 设置值时，请同时保证值存在于数据模型结构中

   * @since 1.1.0
   * @param {string} key - 键名
   * @param {*} value - 数据值
   * @return {DataModel}
   */
  setValue(key, value) {
    // 获取继承类构造函数
    const ctr = this.constructor

    // 若键名存在于不可变枚举中，则不覆盖，并抛出提示
    if (key in ctr.INVARIANT_STRUCTURE) {
      this._logger.warn(`(${key}) key is not writable! please check.`)
      return this
    }

    if (!(key in ctr.STRUCTURE)) {
      this._logger.warn(`(${key}) key is not exist! please check.`)
      return this
    }

    this[key] = value
    this.$updatedTimeStamp = new Date().getTime()

    return this
  }

  /**
   * 转换源数据
   * 推荐只有数据模型中各个字段之间进行相互操作
   * [继承类可以覆盖此方法，进行自定义]
   *
   * @param {object} data - 接口数据
   * @return {*} 返回转换后的数据
   */
  _transformData(data) {
    return data
  }

  /**
   * 设置实例数据
   * [继承类可以覆盖此方法，进行自定义]
   *
   * 若数据中的键名不存在于实例中，则进行Vue.set
   *
   * @param {object} data - 接口数据
   * @return {*} 返回实例自身
   */
  _setData(data) {
    Object.entries(data).forEach(([key, value]) => {
      // 判断是否存在该字段，若存在，则进行更新，若不存在，则进行重新监察
      this.setValue(key, value)
    })

    return this
  }

  /**
   * 获取业务对象的数据结构
   * [继承类可以覆盖此方法，进行自定义]
   *
   * @return {object} 返回实例数据结构
   */
  _getData() {
    let data = {}
    Object.keys(this.constructor.STRUCTURE).forEach((key) => {
      data[key] = this[key]
    })

    return data
  }

  /**
   * 填充数据
   * - 依赖于实例的数据模型，会过滤不存在于实例中的数据模型字段
   * - [注]会全部替换为新数据，不会合并
   * @param {object} newData - 接口数据
   * @return {*} 返回实例自身
   */
  fillData(newData) {
    const reflectedData = _actions.reflectData(this.constructor.REFLECT_MODEL, newData)

    const transformData = this._transformData(reflectedData)

    // 过滤掉不存于数据模型中的字段
    const pickedData = _.pick(transformData, Object.keys(this.constructor.STRUCTURE))

    return this._setData(pickedData)
  }

  /**
   * 更新数据
   * - 依赖于实例的数据模型，会过滤不存在于实例中的数据模型字段
   *
   * @param {object} newData - 新数据
   * @return {*} 返回实例自身
   */
  updateData(newData) {
    const reflectedData = _actions.reflectData(this.constructor.REFLECT_MODEL, newData)

    const transformData = this._transformData(reflectedData)

    // 过滤掉不存于数据模型中的字段
    const pickedData = _.pick(transformData, Object.keys(this.constructor.STRUCTURE))

    return this._setData(_.merge(this._getData(), pickedData))
  }

  /**
   * 覆盖数据
   * - 新数据中不存在的键名，内部会通过Vue.set设置，建立响应
   * @param {object} newData - 新数据
   * @return {*} 返回实例自身
   */
  mergeData(newData) {
    const reflectedData = _actions.reflectData(this.constructor.REFLECT_MODEL, newData)

    const transformData = this._transformData(reflectedData)

    return this._setData(_.merge(this._getData(), transformData))
  }

}

export default DataModel