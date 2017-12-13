/**
 * @file 数据模型类
 * @author lisfan <goolisfan@gmail.com>
 * @version 1.1.0
 * @licence MIT
 */

import validation from '@~lisfan/validation'
import Logger from '@~lisfan/logger'
import Computer from './computer'
import Watcher from './watcher'

// 实例的UID计数器
let counter = 0

// 私有方法
const _actions = {
  /**
   * 获取数据模型的可变与不可变的联合集合
   *
   * @param {DataModel} self - 实例自身
   * @returns {object}
   */
  getUnionStructure(self) {
    const ctr = self.constructor

    return {
      ...ctr.STRUCTURE,
      ...ctr.IMMUTABLE_STRUCTURE
    }
  },
  /**
   * 递归定义对象属性
   * @param {DataModel} self - 实例自身
   * @param {object} obj - 定义对象
   * @param {object} data - 实例存储的值对象
   */
  defineProperty(self, obj, data) {
    Object.keys(data).forEach((key) => {
      // 如果数据不可变，则不可重设该值
      // 建立事件取值器，和赋值器
      if (validation.isPlainObject(data[key])) {
        // 不需要递归
        Object.defineProperty(obj, key, {
          get: function reactiveGetter() {
            return _actions.recursiveDefineProperty(data[key])
          },

          set: function reactiveSetter(val) {
            // data[key] = val
            // // 触发watch
            // self._watchers[key] && self._watchers[key].emit(val)
          }
        })
      } else {
        // 不需要递归
        Object.defineProperty(self, key, {
          get: function reactiveGetter() {
            return data[key]
          },

          set: function reactiveSetter(val) {
            // data[key] = val
            // // 触发watch
            // self._watchers[key] && self._watchers[key].emit(val)
          }
        })
      }
    })
  },
  /**
   * 递归定义对象属性
   * @param {DataModel} self - 实例自身
   * @param {object} obj - 定义对象
   * @param {object} data - 实例存储的值对象
   */
  recursiveDefineProperty(data) {
    const objTemp = {}

    Object.keys(data).forEach((subKey) => {
      console.log('subKey', subKey)
      if (validation.isPlainObject(data[subKey])) {
        Object.defineProperty(objTemp, subKey, {
          get: function reactiveGetter() {
            return _actions.recursiveDefineProperty(data[subKey])
          },
          set: function reactiveSetter() {

          }
        })
      } else {
        Object.defineProperty(objTemp, subKey, {
          get: function reactiveGetter() {
            return data[subKey]
          },
          set: function reactiveSetter() {

          }
        })
      }
    })

    return objTemp
  },
  /**
   * 深拷贝数据
   * 如果是数组或者纯对象，则进行深拷贝，否则返回原数据
   *
   * @param {*} val - 待拷贝数据
   * @returns {*}
   */
  cloneDeep(val) {
    // 判断一下默认值是否为数组和对象，若是则创建一份拷贝
    if (!validation.isArray(val) && !validation.isPlainObject(val)) return val

    let newVal = {}

    Object.entries(val).forEach(([key, value]) => {
      // 如果是对象或数组，则进行递归
      newVal[key] = _actions.cloneDeep(value)
    })

    return validation.isArray(val) ? Object.values(newVal) : newVal
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

    // 深拷贝数据
    return _actions.cloneDeep(defaultVal)
  },
  /**
   * 初始化数据，并定义属性描述符
   *
   * @param {DataModel} self - 实例自身
   * @param {object} data - 初始化数据
   */
  init(self, data) {
    const ctr = self.constructor

    const UNION_STRUCTURE = _actions.getUnionStructure(self)

    Object.keys(UNION_STRUCTURE).forEach((key) => {
      if (key in ctr.IMMUTABLE_STRUCTURE) {
        self._data[key] = _actions.getValue(ctr.IMMUTABLE_STRUCTURE[key])
      } else {
        self._data[key] = _actions.getValue(data[key], ctr.STRUCTURE[key])
      }
    })

    // 如果数据不可变，则不可重设该值
    // 建立事件取值器，和赋值器
    _actions.defineProperty(self, self, self._data)
  },

  /**
   * 提取只属于该实例属性的数据
   *
   * @param {DataModel} self - 实例自身
   * @param {object} data - 初始化数据
   * @returns {object}
   */
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
  // /**
  //  * 批量设置实例数据
  //  *
  //  * @param {object} data - 接口数据
  //  * @returns {*} 返回实例自身
  //  */
  // setData(self, data) {
  //
  // },
  // /**
  //  * 数据更新时间戳
  //  * @param {*} self - 当前实例
  //  */
  // updatedTime(self) {
  //   self.$updatedTimeStamp = new Date().getTime()
  // },
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
   * 定义数据模型结构，及设置初始默认值
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
   * 构造函数
   *
   * @param {object} [data={}] - 实始化数据
   */
  constructor(data = {}) {
    // 获取继承类构造函数
    const ctr = this.constructor

    // 初始化打印器实例
    this._logger = new Logger({
      ...DataModel.options,
      ...ctr.options
    })

    // 数据初始化绑定
    _actions.init(this, data)

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
   * 计算器实例集合
   *
   * @since 1.1.0
   * @private
   */
  _computers = {}

  /**
   * 观察者实例集合
   *
   * @since 1.1.0
   * @private
   */
  _watchers = {}

  /**
   * 实例唯一ID
   *
   * @since 1.1.0
   * @readonly
   */
  $uid = counter++

  /**
   * 实例初始化时间戳
   *
   * @since 1.1.0
   * @readonly
   */
  $createdTimeStamp = new Date().getTime()

  /**
   * 实例数据发生更新时的时间戳
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
   * @todo 可以改进为不使用getter取值，自动来
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
   * 设置实例属性的新数据
   * 1. 若指定的键名存在于实例模型不可变数据结构中，则无法被设置为新数据，并会抛出警告提醒
   * 2. 若指定的键名存在不存在于实例模型数据结构中，则会过滤，则抛出警告提醒
   *
   * @todo 支持路径定义
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
   * 更新整个数据模型结构的新数据
   * 2. 若指定的键名存在不存在于实例模型数据结构中，则会过滤，则抛出警告提醒
   *
   * @param {object} data - 新数据
   * @returns {DataModel}
   */
  updateData(data) {
    // 过滤掉不存于数据模型结构中的字段
    const pickedData = _actions.pickData(this, data)

    Object.entries(pickedData).forEach(([key, value]) => {
      this.setValue(key, value)
    })

    return this
  }

  /**
   * 基于当前进行扩展
   * @todo 未完成
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
   * compute值
   * [注] 内部会进行惰性求值
   * 设置的key名，不能是已存在于数据模型结构中的值
   * 若其检测的值未发生变化，则不会重新求值，取上一次的求值结果
   *
   * @param {string} key - 要计算的字段名
   * @param {object|function} options - 值类型为函数时，函数会当成computer实例配置项的get存储描述符
   * @param {function} [options.get] - 设置存值描述符
   * @param {function} [options.set] - 设置取值描述符
   * @returns {DataModel}
   */
  computed(key, options) {
    // key值判断，若已存在，则提示错误
    const UNION_STRUCTURE = _actions.getUnionStructure(this)

    if (Object.keys(UNION_STRUCTURE).indexOf(key) >= 0) {
      this._logger.error(`compute key (${key}) has existed! please use other name`)
    }

    // 设置实例化所需的配置选项
    const computerOptions = {}
    const self = this

    if (validation.isFunction(options)) {
      computerOptions.get = function computedGetter() {
        return options.call(self)
      }

      computerOptions.set = function computedSetter() {
      }
    } else {
      computerOptions.get = function computedGetter() {
        return options.get.call(self)
      }

      computerOptions.set = function computedSetter(val) {
        options.set.call(self, val)
      }
    }

    // 实例化
    this._computers[key] = new Computer(computerOptions)

    // 如果数据不可变，则不可重设该值
    // 建立事件取值器，和赋值器
    // todo 警告watch的值与别的值相同了
    Object.defineProperty(this, key, {
      get: function proxyComputedGetter() {
        return self._computers[key].$value
      },
      set: function proxyComputedSetter(val) {
        return self._computers[key].$set(val)
      }
    })

    return this
  }

  /**
   * 观察数据数据变动
   * [误] （不进行判断，因为watch可能会在其他方法调用之后再进行调用） 观察的字段数据必须存在于实例数据模型和computers属性中，否则抛出警告提醒
   * 当被观察的字段数据发生变化（新的数据必须与原数据不同）时，才会触发事件处理句柄
   *
   * @param {string} key - 要观察的字段名
   * @param {object|function} options - 值类型为函数时，函数会当成watcher实例配置项的handler事件句柄
   * @param {string} [options.data=undefined] - 初始数据值，会被JSON.stringify转换成字符串
   * @param {boolean} [options.deep=false] - 是否深入观察数据变化
   * @param {boolean} [options.immediate=false] - 是否立即执行一次事件句柄
   * @param {function} [options.handler=()=>{]} - 观察事件句柄
   * @returns {DataModel}
   */
  watch(key, options) {
    // 设置实例化配置项
    let watcherOptions = {
      data: this[key] // 存储原数据
    }

    if (validation.isFunction(options)) {
      watcherOptions.handler = () => {
        return options.call(this)
      }
    } else {
      watcherOptions = { ...options }
      watcherOptions.handler = () => {
        return options.handler.call(this)
      }
    }

    // 实例化
    this._watchers[key] = new Watcher(watcherOptions)

    return this
  }
}

export default DataModel