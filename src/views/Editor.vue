<template>
    <div class="editor" v-if="config">
        <div class="image-list-container">
            <div class="pages" v-for="page in config.pages" :key="page.id">
                <img class="pages-img" :src="'http://34.100.140.210/files/' + config.id + '/' + page.id + '.png'" alt="">
                <div class="pages-description">
                    {{ page.description }}
                </div>
            </div>
        </div>
        <div class="editor-image-container">
            editor-image-container
            {{ config }}
        </div>
        <div class="fields-and-coords-container">
            fields-and-coords-container
        </div>
    </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
export default {
    data() {
        return {

        }
    },
    created(){
        if(sessionStorage.getItem('config')){
            this.setConfig(JSON.parse(sessionStorage.getItem('config')))
        }
    },
    computed: {
        ...mapGetters(['config']),
    },
    methods:{
        ...mapMutations(['setConfig']),
    }
}
</script>


<style lang="scss" scoped>
.editor {
    display: flex;
    height: 100vh;
    width: 100vw;
    position: fixed;

    .image-list-container {
        width: 15vw;
        min-height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        align-items: center;
        flex-shrink: 0;

        .pages {
            padding: 5% 10% 5% 10%;

            &-img {
                border: 1px solid black;
                width: 100%;
                object-fit: scale-down;
            }

            &-desciption {
                width: 100%;
                text-align: center;
            }
        }
    }

    .editor-image-container {
        background-color: #d3d3d3;
        height: 100vh;
        width: 65vw;
    }

    .fields-and-coords-container {
        height: 100vh;
        width: 20vw;
    }

}
</style>