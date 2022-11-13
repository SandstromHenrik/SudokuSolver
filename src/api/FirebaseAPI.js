import axios from 'axios'

if (process.env.NODE_ENV === 'development')
  axios.defaults.baseURL = 'http://localhost:5000/suduko-70190/us-central1/app'
else
  axios.defaults.baseURL = 'https://us-central1-suduko-70190.cloudfunctions.net/app'

export default {

  /* START OF BASE METHODS */

  get(resource, params) {
    return axios.get(resource, { params: params })
  },
  post(resource, data, config = {}) {
    return axios.post(resource, data, config)
  },
  put(resource, data) {
    return axios.put(resource, data)
  },
  delete(resource, data) {
    return axios.delete(resource, data)
  },

  /* END OF BASE METHODS */

  /* START OF API CALLS */

  async getPuzzle(difficulty) {
    return this.post('puzzle', { difficulty: difficulty }).then(resp => resp.data);
  },

  async validateBoard(board) {
    return this.post('validate', { board: board }).then(resp => resp.data);
  },

  async getSolution(index) {
    return this.post('solution', { index: index }).then(resp => resp.data);
  }

  /* END OF API CALLS */


}
