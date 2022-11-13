<template>

  <!-- Site header/navbar -->
  <nav class="navbar navbar-dark bg-info navbar-expand-lg">
    <div class="container position-relative">
      <span class="navbar-brand mb-0 h1">
        <i class="fa-solid fa-puzzle-piece"></i>
        <span id="title" class="ms-2">Sudoku solver</span>        
      </span>
      <span id="statusBar" class="text-white fw-bold">
        {{ status }}
      </span>
    </div>
  </nav>

  <!-- Game board & controller -->
  <main class="container" :class="{ 'isActive': isActive }">
    <board :board="board"
           :startBoard="startBoard"
           :collisions="collisions"
           :isActive="isActive"
           @setStatus="setStatus"
           @checkMove="checkMove">
    </board>
    <controller @setDifficulty="setDifficulty"
                @startNewGame="startNewGame"
                @solve="solve"
                :isActive="isActive"
                :difficulty="difficulty"
                :loadingBoard="loadingBoard"
                :loadingSolution="loadingSolution"
                :startTime="startTime">
    </controller>
  </main>

</template>

<style>  
  html, body, #app {
    height: 100%;
  }
  .container {
    max-width: 1000px!important;
  }  
</style>

<style scoped>
  .navbar {
    background-color: #02394a !important;
    box-shadow: rgb(0 0 0 / 20%) 0px 1px 2px;
    padding-left: 12px;
    padding-right: 12px;
  }
  .navbar .container {
    width: min(976px, calc(100vh - 220px))!important;
    min-width: 250px;
    padding: 0px;
  }
  main {
    display: flex;
    height: calc(100% - 50px - 74px);
    align-items: center;
  }

  @media screen and (max-width: 650px) {
    main.isActive {
      display: flex;
      height: calc(100% - 50px - 124px);
      align-items: center;
    }
  }

  @media screen and (max-width: 550px) {
    #title {
      display: none;
    }
  }
</style>

<script>
  import API from './api/FirebaseAPI'

  import Board from './components/Board.vue'
  import Controller from './components/Controller.vue'

  import { nextTick } from 'vue'

  export default {
    components: {
      Board, Controller
    },
    data() {
      return {
        board: Array.from(Array(9), _ => Array(9)),
        startBoard: Array.from(Array(9), _ => Array(9)),
        boardIndex: -1,        
        startTime: null,
        collisions: [],
        isActive: false,
        difficulty: this.$const.Difficulties[0],
        status: this.$const.Statuses.Not_Started,
        actionTimeout: null,
        loadingBoard: false,
        loadingSolution: false
      }
    },
    methods: {

      /*
       * Sets the game status (status bar)
       */
      setStatus(status) {
        this.status = status
      },

      /*
       * Sets the game difficulty (difficulty)
       */
      setDifficulty(difficulty) {
        this.difficulty = difficulty
      },

      /*
       * Starts a new game of sudoku with the selected difficulty  
       */
      startNewGame() {
        if (!this.isActive || confirm('Start new game?')) {
          this.isActive = false

          nextTick(() => {
            this.loadingBoard = true

            this.fillBoard(this.difficulty.startingNumbers).then(() => {              
              this.collisions = []
              this.status = this.$const.Statuses.Waiting
              this.isActive = true
              this.startTime = new Date()
              this.loadingBoard = false
            })            
          });
        }        
      },

      /*
       * Fetches and fills a new sudoku puzzle board
       */
      async fillBoard(startingNumbers) {
        return new Promise((res) => {
          API.getPuzzle(startingNumbers).then(puzzle => {
            this.board = this.board.map((_, ri) => Array.from(_, (_, ci) => parseInt(puzzle.board[(ri * 9) + ci])))
            this.boardIndex = puzzle.index

            // Preserve starting board
            this.startBoard = JSON.parse(JSON.stringify(this.board))

            res()
          })
        })
      },

      /*
       * Auto-solves the entire puzzle
       */
      solve() {
        if (confirm('Auto-solve puzzle?')) {          
          this.startTime = null
          clearTimeout(this.actionTimeout)
          this.loadingSolution = true

          this.applySolution().then(() => {
            this.isActive = false
            this.loadingSolution = false            
            this.collisions = []
            this.status = this.$const.Statuses.Auto_Solved
          })          
        }
      },

      /*
       * Retrieves and applies the full solution for the current board
       */
      applySolution() {
        return new Promise((res) => {
          API.getSolution(this.boardIndex).then(solution => {
            this.board = this.board.map((_, ri) => Array.from(_, (_, ci) => parseInt(solution[(ri * 9) + ci])))
            res()
          })
        })
      },

      /*
       * Validates the last move and the entire board
       */
      checkMove(position) {
        this.checkCollisions(position).then(() => {
          if (!this.collisions.length)
            this.checkProgress()
        })        
      },

      /*
       * Checks if the board is fully filled or not
       */
      checkProgress() {
        if (!this.collisions.length && this.board.every((br, bri) => br.every((bc, bci) => bc >= 1 && bc <= 9))) {
          // Victory!!
          this.isActive = false
          clearTimeout(this.actionTimeout)
          this.status = this.$const.Statuses.Solved
        }      
      },

      checkCollisions(position) {
        return new Promise((res) => {
          API.validateBoard(this.board).then(collisions => {
            this.collisions = collisions

            // Inform user of validity
            let collisionsForPosition = collisions.filter(c => c.positions.some(p => p.join('') === position.join(''))).map(c => c.type).join(' + ')
            if (collisionsForPosition.length) {
              this.status = this.$const.Statuses.Invalid_Number + collisionsForPosition.replace(' &', ',')
            } else if (this.board[position[0]][position[1]]) {
              this.status = this.$const.Statuses.Valid_Number
            }

            // Activate timeout for status message
            clearTimeout(this.actionTimeout)
            this.actionTimeout = setTimeout(() => {
              this.status = this.$const.Statuses.Waiting
            }, 10000)

            res()
          })
        })        
      }

    }
  }

</script>
