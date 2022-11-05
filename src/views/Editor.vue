<template>
    <div class="editor" v-if="config">
        <div class="image-list-container">
            <div class="pages" v-for="page in config.pages" :key="page.id">
                <img class="pages-img" :src="'http://34.100.140.210/files/' + config.id + '/' + page.id + '.png'"
                    alt="">
                <div class="pages-description">
                    {{ page.description }}
                </div>
            </div>
        </div>
        <div class="editor-image-container">
            <div v-if="selectedPageConfig" class="image-wrapper">
                <img class="image-wrapper-image"
                    :src="'http://34.100.140.210/files/' + config.id + '/' + this.selectedPageConfig.id + '.png'" alt=""
                    @load="setPageConstants">
                <div v-for="(key, field) in selectedPageConfig.fields" :key="field"
                    :class="'bounding-box ' + getSanitizedFieldName(field)">
                    <div data-v-0be0641e="" class="bb_side right"></div>
                    <div data-v-0be0641e="" class="bb_side top"></div>
                    <div data-v-0be0641e="" class="bb_side bottom"></div>
                    <div data-v-0be0641e="" class="bb_side left"></div>
                </div>
            </div>
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
            selectedPageConfig: null,
            imageToBeTaggedBoundingCLient: null,
            imageContainerBoundingCLient: null,
            changeInDimensionsOfRenderedImageWRTOriginalImage: null,
            relativeTopOfTheImageToBeTagged: null,
            relativeTop: null,
            relativeLeft: null,
        }
    },
    created() {
        if (sessionStorage.getItem('config')) {
            this.setConfig(JSON.parse(sessionStorage.getItem('config')));
        }
        this.selectedPageConfig = this.config.pages[0];
    },
    computed: {
        ...mapGetters(['config']),
    },
    methods: {
        ...mapMutations(['setConfig']),
        getSanitizedFieldName(field) {
            if (field) {
                return field.trim().toLowerCase();
            }
        },
        setPageConstants() {
            const imageContainer = document.querySelector('.editor-image-container')
            const image = document.querySelector('.image-wrapper-image')

            this.imageToBeTaggedBoundingCLient = image.getBoundingClientRect()
            this.imageContainerBoundingCLient = imageContainer.getBoundingClientRect()
            this.changeInDimensionsOfRenderedImageWRTOriginalImage = this.toFixedDecimal(this.imageToBeTaggedBoundingCLient.height / (this.selectedPageConfig.height / 100), 3);

            this.relativeTop = this.toFixedDecimal(image.getBoundingClientRect().top + window.scrollY - this.imageContainerBoundingCLient.top + window.scrollY, 3)
            this.relativeLeft = this.toFixedDecimal(image.getBoundingClientRect().left + window.scrollY - this.imageContainerBoundingCLient.left + window.scrollY, 3)

            this.renderBoundingBoxes();
        },
        toFixedDecimal(num, decimal) {
            if (typeof (num) != "number") return
            return Number(num.toFixed(decimal))
        },
        renderBoundingBoxes() {
            if (!this.selectedPageConfig.fields) return;
            for (const field in this.selectedPageConfig.fields) {
                if ('question' in this.selectedPageConfig.fields[field]) {
                    this.updateStyleAttriutesOfBBForGivenLinkedField(field)
                } else {
                    this.updateStyleAttriutesOfBBForGivenField(field)
                }
            }
            console.log(this.imageToBeTaggedBoundingCLient)
        },
        getBBCoordsForGivenField(field) {

            let height = `${((field.h / 100) * this.changeInDimensionsOfRenderedImageWRTOriginalImage) / (this.imageContainerBoundingCLient.height / 100)}%`;
            let width = `${((field.w / 100) * this.changeInDimensionsOfRenderedImageWRTOriginalImage) / (this.imageContainerBoundingCLient.width / 100)}%`;
            let top = `${((field.y / 100) * this.changeInDimensionsOfRenderedImageWRTOriginalImage + this.relativeTop) / (this.imageContainerBoundingCLient.height / 100)}%`;
            let left = `${((field.x / 100) * this.changeInDimensionsOfRenderedImageWRTOriginalImage + this.relativeLeft) / (this.imageContainerBoundingCLient.width / 100)}%`;
            return { height, width, top, left }
        },
        updateStyleAttriutesOfBBForGivenLinkedField() {

        },
        updateStyleAttriutesOfBBForGivenField(field) {
            let sanatizedFieldName = this.getSanitizedFieldName(field);
            let BB = document.querySelector(`.${sanatizedFieldName}`);
            const coords = this.getBBCoordsForGivenField(this.selectedPageConfig.fields[field])
            // console.log(BB)
            BB.style.height = coords.height;
            BB.style.width = coords.width;
            BB.style.top = coords.top;
            BB.style.left = coords.left;
        }
    }
}
</script>


<style lang="scss" scoped>
.editor {
    display: flex;
    height: 100vh;
    width: 100vw;

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
        padding: 1%;
        width: 65vw;
        overflow-y: auto;
        overflow-x: hidden;
        position: relative;

        .bounding-box {
            border: 2px solid red;
            position: absolute;
            background-color: rgba($color: red, $alpha: 0.25);
        }

        .image-wrapper img {
            width: 100%;
            object-fit: object-fit;

        }
    }

    .fields-and-coords-container {
        overflow-y: auto;
        overflow-x: hidden;
        height: 100vh;
        width: 20vw;
    }

}
</style>