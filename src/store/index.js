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
            Authorization: "eyJraWQiOiJrTWxnSlwvYUxQSngrNkhHQ3VpWkkzY2pDR29hVmU2REhvZ1F2TmZGU21FND0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2NjMxYzU5YS05NWVmLTQ3ZGUtYjgxYS0zYjc0MTMzNTYwMDAiLCJjb2duaXRvOmdyb3VwcyI6WyJ0ZXN0Z3JvdXAiLCJjb25maWd0b29sIl0sImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xX05WdmZNOGdwbiIsImNsaWVudF9pZCI6IjdvNjJpZnUzbXI3Z3VsbHFrMjA5bGhtNW85Iiwib3JpZ2luX2p0aSI6IjNlMzJkZGUzLTgyMDYtNGMwMy1iZTNiLWM4MDdlYmRkY2U0MSIsImV2ZW50X2lkIjoiYzlkNzlhYmUtMGM2MS00MzVlLTk2ZGQtZDViYTQxNTUzODRiIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiIsImF1dGhfdGltZSI6MTY2Nzk3MzY4MCwiZXhwIjoxNjY3OTg2MTUxLCJpYXQiOjE2Njc5ODI1NTEsImp0aSI6IjE5YWIyNWZlLWY2ZTctNDEwOC1hYWJkLWM3NzdlYjc2ZmQ4YyIsInVzZXJuYW1lIjoidGFoZXIifQ.FNoQ-IORjnSmxSDQs5cM1ljSMQxF68OX_g1E8c1iId0LeusQ8b_zGKDloihnGpyNTKoytTjExutylI3sjLnqQJOAhmklWTnE6xs1YCK5dyPD70YRLnEQcqyAIoNO2QkpBItOy7OjZxdHuDEaTFLVmCgvQiCJKkldVTosZlqXgD6phg5y9k-X8ubgPlj0KGpiM4Nuu2MwgNe--zlVczn1iFX3cRvCNehrfh4NkmfuJiMEvHpuwSRqw__ADyCKePwQw-WFMBaFRol4jkTAHZjD0yrWSxAYP18SlalDcIC6H97lewndZfzatDnwNyLtumJm1nJi46-IDZMO3llvnK9RJw"
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
