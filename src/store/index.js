import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";

const apiEndPoint = "http://34.100.140.210/ManageFiles/v1.0/";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    config: null,
    undoRef:[],

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
    apiCall(context, config) {
      return new Promise((resolve, reject) => {
        axios({
          ...config,
          headers: {
            Authorization:
              "eyJraWQiOiJrTWxnSlwvYUxQSngrNkhHQ3VpWkkzY2pDR29hVmU2REhvZ1F2TmZGU21FND0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2NjMxYzU5YS05NWVmLTQ3ZGUtYjgxYS0zYjc0MTMzNTYwMDAiLCJjb2duaXRvOmdyb3VwcyI6WyJ0ZXN0Z3JvdXAiLCJjb25maWd0b29sIl0sImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xX05WdmZNOGdwbiIsImNsaWVudF9pZCI6IjdvNjJpZnUzbXI3Z3VsbHFrMjA5bGhtNW85Iiwib3JpZ2luX2p0aSI6IjVmNWI5ZTA2LWMzNjMtNGUzMC1hMjM0LWUyZDAzZjc1ZjZjNCIsImV2ZW50X2lkIjoiMGFhZmIzOTMtYmIwMC00MTBkLThiNTEtODMwZDM1OGMxNzRjIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiIsImF1dGhfdGltZSI6MTY2ODI0NTM2MSwiZXhwIjoxNjY4MjQ4OTYxLCJpYXQiOjE2NjgyNDUzNjEsImp0aSI6ImUwNzI5ZDcwLWIwZTQtNGI4Yi04NTE2LTM2NjkyNzNjYWQ4OSIsInVzZXJuYW1lIjoidGFoZXIifQ.ZVKBfq4tzNfMukm1ssbayj4vDxeUK7CUuDsEVjaW5UH1xLTo3ncyUh3qTOm5bj_LayzRotTPPwgxfpoPCW63qhkxarF4bdVkZjwwK0RJqypivVKbtmdmPsChexiRky1zpbA-y4_GdCmdvmrBeomGoVjtUob24IvlAJKg5CZYjGFeLXDrMDfr9buU5KrlxdIeX2l0jZAAZfN7v7bAaSi4VkK9Lm-JLM32lhFr3it4JWRAysrDXRgZ8LYBXKDzy2p_M9FSAC6U7Z6VUP-T6bi76UUngueuRboHEEvVhZlWTYEAu08m72EOkPHbnaG1aBa40xFR2loNF2plIlbvAaWp8A",
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
          dispatch("downloadFile", response.zipFilename);
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
        url: payload,
        method: 'GET',
        responseType: 'blob',
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
