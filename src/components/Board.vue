<template>
  <table class="table" v-if="board.length && board[0].length">
    <tbody>
      <tr v-for="r in 9">
        <td v-for="c in 9">
          <input type="number" 
                 v-model="board[r-1][c-1]"
                 :disabled="!isActive || startBoard[r-1][c-1]"
                 :title="startBoard[r-1][c-1] ? 'Starting number' : ''"
                 :class="boxClass(r-1, c-1)"
                 @focus="boxAction(r-1,c-1,'focus',$event)" 
                 @focusout="boxAction(r-1,c-1,'focusout',$event)" 
                 @input="boxAction(r-1,c-1,'input',$event)"
                 @paste="boxAction(r-1,c-1,'paste',$event)"
                 @keyup.delete="boxAction(r-1,c-1,'delete',$event)" />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
  table {
    border-width: 5px;
    margin: 0px auto;
    height: calc(100vh - 220px);
    min-height: 250px;
    max-height: 100vw;
    max-width: calc(100vh - 220px);
    min-width: 250px;
  }
  td {
    position: relative;
    border: 1px solid rgb(255 255 255 / 50%);
  }
  td:nth-child(3n) {
    border-right-width: 5px;
  }
  tr:nth-child(3n) td {
    border-bottom-width: 5px;
  }
  tr:first-child td {
    border-top-width: 5px;
  }
  td:first-child {
    border-left-width: 5px;
  }
  td input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 0;
    background: transparent;
    color: white;
    caret-color: transparent;
    text-align: center;
    font-size: min(5vw, 5vh);
    cursor: pointer;
  }
  td input:disabled {
    cursor: not-allowed;
  }
  td input:hover, td input:focus {
    background: #292d31;
  }

  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  /* Firefox */
  input[type=number] {
    -moz-appearance: textfield;
  }

  .bg-collision {
    background-color: #292121;
  }
  .text-initial {
    color: #97edff;
  }

</style>

<script>
  export default {
    name: 'Board',
    props: ['board', 'startBoard', 'collisions', 'isActive'],
    methods: {

      /*
       * Check if a given box is inside a row/col/3x3-square that has collisions
       */
      hasCollision(row, col) {
        return this.collisions.map(c => c.area).some(a => a.some(p => p.join('') === [row, col].join('')))
      },

      /*
       * Check if the number for the given box is colliding with another number inside the current row/col/3x3-square
       */
      isCollidingNumber(row, col) {
        return this.collisions.map(c => c.positions).some(a => a.some(p => p.join('') === [row, col].join('')))
      },

      /*
       * Calculates the applicable classes (if any) for the given box
       */
      boxClass(row, col) {
        return {
          'bg-collision': this.hasCollision(row, col),
          'text-initial': this.startBoard[row][col],
          'text-danger': this.isCollidingNumber(row, col)
        }
      },

      /*
       * Handlers for all different box controlls/actions
       */
      boxAction(row, col, action, event) {
        switch (action) {
          case 'input':
          case 'paste':
            this.checkValue(row, col, event)
            break;
          case 'focus':
            this.$emit('setStatus', this.$const.Statuses.Enter_Number)
            break;
          case 'focusout':
            this.$emit('setStatus', this.$const.Statuses.Waiting)
            break;
          case 'delete':
            this.board[row][col] = null
            this.$emit('checkMove', [row, col])
            break;
        }
      },

      /*
       * Validates the user input type and numerical value 
       */
      checkValue(row, col, event) {
        let value = event.data ?? (event.clipboardData ? event.clipboardData.getData('text') : null)

        if (value) {
          let number = Number(value[0])
          this.board[row][col] = number

          if (number <= 0) {
            this.board[row][col] = null
          } else if (number > 9) {
            this.board[row][col] = String(number)[0]
          } else {
            this.$emit('checkMove', [row, col])
          }

          // Unfocus input/box
          event.target.blur()
        }

      }      
    }
  }
</script>
