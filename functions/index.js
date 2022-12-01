const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const app = express();
const admin = require('firebase-admin');

// Initialize admin rights & storage bucket
if (['true', true].includes(process.env.FUNCTIONS_EMULATOR)) {
  const serviceAccount = require('./firebase-adminsdk-w1s9k.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'suduko-70190.appspot.com'
  });
} else {
  admin.initializeApp();
}

// Enable cors
app.use(cors({ origin: true }));

/*
 * Randomly select and return a starting board among 5.000 pre-defined solutions
 */
app.post('/puzzle', async (req, res) => {

  let difficulty = req.body.difficulty

  await admin.storage().bucket().file("solutions.json")
    .download(function (err, data) {
      if (!err) {
        // Select board
        var boards = JSON.parse(data).solutions
        let boardIndex = Math.floor((Math.random() * boards.length))
        let board = boards[boardIndex].split('')

        // Remove numbers to match difficulty
        let positions = [...Array(board.length).keys()]
        while (positions.length > difficulty) {
          let index = Math.floor((Math.random() * positions.length))
          let position = positions[index]
          board[position] = null
          positions.splice(index, 1)
        }

        // Return board and index
        res.send({
          board: board,
          index: boardIndex
        })
      }
    });
});

/*
 * Validate board (check for any collisions)
 */
app.post('/validate', (req, res) => {

  let board = req.body.board
  let collisions = []

  // Check collisions in all 3x3 squares
  for (let sqrY = 1; sqrY <= 3; sqrY++) {
    for (let sqrX = 1; sqrX <= 3; sqrX++) {
      let positions = board.filter((_, ri) => Math.ceil((ri + 1) / 3) === sqrY)
        .map((r, ri) => Array.from(
          r.filter((_, ci) => Math.ceil((ci + 1) / 3) === sqrX),
          (c, ci) => ({ pos: [((sqrY - 1) * 3) + ri, ((sqrX - 1) * 3) + ci], val: c })
        )).flat()

      collisions.push(validatePositions(positions, '3x3 square'))
    }
  }

  // Check collisions for all rows
  board.forEach((r, ri) => {
    collisions.push(validatePositions(r.map((c, ci) => ({ pos: [ri, ci], val: c })), 'row'))
  })

  // Check collisions for all columns
  for (let ci = 0; ci < 9; ci++)
    collisions.push(validatePositions(board.map((r, ri) => ({ pos: [ri, ci], val: r[ci] })), 'column'))

  // Resolve all (non-empty) collisions
  res.send(collisions.filter(c => c.length).flat())

});

/*
 * Retrieve and return solution for a given board index
 */
app.post('/solution', async (req, res) => {

  let index = req.body.index

  await admin.storage().bucket().file("solutions.json")
    .download(function (err, data) {
      if (!err) {
        res.send(JSON.parse(data).solutions[index].split(''))
      }
    });

});

/*
 * Returns collision info for the current position
 */
function validatePositions(positions, type) {
  let collidingNumbers = [...Array(10).keys()].filter(k => positions.filter(p => p.val === k).length > 1)

  return collidingNumbers.map(n => ({
    positions: positions.filter(p => p.val === n).map(p => p.pos),
    area: positions.map(p => p.pos),
    type: type
  }))
}

exports.app = functions.https.onRequest(app);