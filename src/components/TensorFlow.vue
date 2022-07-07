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
              <button class="record-button" id="up">
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
                <canvas class="up-thumb" id="up-thumb" width="224px" height="224px"></canvas>
              </div>
              <!-- 添加按钮 -->
              <!-- 上下左右：0123 -->
              <button class="record-button" id="left">
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
                <canvas class="up-thumb" id="up-thumb" width="224px" height="224px"></canvas>
              </div>
              <!-- 添加按钮 -->
              <!-- 上下左右：0123 -->
              <button class="record-button" id="right">
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
                <canvas class="up-thumb" id="up-thumb" width="224px" height="224px"></canvas>
              </div>
              <!-- 添加按钮 -->
              <!-- 上下左右：0123 -->
              <button class="record-button" id="down">
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
      <button class="train">开始训练</button>
      <button class="start" v-if="isTrain">开始游戏</button>
      <button class="stop" v-if="isTrain">停止游戏</button>
    </div>
  </div>
</template>

<script>
// import createjs from 'createjs-cmd'
// import * as tf from '@tensorflow/tfjs'
import { Webcam } from '@/utils/webcam.js'
export default {
  data() {
    return {
      webcam: null, // 摄像头
      // 四个方向样本数量
      upTotal: 0,
      leftTotal: 0,
      rightTotal: 0,
      downTotal: 0,
      isTrain: false
    }
  },
  mounted() {
    this.webcam = new Webcam(this.$refs.webcamRef)
    this.init()
  },
  methods: {
    async init() {
      await this.webcam.setup()
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
      .panel-cell-left {
        .help-text {
          font-size: 12px;
          line-height: 18px;
          margin-right: 30px;
        }
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
            #up-thumb {
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
