/**
 * @file 数据存储类
 */

class Storer {
  /**
   * 更新默认配置选项
   *
   * @since 1.0.0
   *
   * @static
   * @readonly
   * @memberOf Storer
   *
   * @type {object}
   * @property {string} data=undefined - 初始数据值，会被JSON.stringify转换成字符串
   * @property {boolean} deep=false - 是否深入观察数据变化
   * @property {boolean} immediate=false - 是否立即执行一次事件句柄
   * @property {function} handler=()=>{} - 观察事件句柄
   */
  static options = {
    data: undefined,
    // watcher: undefined,
    // computers: {},
    // get() {
    // },
    // set() {
    // }
  }

  /**
   * 构造函数
   *
   * @see Storer.options
   *
   * @param {object} data - 配置选项见{@link Storer.options}
   */
  constructor(data) {
    this.update(data)
  }

  /**
   * 实例初始配置项
   *
   * @since 1.0.0
   *
   * @readonly
   */
  // $options = undefined

  _data = undefined

  get $data() {
    return this._data
  }

  _watcher = undefined

  get $watcher() {
    return this._watcher
  }

  _computers = {}

  get $computers() {
    return this._computers
  }

  update(data) {
    this._data = data
  }

  addWatcher(watcher) {
    this._watcher = watcher
  }

  addComputer(key, computer) {
    this._computers[key] = computer
  }
}

export default Storer