import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";

const apiEndPoint = "http://34.100.140.210/ManageFiles/v1.0/"


Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    config: null,

  },
  getters: {
    config: (state) => state.config,
  },
  mutations: {
    setConfig(state, config) {
      state.config = config;
    }
  },
  actions: {
    apiCall({ context }, config) {
      console.log(context)
      return new Promise((resolve, reject) => {
        axios({
          ...config,
          headers: {
            Authorization: "eyJraWQiOiJrTWxnSlwvYUxQSngrNkhHQ3VpWkkzY2pDR29hVmU2REhvZ1F2TmZGU21FND0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2NjMxYzU5YS05NWVmLTQ3ZGUtYjgxYS0zYjc0MTMzNTYwMDAiLCJjb2duaXRvOmdyb3VwcyI6WyJ0ZXN0Z3JvdXAiLCJjb25maWd0b29sIl0sImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xX05WdmZNOGdwbiIsImNsaWVudF9pZCI6IjdvNjJpZnUzbXI3Z3VsbHFrMjA5bGhtNW85Iiwib3JpZ2luX2p0aSI6IjU0MTYyNTJiLWQ4YjAtNDIwNC04ZTVlLWFiZTk3NjdiYzNkZSIsImV2ZW50X2lkIjoiMzExMDE0NjYtNjE2Ni00ZTZmLTkyMjYtZjgwMmQ5OGQzMWFkIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiIsImF1dGhfdGltZSI6MTY2NzU3NzA4MSwiZXhwIjoxNjY3NTgwNjgxLCJpYXQiOjE2Njc1NzcwODEsImp0aSI6ImZjZmRlMGY3LTNiMjYtNGFmZS05MjE2LTBlYTQ2NDNlMmU2OSIsInVzZXJuYW1lIjoidGFoZXIifQ.eZ0Z9V39TtPzLq9HuObSGcwqm1LiUc9eZhU_W_AjcQCgRXkODVzh2V8I5kCYOO_RNJ7jEfK4wLJNPlMBnTMfj-YTTJKZkw0keY0A9-0oWJvky_--BsuoOUzP17PebCob2RI4YdvgM8fy153pyA_OuMG5bKFa7Q9q19DVS6Ht2BQc_1SmRsLyWUZqVBHWVqR35kL8pih84R5gvAUH0YKAVTPKFZwxFycee8cxkE9tFVZTxLecA9tvFSpVB9PVQk0N6q3eQGogFgea61v39Geaz67-oq34kwcvlmh8D-_KfPUR7A-0mlwk4Cp14p1JCNi6E-ndtFGuUT-JPN-TMFTMug"
          }
        })
          .then((response) => {
            resolve(response.data);
          })
          .catch((err) => {
            reject(err);
          });
      })
    },
    importFile({ commit, dispatch }, data) {
      return dispatch(
        "apiCall",
        {
          data,
          method: "post",
          url: `${apiEndPoint}import`,
        },
        { root: true }
      ).then((response) => {
        commit("setConfig", response.config)
        sessionStorage.setItem('config', JSON.stringify(response.config));
      }).catch((error) => {
        console.error(error);
      })
    },
    exportFile({ dispatch }, data) {
      return dispatch(
        "apiCall",
        {
          data,
          method: "post",
          url: `${apiEndPoint}export`,
        },
        { root: true }
      ).then((response) => {
        console.log(response);
      }).catch((error) => {
        console.error(error);
      })
    },
    clear({ dispatch }, data) {
      return dispatch(
        "apiCall",
        {
          method: "get",
          url: `${apiEndPoint}clear?id=${data.id}}`,
        },
        { root: true }
      ).then((response) => {
        console.log(response);
      }).catch((error) => {
        console.error(error);
      })
    },
  },
  modules: {},
});
