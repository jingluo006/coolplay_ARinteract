<template>
  <div id="app">
    <Game></Game>
    <TensorFlow></TensorFlow>
  </div>
</template>

<script>
import TensorFlow from '@/components/TensorFlow.vue'
import Game from '@/components/Game.vue'
export default {
  name: 'app',
  components: {
    TensorFlow,
    Game
  }
}
</script>

<style lang="less">
* {
  padding: 0;
  margin: 0;
}
#app {
  display: flex;
}
</style>
