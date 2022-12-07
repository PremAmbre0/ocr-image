import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";

const apiEndPoint = "http://34.93.226.10/ManageFiles/v1.0/";

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
      window.localStorage.setItem("config", JSON.stringify(config));
    },
    setUndoRef(state, data) {
      state.undoRef = data;
    },
    updateUndoRef(state, data) {
      state.undoRef.push(data);
    },

  },
  actions: {
    apiCall(context, config) {
      return new Promise((resolve, reject) => {
        axios({
          ...config,
          headers: {
            Authorization:
              "eyJraWQiOiJrTWxnSlwvYUxQSngrNkhHQ3VpWkkzY2pDR29hVmU2REhvZ1F2TmZGU21FND0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2NjMxYzU5YS05NWVmLTQ3ZGUtYjgxYS0zYjc0MTMzNTYwMDAiLCJjb2duaXRvOmdyb3VwcyI6WyJ0ZXN0Z3JvdXAiLCJjb25maWd0b29sIl0sImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xX05WdmZNOGdwbiIsImNsaWVudF9pZCI6IjdvNjJpZnUzbXI3Z3VsbHFrMjA5bGhtNW85Iiwib3JpZ2luX2p0aSI6ImUxNmM1MzgzLWVmY2ItNGJkNi1hZGViLTYzYWY4MTM4NTI3NiIsImV2ZW50X2lkIjoiZjQ2NzdlZDctN2EyYy00YmIwLWE1YzEtZjhhNWY1YWE0MjUyIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiIsImF1dGhfdGltZSI6MTY2OTk1MDAyMCwiZXhwIjoxNjY5OTUzNjIwLCJpYXQiOjE2Njk5NTAwMjAsImp0aSI6IjE2ZjFkMTg2LTJmMjQtNDhmYy04YTllLWNkYTMxMjU4NDdjOCIsInVzZXJuYW1lIjoidGFoZXIifQ.ioX3JTKM1Uwaw1iEicICCCljzkyseoQ_-Hn4Z2T6ypTHh7TFXLKyyh9WnoQedQIHXxUNI7T9DbbVmEkA9Glu69uykeZ54-as-D5WM7D24pOx140XJ9nJNpWX9I_1hQ7yBy036df-QObnA55LI-fKMFdQ9GE7pJY1NvXVNnbQe144o39zUf6bA9juL_q8uEOZbYnlwDgWGABpIqkunt_e27dyp-zK8LMOlxmzrvVnLTRY-myss_3annKxFhgAO69clPcOWpa_PDfbS-9vVhZfmdmHR38XoHY3VsBLZttOD_YfGQjLP992jbL55qS_BVdDL3eDMEEldPDeVfkwALx-5Q",
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
          localStorage.setItem("config", JSON.stringify(response.config));
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
