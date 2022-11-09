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
                    :class="'bounding-box ' + getSanitizedFieldName(field)" @click="setSelectedField(field, key)">
                    <div data-v-0be0641e="" class="bb_side right"></div>
                    <div data-v-0be0641e="" class="bb_side top"></div>
                    <div data-v-0be0641e="" class="bb_side bottom"></div>
                    <div data-v-0be0641e="" class="bb_side left"></div>
                </div>
                <div v-for="field in linkedFields" :key="`${field}isLinked}`"
                    :class="'bounding-box ' + getSanitizedFieldName(field) +'isLinked'"  @click="setSelectedField(field, key)">
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
            changeInWidthOfRenderedImageWRTOriginalImage: null,
            changeInHeightOfRenderedImageWRTOriginalImage: null,
            relativeTopOfTheImageToBeTagged: null,
            relativeTop: null,
            relativeLeft: null,
            selectedField: null,
            BBToBeEditied: null,
            linkedFields: [],
        }
    },
    created() {
        if (sessionStorage.getItem('config')) {
            this.setConfig(JSON.parse(sessionStorage.getItem('config')));
        }
        this.selectedPageConfig = this.config.pages[0];
        console.log(this.selectedPageConfig)
        const fields = new Object(this.config.pages[0].fields);
        for (const field in fields) {
            if('question' in this.selectedPageConfig.fields[field]) {
                this.linkedFields.push(field)
            }
        }
        console.log(this.linkedFields)
        // window.addEventListener('mousemove', this.handleMouseMove());
        // window.addEventListener('mouseup', this.handleMouseUp());
        window.addEventListener('resize', this.handleWindowResize());
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
            this.changeInWidthOfRenderedImageWRTOriginalImage = this.toFixedDecimal(this.imageToBeTaggedBoundingCLient.width / (this.selectedPageConfig.width / 100), 3);
            this.changeInHeightOfRenderedImageWRTOriginalImage = this.toFixedDecimal(this.imageToBeTaggedBoundingCLient.height / (this.selectedPageConfig.height / 100), 3);

            this.relativeTop = this.toFixedDecimal(image.getBoundingClientRect().top + window.scrollY - this.imageContainerBoundingCLient.top + window.scrollY, 3)
            this.relativeLeft = this.toFixedDecimal(image.getBoundingClientRect().left - this.imageContainerBoundingCLient.left, 3)
            console.log(this.relativeLeft,this.relativeTop)
            this.renderBoundingBoxes();
        },
        setSelectedField(field, key) {
            if (field) {
                this.selectedField = { name: field, ...key }
            }
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
                }
                this.updateStyleAttriutesOfBBForGivenField(field)
            }
        },
        getBBCoordsForGivenField(field) {

            let height = `${((field.h / 100) * this.changeInHeightOfRenderedImageWRTOriginalImage) / (this.imageContainerBoundingCLient.height / 100)}%`;
            let width = `${((field.w / 100) * this.changeInWidthOfRenderedImageWRTOriginalImage) / (this.imageContainerBoundingCLient.width / 100)}%`;
            let top = `${((field.y / 100) * this.changeInHeightOfRenderedImageWRTOriginalImage + this.relativeTop) / (this.imageContainerBoundingCLient.height / 100)}%`;
            let left = `${((field.x / 100) * this.changeInWidthOfRenderedImageWRTOriginalImage + this.relativeLeft) / ((this.imageContainerBoundingCLient.width) / 100)}%`;

            return { height, width, top, left }
        },
        updateStyleAttriutesOfBBForGivenLinkedField(field) {
            let sanatizedFieldName = this.getSanitizedFieldName(field);  
            let linkedBB = document.querySelector(`.${sanatizedFieldName}isLinked`);
            let  filedObj = this.selectedPageConfig.fields[field]
            const coords = this.getBBCoordsForGivenField(filedObj.question)
            linkedBB.style.height = coords.height;
            linkedBB.style.width = coords.width;
            linkedBB.style.top = coords.top;
            linkedBB.style.left = coords.left;
        },
        updateStyleAttriutesOfBBForGivenField(field) {
            let sanatizedFieldName = this.getSanitizedFieldName(field);
            let BB = document.querySelector(`.${sanatizedFieldName}`);
            const coords = this.getBBCoordsForGivenField(this.selectedPageConfig.fields[field])
            BB.style.height = coords.height;
            BB.style.width = coords.width;
            BB.style.top = coords.top;
            BB.style.left = coords.left;
        },
        handleWindowResize() {
            setTimeout(() => {
                console.log('hui')
                this.setPageConstants()
            }, 100);
        },
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
        }

        .image-wrapper img {
            width: 100%;
            object-fit:contain;
            // opacity: 0;

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