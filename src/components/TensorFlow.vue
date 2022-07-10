<template>
  <div class="tensorflow">
    <!-- 摄像头 -->
    <div class="camera_box">
      <div class="camera_container">
        <video id="webcam" ref="webcamRef" autoplay playsinline muted width="224" height="224"></video>
      </div>
    </div>

    <!-- 样本 -->
    <div class="panel">
      <!-- 第一行 -->
      <div class="panel-row panel-row-top">
        <!-- 左侧文字 -->
        <div class="panel-cell panel-cell-left panel-cell-fill">
          <p class="help-text">
            点击方框进行拍照<br />
            用于控制四个方向<br />
            的不同姿势进行模<br />
            拟训练
          </p>
        </div>
        <!-- 顶部相框 -->
        <div class="panel-cell panel-cell-top">
          <div class="thumb-box">
            <div class="thumb-box-outer">
              <!-- 相框 -->
              <div class="thumb-box-inner">
                <canvas class="up-thumb" id="up-thumb" width="224px" height="224px"></canvas>
              </div>
              <!-- 添加按钮 -->
              <!-- 上下左右：0123 -->
              <button class="record-button" id="up" @click="captureSample(0)">
                <span>添加样本</span>
              </button>
            </div>
            <p class="up-total">
              <span>{{ upTotal }}</span>
              examples
            </p>
          </div>
        </div>
        <div class="panel-cell panel-cell-right panel-cell-fill"></div>
      </div>

      <!-- 第二行 -->
      <div class="panel-row panel-row-mid">
        <!-- 左侧相框 -->
        <div class="panel-cell panel-cell-left">
          <div class="thumb-box">
            <div class="thumb-box-outer">
              <!-- 相框 -->
              <div class="thumb-box-inner">
                <canvas class="left-thumb" id="left-thumb" ref="leftthumb" width="224px" height="224px"></canvas>
              </div>
              <!-- 添加按钮 -->
              <!-- 上下左右：0123 -->
              <button class="record-button" id="left" @click="captureSample(2)">
                <span>添加样本</span>
              </button>
            </div>
            <p class="up-total">
              <span>{{ leftTotal }}</span>
              examples
            </p>
          </div>
        </div>
        <!-- 中间的箭头图片 -->
        <div class="panel-cell panel-cell-center panel-cell-fill">
          <img height="120" width="120" src="../image/sxzy.png" />
        </div>
        <!-- 右侧相框 -->
        <div class="panel-cell panel-cell-right">
          <div class="thumb-box">
            <div class="thumb-box-outer">
              <!-- 相框 -->
              <div class="thumb-box-inner">
                <canvas class="right-thumb" id="right-thumb" width="224px" height="224px"></canvas>
              </div>
              <!-- 添加按钮 -->
              <!-- 上下左右：0123 -->
              <button class="record-button" id="right" @click="captureSample(3)">
                <span>添加样本</span>
              </button>
            </div>
            <p class="up-total">
              <span>{{ rightTotal }}</span>
              examples
            </p>
          </div>
        </div>
      </div>

      <!-- 第三行 -->
      <div class="panel-row panel-row-bottom">
        <!-- 底部部相框 -->
        <div class="panel-cell panel-cell-bottom">
          <div class="thumb-box">
            <div class="thumb-box-outer">
              <!-- 相框 -->
              <div class="thumb-box-inner">
                <canvas class="down-thumb" id="down-thumb" width="224px" height="224px"></canvas>
              </div>
              <!-- 添加按钮 -->
              <!-- 上下左右：0123 -->
              <button class="record-button" id="down" @click="captureSample(1)">
                <span>添加样本</span>
              </button>
            </div>
            <p class="up-total">
              <span>{{ downTotal }}</span>
              examples
            </p>
          </div>
        </div>
        <div class="panel-cell panel-cell-right panel-cell-fill"></div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="button_container">
      <button class="train" @click="doTraining">开始训练</button>
      <button class="start" v-if="isTrain" @click="startPredict">开始游戏</button>
      <button class="stop" v-if="isTrain" @click="stopPredict">停止游戏</button>
    </div>
  </div>
</template>

