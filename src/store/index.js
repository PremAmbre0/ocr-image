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
            Authorization: "eyJraWQiOiJrTWxnSlwvYUxQSngrNkhHQ3VpWkkzY2pDR29hVmU2REhvZ1F2TmZGU21FND0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2NjMxYzU5YS05NWVmLTQ3ZGUtYjgxYS0zYjc0MTMzNTYwMDAiLCJjb2duaXRvOmdyb3VwcyI6WyJ0ZXN0Z3JvdXAiLCJjb25maWd0b29sIl0sImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xX05WdmZNOGdwbiIsImNsaWVudF9pZCI6IjdvNjJpZnUzbXI3Z3VsbHFrMjA5bGhtNW85Iiwib3JpZ2luX2p0aSI6ImYxNzU4YTk4LWZkZGYtNGQ2Yy04MTE0LWU1OWRlZWVmMDY5YyIsImV2ZW50X2lkIjoiMzg5NjBjZjktNTc0Mi00NGNjLTk2NTYtYWFjNWEwZDQ0YjNmIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiIsImF1dGhfdGltZSI6MTY2NzU2NjE2MSwiZXhwIjoxNjY3NTczNDU0LCJpYXQiOjE2Njc1Njk4NTQsImp0aSI6IjljYWM3ZjYyLWI3YjItNDA2Mi1hM2YwLTVlZWVhMDhjOWFlNCIsInVzZXJuYW1lIjoidGFoZXIifQ.XYHe_ZjSNOkpyo80rfv8SXvT730ZyjeyrhqkpjzrXd3cYD-WU-Vagw2tLyHGYZbu6ChIT_zUg1DBsZhw6jlvV6wTPnHe158fumdIQ6hdFwaGEo1yU2-u0dqXuK15CfQc51Pbh2cpHCrH-m-kBWn6U751VWcKSo6J8DesSkzLjF7Wlsr5vvZPUBtKQ2hEYEb8KjuoXJ3YTCKJPl2dyJ-iajLb5Lx2lizlhx68btOZzoGtQkBwTpkCGeEWbc3FJDcdo-mkM2dQIJiREEuebhSXtcZ4nUXdR1cNlW3lLd1jriJhmal7gNchxMdx7o-TNk8-g4P32lO___lAQlA_PAdOXQ"
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
