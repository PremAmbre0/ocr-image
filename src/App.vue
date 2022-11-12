<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title class="font-weight-bold">OCR Template Configuration Tool</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-text-field label="Template Name" hide-details></v-text-field>
      <v-spacer></v-spacer>
      <template>
        <v-card flat color="transparent" width="20%">
          <v-card-text class="pa-0">
            <v-slider v-model="zoom" dense thumb-label="always" thumb-size="20" min="0" max="100" step="1" hide-details>
              <template v-slot:prepend>
                <v-icon color="black">
                  mdi-magnify-minus-outline
                </v-icon>
              </template>
              <template v-slot:append>
                <v-icon color="black">
                  mdi-magnify-plus-outline
                </v-icon>
              </template>
            </v-slider>
          </v-card-text>
        </v-card>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on" icon>
              <v-icon color="black"> mdi-arrow-u-left-top</v-icon>
            </v-btn>
          </template>
          <span>Undo last change (including description changes)</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on" icon @click="triggerFileInput">
              <v-icon color="black">mdi-upload</v-icon>
            </v-btn>
          </template>
          <span>Import new Zip/PDF and clear current session</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on" icon @click="getExportedFile">
              <v-icon color="black">mdi-download</v-icon>
            </v-btn>
          </template>
          <span>Export Zip for current session</span>
        </v-tooltip>
        <!-- <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on" icon>
              <v-icon color="black">mdi-logout</v-icon>
            </v-btn>
          </template>
          <span>Logout</span>
        </v-tooltip> -->
      </template>
    </v-app-bar>
    <input ref="fileInput" type="file" @input="handleInput" style="height: 0; width: 0;"/>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import {mapActions,mapGetters} from "vuex";
export default {
  name: "App",

  data: () => ({
    zoom: 50,
  }),
  computed:{
    ...mapGetters(['config'])
  },  
  methods: {
    ...mapActions(['importFile','exportFile']),
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleInput(e) {
      let file = e.target.files[e.target.files.length - 1];
      if (file.type == "application/zip") {
        let data = new FormData();
        data.append('file', file);
        this.importFile(data)
      }
    },
    getExportedFile(){
      this.exportFile(this.config)
    }
  }
};
</script>

<style>
.v-card {
  padding-top: 1%;
}

.v-input {
  margin-top: 5%;
}
</style>