<script>
import * as tf from '@tensorflow/tfjs'
import { Webcam } from '@/utils/webcam.js'
import { Dataset } from '@/utils/dataset.js'
import { mapMutations } from 'vuex'
export default {
  data() {
    return {
      webcam: null, // 摄像头
      // 四个方向样本数量
      upTotal: 0,
      leftTotal: 0,
      rightTotal: 0,
      downTotal: 0,
      mobilenet: null,
      model: null, // 标签
      dataset: null,
      isPredicting: false,
      isTrain: false,
      isPlaying: false,
      THUMB: ['up', 'down', 'left', 'right'],
      thumbDisplayed: {}
    }
  },
  mounted() {
    this.webcam = new Webcam(this.$refs.webcamRef)
    this.dataset = new Dataset()
    this.init()
  },
  methods: {
    // 加载MobileNet模型 (截取前十三层卷积神经网络层)
    async loadedMobileNet() {
      this.mobilenet = await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json')
      // 返回输出内部激活的模型
      const layer = this.mobilenet.getLayer('conv_pw_13_relu')
      return tf.model({
        inputs: this.mobilenet.inputs,
        outputs: layer.output // 这里千万别写成outputs了
      })
    },

    // 添加样本
    captureSample(id) {
      switch (parseInt(id)) {
        case 0:
          this.upTotal++
          break
        case 1:
          this.downTotal++
          break
        case 2:
          this.leftTotal++
          break
        case 3:
          this.rightTotal++
          break
      }
      // 标签
      const label = parseInt(id)
      // 截图图像
      const img = this.webcam.capture()
      // 添加模型数据 (先将图像交给MobileNet来预测)
      this.dataset.addExample(this.mobilenet.predict(img), label)
      // 绘制预览图
      this.drawThumb(img, label)
      img.dispose()
    },

    // 绘制预览图
    drawThumb(img, label) {
      if (this.thumbDisplayed[label] == null) {
        const thumbCanvas = document.getElementById(this.THUMB[label] + '-thumb')
        this.draw(img, thumbCanvas)
      }
    },
    draw(img, canvas) {
      const [width, height] = [224, 224]
      const ctx = canvas.getContext('2d')
      const imageData = new ImageData(width, height)
      // 将img 数据转为一维
      const data = img.dataSync()
      for (let i = 0; i < width * height; i++) {
        const j = i * 4
        imageData.data[j + 0] = (data[i * 3 + 0] + 1) * 127
        imageData.data[j + 1] = (data[i * 3 + 1] + 1) * 127
        imageData.data[j + 2] = (data[i * 3 + 2] + 1) * 127
        imageData.data[j + 3] = 255 // 这是最后一个A通道，透明度
      }
      ctx.putImageData(imageData, 0, 0)
    },

    // 样本训练
    train() {
      // 将ys 转为tensor 格式
      this.ys = null
      this.dataset.encodeLabels(4)
      // 建立 sequential 模型(连续的模型，这一层的输入一定是上一层的输出。)
      this.model = tf.sequential({
        layers: [
          // 下面都是layers
          // flatten：摊平，将高维特征图转化为一维的，因为下一层的dense 要用一维的
          tf.layers.flatten({
            inputShape: this.mobilenet.outputs[0].shape.slice(1)
          }),
          // 两层dense层（全连接层，用dense层的原因是这个层是 输入×权重+偏置然后经过激活函数得到一个输出）
          tf.layers.dense({ units: 100, activation: 'relu' }),
          // 最后一层做分类, 所以神经元个数要和输出个数一样(softmax激活函数简单来说就是将输出压缩为和为1的四个数字（eg：输出的是三个数：0.5, 0.3, 0.1，0.1 是四种类别的概率，三者和为1）)
          tf.layers.dense({ units: 4, activation: 'softmax' })
        ]
      })

      // 损失函数和优化器
      this.model.compile({
        optimizer: tf.train.adam(0.0001),
        loss: 'categoricalCrossentropy' // 交叉熵
      })
      let loss = 0
      // 拟合
      this.model.fit(this.dataset.xs, this.dataset.ys, {
        epochs: 20,
        callbacks: {
          onBatchEnd: (batch, logs) => {
            loss = logs.loss.toFixed(5) // 损失保留五位小数
          }
        }
      })
    },

    // 预测
    async predict() {
      while (this.isPredicting) {
        const predictedClass = tf.tidy(() => {
          // 从摄像头中捕获帧
          const img = this.webcam.capture()
          // 将他先喂给MobileNet 模型预测
          const mobilePredict = this.mobilenet.predict(img)
          // 最后交给我们自己的模型预测
          const predictions = this.model.predict(mobilePredict)
          // 四个概率，取最大的那一个
          return predictions.as1D().argMax()
        })

        const classId = await predictedClass.dataSync()[0]
        // 通过Vuex 共享预测结果
        this.updatePre(classId)

        predictedClass.dispose()
        // 视频生成的帧可能比js 分帧快，或js 分帧比视频生成快，nextFrame可以避免一个帧被处理两次
        await tf.nextFrame()
      }
    },

    // 预测数据传递到Vuex中
    ...mapMutations(['updatePre']),
    // 开始和结束游戏
    ...mapMutations(['isStart']),

    // 调用样本训练函数
    async doTraining() {
      if (this.upTotal === 0 && this.leftTotal === 0 && this.rightTotal === 0 && this.downTotal === 0) {
        this.$message.error('请先添加样本')
      } else {
        await this.train()
        this.isTrain = true
      }
    },

    // 开始游戏
    startPredict() {
      this.isPredicting = true
      this.isStart(true)
      this.predict()
    },
    // 结束游戏
    stopPredict() {
      this.isPredicting = false
      this.isStart(false)
      this.predict()
    },
    async init() {
      await this.webcam.setup()
      this.mobilenet = await this.loadedMobileNet()
      tf.tidy(() => this.mobilenet.predict(this.webcam.capture()))
    }
  }
}
</script>

