/*
 * Global constants
 */

export default Object.freeze({
  Statuses: {
    Not_Started: 'Waiting for game to begin...',
    Enter_Number: 'Please enter a number...',
    Waiting: 'Waiting for your next action...',
    Invalid_Number: 'Invalid number for the current ',
    Valid_Number: 'Valid number ',
    Auto_Solved: 'Auto-solved',
    Solved: 'Victory!!!'
  },
  Difficulties: [
    { title: 'Easy', startingNumbers: 40, icon: 'far fa-gauge-min text-success' },
    { title: 'Medium', startingNumbers: 30, icon: 'far fa-gauge text-warning' },
    { title: 'Hard', startingNumbers: 25, icon: 'far fa-gauge-max text-danger' }
  ]
})