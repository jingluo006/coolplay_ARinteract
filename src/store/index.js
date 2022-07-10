import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    getPredict: null,
    isStart: null
  },
  mutations: {
    // 预测值
    updatePre(state, value) {
      state.getPredict = value
    },
    // 开始和结束游戏
    isStart(state, value) {
      state.isStart = value
    }
  },
  actions: {},
  modules: {}
})
