/**
 * @file 数据模型类
 */

import validation from '@~lisfan/validation'

const _ = {
  /**
   * 以对象路径方式的方式设置对象的值
   * 如果对象本身的链路中段不存在值的，则会将其链路设置为新对象
   *
   * @since 1.0.0
   *
   * @param {object} obj - 被设置的对象
   * @param {string} path - 路径地址
   * @param {*} value - 实例自身
   *
   * @returns {object}
   */
  set(obj, path, value) {
    // [注] 不使用eval
    const pathList = path.split('.')
    const pathListLen = pathList.length

    return pathList.reduce((result, key, index) => {
      // 如果已经查询到最后一个对象值，则进行值设定
      if (index === pathListLen - 1) {
        result[key] = value
        return result
      }

      // 判断当前链路是否可取值
      // 当前路径不存在值
      // 当前路径不是对象
      if (!result[key] || !validation.isPlainObject(result[key])) {
        result[key] = {}
      }

      return result[key]
    }, obj)
  },
  /**
   * 深拷贝数据
   * - 若是数组或者纯对象，则进行深拷贝
   * - 否则返回原数据
   *
   * @since 1.0.0
   *
   * @param {*} val - 待拷贝数据
   *
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
      newVal[key] = _.cloneDeep(value)
    })

    return validation.isArray(val) ? Object.values(newVal) : newVal
  },
  /**
   * 递归合并来源对象的键值。 跳过来源对象解析为 undefined 的属性
   *
   * @since 1.0.0
   *
   * @param {object} targetDict - 目标对象
   * @param {object[]} mergeDictList - 来源对象列表
   *
   * @returns {*} 返回新对象
   */
  merge(targetDict, ...mergeDictList) {
    // 如果是对象，则拷贝一份数据
    // const newObj = _actions.cloneDeep(targetDict)

    mergeDictList.forEach((mergeDict) => {
      Object.keys(mergeDict).forEach((key) => {
        // 主数据字典也存在该值且是字段数据时
        // 且子对象也是对象的时候
        if (validation.isPlainObject(targetDict[key]) && validation.isPlainObject(mergeDict[key])) {
          return targetDict[key] = _.merge(targetDict[key], mergeDict[key])
        }

        // 被合并值不存在时，使用默认值代替
        targetDict[key] = mergeDict[key] || targetDict[key]
      })
    })

    return targetDict
  },
  /**
   * 获取结果值
   * - 若新值存在，则使用新值
   * - 若新值为undefined，则使用默认值代替
   *
   * @since 1.0.0
   *
   * @param {*} newVal - 新值
   * @param {*} defaultVal - 新值不存在时，使用默认值替代
   *
   * @returns {*}
   */
  getValue(defaultVal, newVal) {
    // 新值存在
    if (!validation.isUndefined(newVal)) {
      // 如果是纯对象，则进行合并
      if (validation.isPlainObject(newVal)) {
        return _actions.merge(_actions.cloneDeep(defaultVal), newVal)
      }

      // 否则直接返回值
      return newVal
    }

    // 深拷贝数据
    return _actions.cloneDeep(defaultVal)
  },
  /**
   * 初始化数据，并定义存取描述符
   *
   * @sicne 1.0.0
   *
   * @param {DataModel} self - 实例自身
   * @param {object} data - 初始化数据
   */
  init(self, data) {
    const ctr = self.constructor

    const UNION_STRUCTURE = _actions.getUnionStructure(self)

    Object.keys(UNION_STRUCTURE).forEach((key) => {
      if (key in ctr.IMMUTABLE_STRUCTURE) {
        // 不可变数据的字段
        self._data[key] = _actions.getValue(ctr.IMMUTABLE_STRUCTURE[key])
      } else {

        self._data[key] = _actions.getValue(ctr.STRUCTURE[key], data[key])
      }
    })

    // 建立data的存取描述符
    _actions.defineDataProperty(self)
  },

  /**
   * 提取只属于该实例属性的数据
   *
   * @since 1.0.0
   *
   * @param {DataModel} self - 实例自身
   * @param {object} data - 初始化数据
   *
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
}

export default _