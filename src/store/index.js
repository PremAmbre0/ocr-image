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
            Authorization: "eyJraWQiOiJrTWxnSlwvYUxQSngrNkhHQ3VpWkkzY2pDR29hVmU2REhvZ1F2TmZGU21FND0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2NjMxYzU5YS05NWVmLTQ3ZGUtYjgxYS0zYjc0MTMzNTYwMDAiLCJjb2duaXRvOmdyb3VwcyI6WyJ0ZXN0Z3JvdXAiLCJjb25maWd0b29sIl0sImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xX05WdmZNOGdwbiIsImNsaWVudF9pZCI6IjdvNjJpZnUzbXI3Z3VsbHFrMjA5bGhtNW85Iiwib3JpZ2luX2p0aSI6IjZhOWM5ZmIxLTM4MGYtNDFhZS1hYjBhLTBlNDRlMDMwNmZiZSIsImV2ZW50X2lkIjoiNDUxZDk1ZDMtYjhhMi00YWY2LWFjZDItNGE2YTUyNzkyMjVhIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiIsImF1dGhfdGltZSI6MTY2NzY3MDIzOSwiZXhwIjoxNjY3Njg1NjcxLCJpYXQiOjE2Njc2ODIwNzEsImp0aSI6ImU2ZGI4MDY1LWY2YzYtNDI3Zi04NGYwLWYzNTA3ZDVkYWE0NCIsInVzZXJuYW1lIjoidGFoZXIifQ.IGJ9TzZgaCiAPyRkYptN_LUDDDelAnKhViRfKDVGOHAmtW91wHHE7pmfQ1DqfJn66hM5NDiGHZkicph1Oc_jeQl5SgyGMUKIaEOwg00wZRigYe8YM8SUKPe6RZ0gcA3haOx2AuT_mjippDMqzFSAVZZrdBRPZ1G_kMz_HuVlOx9mlBfFgR_PqMw0XVDmrTJ2ItTMkDOHKsyTeSjp0UO7gwXjeoffGUrCnF4eTBFO1xgWQKPFiYm_kkYLrIPZ6bZ3pB6FPeSrmSiPfCBc8kcmPxEZBaSqMnvGNrCwqrt2r-DID3Y3YFc4xsOEL-cc_Gxdq1zsy5KyL92kH34yWe3ZuA"
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
