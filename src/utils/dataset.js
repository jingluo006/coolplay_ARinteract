import * as tf from '@tensorflow/tfjs'
export class Dataset {
  constructor() {
    this.labels = []
  }

  // 添加样本
  // xs 为特征，labels 为标签
  addExample(example, label) {
    if (this.xs == null) {
      this.xs = tf.keep(example)
      this.labels.push(label)
    } else {
      const oldX = this.xs
      // 将旧的和新的example 拼接起来，第二个参数0 表示冲一维开始拼接
      this.xs = tf.keep(oldX.concat(example, 0))
      this.labels.push(label)
      oldX.dispose()
    }
  }

  // 将标签转化为想要的tensor
  // 这里的oneHot方法：这里输入的是一维标签，比如说是[0, 1, 2, 3]，四个模型都输入了，用了oneHot方法之后，因为第二个参数传的是4， 所以变为4个2 维数组：
  // [[1,0,0,0], [0,1,0,0], [0,0,1,0], [0,0,0,1]] , shape:[4, 4]
  // 如果是只添加了三个模型，那shape:[3, 4], 这三个模型二维里面哪个对应是1 就看是那个方向的了，跟他们的id 相关
  encodeLabels(numClasses) {
    for (let i = 0; i < this.labels.length; i++) {
      if (this.ys == null) {
        this.ys = tf.keep(
          tf.tidy(() => {
            return tf.oneHot(tf.tensor1d([this.labels[i]]).toInt(), numClasses)
          })
        )
      } else {
        const y = tf.tidy(() => {
          return tf.oneHot(tf.tensor1d([this.labels[i]]).toInt(), numClasses)
        })
        const oldY = this.ys
        this.ys = tf.keep(oldY.concat(y, 0))
        oldY.dispose()
        y.dispose()
      }
    }
  }
}
