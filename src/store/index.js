import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";

const apiEndPoint = "http://34.100.140.210/ManageFiles/v1.0/";

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
    },
  },
  actions: {
    apiCall({ context }, config) {
      console.log(context);
      return new Promise((resolve, reject) => {
        axios({
          ...config,
          headers: {
            Authorization:
              "eyJraWQiOiJrTWxnSlwvYUxQSngrNkhHQ3VpWkkzY2pDR29hVmU2REhvZ1F2TmZGU21FND0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2NjMxYzU5YS05NWVmLTQ3ZGUtYjgxYS0zYjc0MTMzNTYwMDAiLCJjb2duaXRvOmdyb3VwcyI6WyJ0ZXN0Z3JvdXAiLCJjb25maWd0b29sIl0sImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xX05WdmZNOGdwbiIsImNsaWVudF9pZCI6IjdvNjJpZnUzbXI3Z3VsbHFrMjA5bGhtNW85Iiwib3JpZ2luX2p0aSI6ImFhMzhiNzk2LTAyMWUtNDc5MS1hMDhjLWVlOWY5MzM5ZDQyMCIsImV2ZW50X2lkIjoiNDRkNjllMTEtYjIxZS00MDNkLWJhYjYtZTAxMjk3MjlkYzdjIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiIsImF1dGhfdGltZSI6MTY2ODA2Njc5NiwiZXhwIjoxNjY4MDc0OTU4LCJpYXQiOjE2NjgwNzEzNTgsImp0aSI6ImNiYzFkZDhiLTRkMjEtNDE3YS05ZTUyLWI3NDM1NzVmZTAzOCIsInVzZXJuYW1lIjoidGFoZXIifQ.PRV0Rx0RChjMInCP4743rZ1mfaymI07YRs8Dcuys1VfGIJwIulcnQ9eubIwX6XssGPf-U-ZhFLOH4rNNq8_DCvgcIKz-t7z687v1y_CW-0He9oQhVbdTfLpMXUr-v4o8y6Wix7atIdVIMKTgAS5QEafwDuO3LRoF9EV7_iDVDdcPGarl73vE3BoD2yUESiYwBJgkXphCpwiKScF6B8tkRaUcR8mWXfIUm2TYwa-J3MxgxP2tmvv9d9kh0NgvKZMzWlzBmOWoe-VAdUIqmiBMMQC4A-kEfJjvyUY-rHFXbliOcoDkIp33LcklXiG1-MtHlfhwLCMlfRfwejSMUrvaJA",
          },
        })
          .then((response) => {
            resolve(response.data);
          })
          .catch((err) => {
            reject(err);
          });
      });
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
      )
        .then((response) => {
          commit("setConfig", response.config);
          sessionStorage.setItem("config", JSON.stringify(response.config));
        })
        .catch((error) => {
          console.error(error);
        });
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
      )
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.error(error);
        });
    },
    clear({ dispatch }, data) {
      return dispatch(
        "apiCall",
        {
          method: "get",
          url: `${apiEndPoint}clear?id=${data.id}}`,
        },
        { root: true }
      )
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.error(error);
        });
    },
  },
  modules: {},
});
