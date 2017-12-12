/**
 * @file 数据模型类
 * @author lisfan <goolisfan@gmail.com>
 * @version 1.1.0
 * @licence MIT
 */

import validation from '@~lisfan/validation'
import Logger from '@~lisfan/logger'
import Computer from './computer'

// 数据模型的实例计数器
let counter = 0

/**
 * 私有方法集合
 * @private
 */
const _actions = {
  // 可变与不可变联合的键列表
  getUnionStructure(self) {
    const ctr = self.constructor

    return {
      ...ctr.STRUCTURE,
      ...ctr.IMMUTABLE_STRUCTURE
    }
  },
  /**
   * 初始化数据
   * @param self
   * @param data
   */
  initData(self, data) {
    const ctr = self.constructor

    const UNION_STRUCTURE = _actions.getUnionStructure(self)

    Object.keys(UNION_STRUCTURE).forEach((key) => {
      if (key in ctr.IMMUTABLE_STRUCTURE) {
        self._data[key] = _actions.getValue(ctr.IMMUTABLE_STRUCTURE[key])
      } else {
        self._data[key] = _actions.getValue(data[key], ctr.STRUCTURE[key])
      }

      // 如果数据不可变，则不可重设该值
      // 建立事件取值器，和赋值器
      Object.defineProperty(self, key, {
        get: function proxyReactiveGetter() {
          return self._data[key]
        },

        set: function proxyReactiveSetter(val) {
          self._data[key] = val
        }
      })
    })
  },
  /**
   * 获取结果值
   * - 若新值存在，则使用新值
   * - 若新值不存为undefined，则使用默认值代替
   *
   * @param {*} newVal - 新值
   * @param {*} defaultVal - 新值不存在时，使用默认值替代
   * @private
   * @returns {*} 返回新值，或原始值
   */
  getValue(newVal, defaultVal) {
    if (!validation.isUndefined(newVal)) {
      return newVal
    }

    return _actions.cloneDeep(defaultVal)
  },
  /**
   * 深拷贝数据
   * 如果是数组或者纯对象，则进行深拷贝，否则返回原数据
   *
   * @param {*} val - 数据
   * @returns {*}
   */
  cloneDeep(val) {
    // 判断一下默认值是否为数组和对象，若是则创建一份拷贝
    if (!validation.isArray(val) && !validation.isPlainObject(val)) {
      return val
    }

    let newVal = {}
    Object.entries(val).forEach(([key, value]) => {
      // 如果是对象或数组，则进行递归
      newVal[key] = _actions.cloneDeep(value)
    })

    return validation.isArray(val) ? Object.values(newVal) : newVal
  },

  // 提取存在于实例结构中的数据
  pickData(self, data) {
    const UNION_STRUCTURE_LIST = Object.keys(_actions.getUnionStructure(self))

    const pickedData = {}
    Object.entries(data).forEach(([key, value]) => {
      // 存在该键时，取出
      if (UNION_STRUCTURE_LIST.indexOf(key) >= 0) {
        pickedData[key] = value
      }
    })

    return pickedData
  },
  /**
   * 批量设置实例数据
   *
   *
   * @param {object} data - 接口数据
   * @returns {*} 返回实例自身
   */
  setData(self, data) {

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
   * @since 1.1.0
   * @static
   * @override
   */
  static STRUCTURE = {}

  /**
   * 定义数据模型结构中不可变的数据字段
   * [注] 继承类需要覆盖此静态属性
   *
   * @since 1.1.0
   * @static
   * @override
   */
  static IMMUTABLE_STRUCTURE = {}

  /**
   * 定义数据模型结构中不可变的数据字段
   * [注] 继承类需要覆盖此静态属性
   *
   * @since 1.1.0
   * @static
   * @override
   */
  static NEW_STRUCTURE = {}

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

    _actions.initData(this, data)

    return this
  }

  /**
   * 日志打印器，方便调试
   *
   * @since 1.1.0
   * @private
   */
  _logger = undefined

  _computer = {}

  /**
   * 实例唯一ID
   *
   * @since 1.1.0
   * @private
   */
  $uid = counter++

  /**
   * 实例创始化时间戳
   *
   * @since 1.1.0
   * @private
   */
  $createdTimeStamp = new Date().getTime()

  /**
   * 实例数据更新时间戳
   *
   * @since 1.1.0
   * @private
   */
  $updatedTimeStamp = new Date().getTime()

  /**
   * 获取打印器实例的名称标记
   *
   * @since 1.1.0
   * @getter
   * @readonly
   * @returns {string}
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
   * @returns {boolean}
   */
  get $debug() {
    return this._logger.$debug
  }

  /**
   * 数据存储集合
   *
   * @since 1.1.0
   * @private
   */
  _data = {}

  /**
   * 获取实例模型数据集合
   *
   * @returns {object}
   */
  get $data() {
    const UNION_STRUCTURE = _actions.getUnionStructure(this)

    let getedData = {}
    Object.keys(UNION_STRUCTURE).forEach((key) => {
      getedData[key] = this._data[key]
    })

    return getedData
  }

  /**
   * 设置实例属性数据
   * - 若键名存在于不可变枚举中，则不会被覆盖并抛出提醒
   * - 设置值时，请同时保证值存在于数据模型结构中
   *
   * @since 1.1.0
   * @param {string} key - 键名
   * @param {*} value - 数据值
   * @returns {DataModel}
   */
  setValue(key, value) {
    // 获取继承类构造函数
    const ctr = this.constructor

    // 若键名存在于不可变枚举中，则不覆盖，并抛出提示
    if (key in ctr.IMMUTABLE_STRUCTURE) {
      this._logger.warn(`(${key}) key is not writable! please check.`)
      return this
    }

    if (!(key in ctr.STRUCTURE)) {
      this._logger.warn(`(${key}) key is not exist! please check.`)
      return this
    }

    this._data[key] = value
    this.$updatedTimeStamp = new Date().getTime()

    return this
  }

  /**
   * 更新数据
   * 如果传入的数据属于该实例的数据模型字段，则过滤
   *
   * @param {object} data - 新数据
   * @returns {DataModel}
   */
  updateData(data) {
    // 过滤掉不存于数据模型中的字段
    const pickedData = _actions.pickData(this, data)

    Object.entries(pickedData).forEach(([key, value]) => {
      this.setValue(key, value)
    })

    return this
  }

  /**
   * 基于当前进行扩展
   */
  extend(options) {
    const ctr = this.constructor
    const ExtendClass = function (data) {
      // return new ctr(data)
      // ctr.apply(this, []) //第二次调用父类构造函数
    }

    ExtendClass.STRUCTURE = {
      ...ctr.STRUCTURE,
      ...options.STRUCTURE
    }

    ExtendClass.prototype = new ctr()
    ExtendClass.prototype.constructor = ExtendClass

    return ExtendClass
  }

  /**
   * 计算值
   */
  compute(key, done) {
    // key值判断，若已存在，则提示错误
    const UNION_STRUCTURE = _actions.getUnionStructure(this)

    if (Object.keys(UNION_STRUCTURE).indexOf(key) >= 0) {
      this._logger.error(`computer key (${key}) has existed! please use other name`)
    }

    const definedProperty = {}

    if (validation.isFunction(done)) {
      definedProperty.get = () => {
        return done.call(this)
      }
      definedProperty.set = () => {
      }
    } else {
      definedProperty.get = () => {
        return done.get.call(this)
      }
      definedProperty.set = (val) => {
        done.set.call(this, val)
      }
    }

    this._computer[key] = new Computer(definedProperty)

    // 如果数据不可变，则不可重设该值
    // 建立事件取值器，和赋值器
    // todo 警告watch的值与别的值相同了
    Object.defineProperty(this, key, {
      get: function proxyComputeGetter() {
        return this._computer[key].$value
      },
      set: function proxyComputeSetter(val) {
        return this._computer[key].$set(val)
      }
    })

    return this
  }

  /**
   * 计算值
   */
  compute2(key, done) {
    // this._computer[key] = done
    const definedProperty = done

    if (validation.isFunction(done)) {
      definedProperty.get = done
      definedProperty.set = () => {
      }
    }

    const UNION_STRUCTURE = _actions.getUnionStructure(this)

    // 存在时，提示错误
    if (Object.keys(UNION_STRUCTURE).indexOf(key) >= 0) {
      this._logger.error(`compute key (${key}) has existed! please use other name`)
    }

    // 如果数据不可变，则不可重设该值
    // 建立事件取值器，和赋值器
    // todo 警告watch的值与别的值相同了
    Object.defineProperty(this, key, {
      get: function computeGetter() {
        return definedProperty.get.call(this)
      },
      set: function computeSetter(val) {
        return definedProperty.set.call(this, val)
      }
    })

    return this
  }

  /**
   * 数据变动检测
   * 被重新调用的时候
   *
   * @param key
   * @param done
   */
  watch(key, done) {

  }
}

export default DataModel