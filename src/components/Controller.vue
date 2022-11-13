<template>
  <div id="controller">
    <div class="bg-secondary d-inline-block p-2 rounded">
      <div class="btn-group" role="group">

        <!-- Difficulty selector -->
        <div id="difficulty-dropdown" class="btn-group" role="group">
          <button class="btn btn-light dropdown-toggle tool" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i :class="difficulty.icon"></i>
            <span class="ms-2">{{ difficulty.title }}</span>
          </button>
          <ul class="dropdown-menu">
            <li v-for="difficulty in $const.Difficulties" @click="setDifficulty(difficulty)">
              <a class="dropdown-item" href="#">
                <i :class="difficulty.icon"></i>
                {{ difficulty.title }}
              </a>
            </li>
          </ul>
        </div>

        <!-- New game button -->
        <button @click="$emit('startNewGame', difficultySelection)" class="btn btn-primary tool" :class="{ 'loading': loadingBoard }">
          <i class="far fa-circle-play pe-1"></i>
          <span>New Game</span>
          <i class="fas fa-spinner fa-spin ms-2"></i>
        </button>

        <!-- Auto-solve button -->
        <button v-if="isActive" @click="$emit('solve')" class="btn btn-success tool" :class="{ 'loading': loadingSolution }">
          <i class="far fa-lightbulb-on pe-1"></i>
          <span>Auto-solve</span>
          <i class="fas fa-spinner fa-spin ms-2"></i>
        </button>
      </div>

      <!-- Game timer -->
      <div v-if="startTime" id="timer" class="bg-dark text-white rounded p-2 fw-bold align-middle tool">
        {{ formattedTime }}
      </div>

    </div> 
  </div>
</template>

<style scoped>
  .tool, .dropdown-menu {
    font-weight: bold;
    width: 140px;
    --bs-dropdown-min-width: auto;
  }
  .tool.loading {
    width: 160px;
  }
  .tool:not(.loading) .fa-spin {
    display: none;
  }

  button i {
    font-size: 16px;
  }

  #controller {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 10px auto;
    padding: 10px 0px;
    text-align: center;
    border-radius: 5px;
  }

  #difficulty-dropdown {
    display: inline-block;
  }

  #timer {
    margin: 10px auto 0px auto;
  }

  @media screen and (min-width: 650px) {
    #timer {
      display: inline-block;
      margin-left: 10px;
      margin-top: 0px;
    }
  }

  @media screen and (max-width: 500px) {
    .tool:not(#timer) {
      width: 75px;
    }
    .tool i {
      padding: 0!important;
    }
    .tool span {
      display: none;
    }
  }
</style>

<script>
  export default {
    name: 'Controller',
    props: [
      'isActive',
      'startTime',
      'difficulty',
      'loadingBoard',
      'loadingSolution'
    ],
    data() {
      return {
        timerInterval: null,
        currentTime: new Date()
      }
    },
    computed: {

      /*
       * Formats the timer time in hh:mm:ss
       */
      formattedTime() {
        let secondsPassed = Math.round((this.currentTime - this.startTime) / 1000)
        secondsPassed = secondsPassed < 0 ? 0 : secondsPassed

        let hours = Math.floor(secondsPassed / 3600)
        let minutes = Math.floor(secondsPassed / 60) - (hours * 60)
        let seconds = secondsPassed - (hours * 3600) - (minutes * 60)

        return `${hours >= 10 ? hours : '0' + hours}:${minutes >= 10 ? minutes : '0' + minutes}:${seconds >= 10 ? seconds : '0' + seconds}`
      }

    },
    methods: {

      /*
       * Sets the difficulty 
       */
      setDifficulty(difficulty) {
        this.$emit('setDifficulty', difficulty)
      }

    },
    watch: {

      /*
       * Clear/activate the timer based on the active state of the game
       */
      isActive(isActive) {
        if (isActive) {
          this.secondsPassed = 0
          this.timerInterval = setInterval(() => {
            this.currentTime = new Date()
          }, 1000)
        } else {
          clearInterval(this.timerInterval)
        }
      }

    }
  }
</script>
