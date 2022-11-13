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
              "eyJraWQiOiJrTWxnSlwvYUxQSngrNkhHQ3VpWkkzY2pDR29hVmU2REhvZ1F2TmZGU21FND0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2NjMxYzU5YS05NWVmLTQ3ZGUtYjgxYS0zYjc0MTMzNTYwMDAiLCJjb2duaXRvOmdyb3VwcyI6WyJ0ZXN0Z3JvdXAiLCJjb25maWd0b29sIl0sImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xX05WdmZNOGdwbiIsImNsaWVudF9pZCI6IjdvNjJpZnUzbXI3Z3VsbHFrMjA5bGhtNW85Iiwib3JpZ2luX2p0aSI6ImY5MjIzNjEzLThiMjgtNGRhYS04NjdhLWZhMGJkNzMwMmIxNSIsImV2ZW50X2lkIjoiNWM0MTMyNmQtNzM5MC00ZDVjLWE3MzUtZWIyMTBmMzE5MjU1IiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiIsImF1dGhfdGltZSI6MTY2ODM3NTAxMywiZXhwIjoxNjY4Mzc4NjEzLCJpYXQiOjE2NjgzNzUwMTMsImp0aSI6IjYzYWYwMzEzLWZjNTgtNDk5MS1iYjYyLWQ3N2FmYWUwOWNmYSIsInVzZXJuYW1lIjoidGFoZXIifQ.Tmh9spd_bmtYlpKcwNPn6KBd1Q5mBUacjVD1pAdYSx0fUTutXe-lyj81qavp3TO5u1NF4jqm5iph8M9inW4Qd4A5cd6s1NDeC25VyPTJFZNscz4FYENtFao-WuNOR9iKvgHTMRswuzYou3UILLkHd7Y593Ff18iH4po3FkvNL-vqIe9Jp0ql82PYHA5TwlginPQrzomM9YeOjmnG2E3rDHjTJufTto8cxzqCqogT3_xTQ-grCbGQ7mCPqfqHZdmh2ZQ7o0lMzYGgtqAmyuQCAMlwEy0Gq1o6-kNRRHNxpN2gB-Sv5xYjo85vfL-ypzYRAab_8ZqjDm_Y4euFmb_vtw",
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
