<template>
  <div class="game-container">
    <div class="canvas-container">
      <canvas width="480" height="480" ref="canvas" id="myCanvas"></canvas>
    </div>
  </div>
</template>

<script>
// import createjs from 'createjs-cmd'
import eimg from '../image/e.png'
import { mapState } from 'vuex'
export default {
  data() {
    return {
      ctx: null,
      // 识别的方向
      classId: null,
      directArr: [0, 1, 2, 3],
      // 随机方向
      randomNum: null,
      // 得分
      score: 0
    }
  },
  mounted() {
    this.init()
  },
  watch: {
    // 监听电脑预测的方向变化
    isStart: {
      handler(newVal) {
        // 如果isStart的值为true，开始游戏
        if (newVal) {
          this.playStart()
        }
      },
      immediate: true
    }
  },
  computed: {
    // 模型预测的数据
    ...mapState(['getPredict']),
    // 开始和结束游戏
    ...mapState(['isStart'])
  },
  methods: {
    init() {
      const canvas = this.$refs.canvas
      this.ctx = canvas.getContext('2d')
      this.update()
    },
    update() {
      // 清除画布
      this.ctx.clearRect(0, 0, 480, 480)
      this.ctx.restore()
      // 将图像渲染到页面(下面画图一定要改this)
      const img = new Image()
      img.src = eimg
      img.onload = function () {
        this.ctx.drawImage(img, -25, -25, 50, 50)
      }.bind(this)
      // 获取随机方向
      this.randomNum = this.directArr[Math.floor(Math.random() * 4)]
      this.ctx.save()
      // 移动到画布中心点然后随机旋转一个方向
      this.ctx.translate(240, 240)
      this.ctx.rotate((Math.PI / 2) * this.randomNum)
    },
    // 开始游戏
    playStart() {
      setTimeout(() => {
        if (this.getPredict === this.randomNum) {
          this.$message({
            message: '方向正确，3秒后切换方向',
            type: 'success'
          })
          this.score++
          console.log(this.score)
          this.update()
          this.playStart()
        } else {
          this.stopGame()
        }
      }, 2000)
    },
    // 结束游戏
    stopGame() {
      this.$message.error('方向错误，你的最终得分是' + this.score)
      this.score = 0
    }
  }
}
</script>

<style lang="less" scoped>
.canvas-container {
  border: 1px solid #ccc;
  margin-right: 20px;
}
</style>