<style lang="less" scoped>
.tensorflow {
  display: flex;
  flex-wrap: wrap;
  margin-top: 50px;
  width: 700px;
  // 摄像头
  .camera_box {
    display: inline-block;
    box-sizing: border-box;
    height: 184px;
    padding: 9px;
    margin-right: 80px;
    margin-top: 80px;
    background-color: #51c4d3;
    border: 1px solid #585858;
    border-radius: 4px;

    .camera_container {
      border: 1px solid #585858;
      border-radius: 4px;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      overflow: hidden;
      width: 160px;
      #webcam {
        height: 160px;
        transform: scaleX(-1);
      }
    }
  }
  // 样本
  .panel {
    padding: 0 9px 0 22px;
    width: 353px;
    .panel-row {
      display: flex;
      margin-bottom: 10px;
    }
    .panel-row-top,
    .panel-row-mid,
    .panel-row-bottom {
      // 左侧文字
      .help-text {
        font-size: 12px;
        line-height: 18px;
        margin-right: 30px;
      }
      .panel-cell-center {
        margin: 0 18px;
      }
      // 中间的盒子
      .thumb-box {
        .thumb-box-outer {
          position: relative;
          display: inline-block;
          box-sizing: border-box;
          padding: 9px;
          background-color: #51c4d3;
          border: 1px solid #585858;
          border-radius: 4px;
          .thumb-box-inner {
            display: flex;
            justify-content: center;
            width: 77px;
            background-color: #51c4d3;
            border: 1px solid #585858;
            border-radius: 4px;
            #up-thumb,
            #down-thumb,
            #left-thumb,
            #right-thumb {
              height: 77px;
            }
          }
          // 按钮
          .record-button {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: none;
            cursor: pointer;
            span {
              position: absolute;
              display: block;
              left: 9px;
              right: 9px;
              bottom: 9px;
              color: #f8f8f8;
              background: #111;
              border: 1px solid #585858;
              border-radius: 3px;
              font-size: 8px;
              opacity: 0.5;
              z-index: 999;
            }
          }
        }
        .up-total {
          text-align: center;
          font-size: 10px;
          color: #8b8b8b;
        }
      }
      // 底部
      .panel-cell-bottom {
        position: relative;
        left: 50%;
        transform: translateX(-50%);
      }
    }
  }

  // 底部三个按钮
  .button_container {
    margin-top: 20px;
    .train,
    .start,
    .stop {
      display: inline-block;
      font-size: 16px;
      padding: 15px 32px;
      border-radius: 8px;
      border: none;
      color: white;
      cursor: pointer;
    }
    .train:hover,
    .start:hover,
    .stop:hover {
      box-shadow: 0 12px 16px 0 rgba(0, 0, 0, 0.24), 0 17px 50px 0 rgba(0, 0, 0, 0.19);
    }
    .train {
      background: #4169e1;
    }
    .start {
      background-color: OrangeRed;
      margin-left: 20px;
      margin-right: 20px;
    }
    .stop {
      background-color: gray;
    }
  }
}
</style>
