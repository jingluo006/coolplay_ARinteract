import * as tf from '@tensorflow/tfjs'
export class Webcam {
  /**
   * HTMLVideoElement 接口提供了用于操作视频对象的特殊属性和方法
   * @param {HTMLVideoElement} webcamElement A HTMLVideoElement representing the webcam feed.
   */
  constructor(webcamElement) {
    this.webcamElement = webcamElement
  }

  // 捕获
  capture() {
    return tf.tidy(() => {
      // 将图片转为tensor [224, 224, 3]
      const webcamImage = tf.browser.fromPixels(this.webcamElement)
      // 翻转 (保证是镜像的)
      const reverseImage = webcamImage.reverse(1)
      // 裁剪(调用下面的方法)
      const cropImage = this.cropImage(reverseImage)
      // 增加一个维度, 变为[1, 224, 224, 3]，第一个参数应该表示一张图片（盲猜）
      const batchImage = cropImage.expandDims(0)
      // 将数据压缩成-1 到 1 之间然后返回
      return batchImage.toFloat().div(tf.scalar(127)).sub(tf.scalar(1))
    })
  }

  // 裁剪图像，得到一个没有空白的正方形图像
  cropImage(img) {
    // img: [224, 224, 3]  彩色的
    // 1、size：取高和宽的小值
    // 2、beginHeight 就是去掉那些多的部分开始
    const size = Math.min(img.shape[0], img.shape[1])
    const centerHeight = img.shape[0] / 2
    const beginHeight = centerHeight - size / 2
    const centerWidth = img.shape[1] / 2
    const beginWidth = centerWidth - size / 2
    // 3、用slice 方法裁剪 (第一个参数是三个维度开始的位置，第二个参数为裁剪的尺寸)
    return img.slice([beginHeight, beginWidth, 0], [size, size, 3])
  }

  // 调整图像大小
  adjustVideoSize(width, height) {
    const aspectRatio = width / height
    if (width >= height) {
      this.webcamElement.width = height * aspectRatio
    } else {
      this.webcamElement.height = width / aspectRatio
    }
  }

  // 初始化摄像头
  async setup() {
    // Navigator 对象包含有关浏览器的信息。
    // 1、navigator.getUserMedia(constraints) 调用摄像头 (Devices意为设备)
    // 2、stream 是流，也就是轨道，包含视频轨道（来自硬件或者虚拟视频源，比如相机、视频采集设备和屏幕共享服务等等）和 音频轨道（麦克风、A/D 转换器）
    // 3、srcObject这个对象提供了一个与HTMLMediaElement关联的媒体源
    return new Promise((resolve, reject) => {
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia
      if (navigator.getUserMedia) {
        navigator.getUserMedia(
          { video: { width: 224, height: 224 } },
          (stream) => {
            this.webcamElement.srcObject = stream
            this.webcamElement.addEventListener(
              'loadeddata',
              async () => {
                this.adjustVideoSize(this.webcamElement.videoWidth, this.webcamElement.videoHeight)
                resolve()
              },
              false
            )
          },
          (error) => {
            reject(error)
          }
        )
      } else {
        reject(new Error('摄像头获取失败'))
      }
    })
  }
}
