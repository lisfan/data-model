/**
 * @file 数据模型类
 * @author lisfan <goolisfan@gmail.com>
 * @version 1.1.0
 * @licence MIT
 */

import DataModel from './data-model'

class ExtendDataModel extends DataModel {

  static STRUCTURE = {
    id: 10,
    name: 20,
    height: 168,
    weight: 78,
    list: [1],
    union: {
      id: 10,
      name: 'msl',
      subUnion: {
        age: 28,
        price: '10000w'
      }
    }
  }

  static IMMUTABLE_STRUCTURE = {
    isHandsome: true
  }

  constructor(data) {
    super(data)
  }
}

export default ExtendDataModel