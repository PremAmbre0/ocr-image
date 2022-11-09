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
            Authorization: "eyJraWQiOiJrTWxnSlwvYUxQSngrNkhHQ3VpWkkzY2pDR29hVmU2REhvZ1F2TmZGU21FND0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2NjMxYzU5YS05NWVmLTQ3ZGUtYjgxYS0zYjc0MTMzNTYwMDAiLCJjb2duaXRvOmdyb3VwcyI6WyJ0ZXN0Z3JvdXAiLCJjb25maWd0b29sIl0sImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xX05WdmZNOGdwbiIsImNsaWVudF9pZCI6IjdvNjJpZnUzbXI3Z3VsbHFrMjA5bGhtNW85Iiwib3JpZ2luX2p0aSI6IjQ3YTk0NmRhLTkyNzYtNGFiNi04ODYzLWZjYzBjNjk2ZDhlYiIsImV2ZW50X2lkIjoiOGEzMWNmOGQtYTE4Mi00NmVlLTkyMzUtM2YyMDg1MzFiYTdiIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiIsImF1dGhfdGltZSI6MTY2Nzk5Njg2NywiZXhwIjoxNjY4MDAwNDY3LCJpYXQiOjE2Njc5OTY4NjcsImp0aSI6IjA1MzQ1MmJiLTZiYjItNGQ5OS05NTMwLTdiYjUzZjM1YmFlYiIsInVzZXJuYW1lIjoidGFoZXIifQ.OK5QfLvbs9ZFYg7_7tJwFRpcJPLP8IK3GsHI5NG--vdNDp9zWg5OY_2q7R9sLBFIpwq9A8QQYwYMPrlfT5dhrDx_S_R5OtZyVLGZ5v5sPAldYKD4fEuY1NJuF-XV7l7mgP0K4uchlECovm_AiFjCs3MEvpOg7g_cidVqeIm7OyuXiP0gtri1fmVDFGkfL82HhCgo1h5OQFHpfMWN713cywoZy5zu0O0R4wi4kMvnQxo3f3uMiuInLXfZQrmHS0SRV2D-f5fP9ULTEMtukK_ChG1zzzySZt5TlDCoGpL2e-r-7biTyfDXrdn-a7BT3s4fSckNR6TvtnOk1p8qRUfHIA"
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
