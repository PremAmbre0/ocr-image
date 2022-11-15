import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";

const apiEndPoint = "http://34.100.140.210/ManageFiles/v1.0/";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    config: null,
    undoRef: [],
    currentSelectedPage: null,
  },
  getters: {
    config: (state) => state.config,
    undoRef: (state) => state.undoRef
  },
  mutations: {
    setConfig(state, config) {
      state.config = config;
    },
    pushToUndoRef(state, config) {
      state.undoRef.push(config)
      console.log(state.undoRef)
    }

  },
  actions: {
    apiCall(context, config) {
      return new Promise((resolve, reject) => {
        axios({
          ...config,
          headers: {
            Authorization:
              "eyJraWQiOiJrTWxnSlwvYUxQSngrNkhHQ3VpWkkzY2pDR29hVmU2REhvZ1F2TmZGU21FND0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2NjMxYzU5YS05NWVmLTQ3ZGUtYjgxYS0zYjc0MTMzNTYwMDAiLCJjb2duaXRvOmdyb3VwcyI6WyJ0ZXN0Z3JvdXAiLCJjb25maWd0b29sIl0sImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xX05WdmZNOGdwbiIsImNsaWVudF9pZCI6IjdvNjJpZnUzbXI3Z3VsbHFrMjA5bGhtNW85Iiwib3JpZ2luX2p0aSI6ImJlNzQ0OWVhLWUwMzQtNGFmMC1iOGU5LTE3OTdkYjYwYTZiOSIsImV2ZW50X2lkIjoiMmFkN2U5ZjgtNzJjMC00MGM1LTg3ZDQtYzU4NTM0M2FhZGVjIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiIsImF1dGhfdGltZSI6MTY2ODQ3MDA5NiwiZXhwIjoxNjY4NDczNjk2LCJpYXQiOjE2Njg0NzAwOTYsImp0aSI6IjM3NDk0ODM3LTRmNDUtNDYyYy04ZDI2LTBiMjg1NTI0NjJiNSIsInVzZXJuYW1lIjoidGFoZXIifQ.l5j7pGy0aALeQQIEnSTOcQ_3wDCn6LkCikX3Xf7yo1DtqrrD-egp-PfBw73aJ4d-dJBqTU_75JU1thpoAKp31AtCat9-HnN87uC_0ks-dwk40EqE-Fo8UibIARbslqbFVTiQTn3ZM-igLZCZMwsF_j2aP-MzhytIOYXBAZXAhKhTZOPMMpeV6EsiQ2gTZiRpW8n_VFGewmdxL5tfmlh2vVM0rCC90cg9f2hJPaS_YMAsuouUFsIU5zKteeM_5NarNrjZ1qjGC5pa_XF4Lymo4iQQtRGYvpxYhZUhtqi28Ornia4VWLiv947gvdid9XaTK02b1pzWc67dxN8Obonjmw",
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
      let payload = { "config": data };
      return dispatch(
        "apiCall",
        {
          data: payload,
          method: "post",
          url: `${apiEndPoint}export`,
        },
        { root: true }
      )
        .then((response) => {
          console.log(response);
          const link = document.createElement('a');
          link.href = apiEndPoint + response.zipFilename;
          link.setAttribute('download', payload); //or any other extension
          document.body.appendChild(link);
          link.click();

          // clean up "a" element & remove ObjectURL
          document.body.removeChild(link);
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
    downloadFile(context, payload) {
      console.log(payload)
      axios({
        headers: {
          Authorization:
            "eyJraWQiOiJrTWxnSlwvYUxQSngrNkhHQ3VpWkkzY2pDR29hVmU2REhvZ1F2TmZGU21FND0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2NjMxYzU5YS05NWVmLTQ3ZGUtYjgxYS0zYjc0MTMzNTYwMDAiLCJjb2duaXRvOmdyb3VwcyI6WyJ0ZXN0Z3JvdXAiLCJjb25maWd0b29sIl0sImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xX05WdmZNOGdwbiIsImNsaWVudF9pZCI6IjdvNjJpZnUzbXI3Z3VsbHFrMjA5bGhtNW85Iiwib3JpZ2luX2p0aSI6Ijg3OWQ1YzZlLTBlMGYtNDhlNC05NDUxLTJmYzQzNjI0YzQ1MCIsImV2ZW50X2lkIjoiNjExNGExYTMtY2IzMS00NmVlLTgyZTUtYzc2NzUwYWJlNzRjIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiIsImF1dGhfdGltZSI6MTY2ODI1MDQyOCwiZXhwIjoxNjY4MjU0MDI4LCJpYXQiOjE2NjgyNTA0MjgsImp0aSI6IjcwYjA4ZjVlLWVhMjItNGE4OS1iOTM0LTkzYzVkMjE0YmI5MSIsInVzZXJuYW1lIjoidGFoZXIifQ.h7pwSSOlORJ-rvflORuIxXU3SNihEbkARdvPqU1oG-pxThbPNk2Tts4_h2jZaUjz-JQr_n4X9fH84FEhCiUbYk1VuFpwLhx5oGp4zbHGORU-7cF9YIULO1ufMmE939qCuXN49dFtqpxKMBCrvlRKTyFFKKqG5zxXSw2PMQ8fyPRqnD71xuLfw3FKCJ3eNm2hu_CgFOkpQOa9LkxUlar4vwdwmr47cKjXVj-GuVdZ5CbjaPJ69mKQwB3Z_yRaqiCJc5TQauhc9CTIWtEMo3EuNaBtMHjSQ0vgu8tZT6rPSZKX02AClW3X5FjQt7ZrPjkioTvRoXew5vxii3qfwHrG-g",
        },
        url: apiEndPoint + payload,
        method: 'GET',
      })
        .then((response) => {
          console.log(response)
          // create file link in browser's memory
          const href = URL.createObjectURL(response.data);

          // create "a" HTLM element with href to file & click
          const link = document.createElement('a');
          link.href = href;
          link.setAttribute('download', payload); //or any other extension
          document.body.appendChild(link);
          link.click();

          // clean up "a" element & remove ObjectURL
          document.body.removeChild(link);
          URL.revokeObjectURL(href);
        })
    },
  },
  modules: {},
});
