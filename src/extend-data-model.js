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
    // origin: {
    //   id: 20,
    //   name: 'xkeshi',
    //   subOrigin: {
    //     id: 30,
    //     age: 30,
    //     name: 'imiaoj',
    //   }
    // },
    // union: {
    //   id: 10,
    //   name: 'msl',
    //   age: 20,
    //   subUnion: {
    //     age: 28,
    //     price: '10000w'
    //   }
    // },
    other: {
      id: 10,
      name: 'other'
    },
  }

  static IMMUTABLE_STRUCTURE = {
    ...DataModel.IMMUTABLE_STRUCTURE,
    ExtendDataModel: true
  }

  constructor(data) {
    super(data)
  }
}

export default ExtendDataModel