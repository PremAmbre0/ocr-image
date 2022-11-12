<template>
    <div class="editor" v-if="config">
        <div class="image-list-container">
            <div class="pages" v-for="page in config.pages" :key="page.id" @click="updateSelectedPage(page)">
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
                <template v-if="this.selectedPageConfig.fields">
                    <div v-for="(key, field) in selectedPageConfig.fields" :key="field"
                        :class="'bounding-box ' + getSanitizedFieldName(field)" @click="setSelectedField(field, key)"
                        @mousedown="startBBDrag($event, field)">
                        <div class="bb_side right"></div>
                        <div class="bb_side top"></div>
                        <div class="bb_side bottom"></div>
                        <div class="bb_side left"></div>
                    </div>
                </template>
                <template v-if="this.selectedPageConfig.fields">
                    <div v-for="field in linkedFields" :key="`${field}isLinked}`"
                        :class="'bounding-box ' + getSanitizedFieldName(field) + 'isLinked'"
                        @click="setSelectedField(field)">
                        <div class="bb_side right"></div>
                        <div class="bb_side top"></div>
                        <div class="bb_side bottom"></div>
                        <div class="bb_side left"></div>
                    </div>
                </template>
            </div>
        </div>
        <div class="fields-and-coords-container">
            <div v-for="(key, field) in selectedPageConfig.fields" :key="field" class="field-list">
                <div class="fieldname">
                    {{ field }}
                </div>
                <v-menu absolute offset-y style="max-width: 600px">
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn icon v-bind="attrs" v-on="on">
                            <v-icon>
                                mdi-dots-vertical
                            </v-icon>
                        </v-btn>
                    </template>

                    <v-list>
                        <v-list-item v-for="(item, index) in items" :key="index">
                            <v-list-item-title>{{ item.title }}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </div>

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
            changeInHeightOfOriginalImageWRTRenderedImage: null,

            relativeTopOfTheImageToBeTagged: null,
            relativeTop: null,
            relativeLeft: null,
            scrollBarWidth: null,
            selectedField: null,
            BBToBeEditied: null,
            linkedFields: [],
            moveBB: null,
            showOptions: false,
            items: [
                { title: 'Hide' },
                { title: 'Edit' },
                { title: 'Delete' },
                { title: 'Link Field' }
            ],
        }
    },
    created() {
        if (sessionStorage.getItem('config')) {
            this.setConfig(JSON.parse(sessionStorage.getItem('config')));
        }
        this.selectedPageConfig = this.config.pages[0];
        const fields = new Object(this.config.pages[0].fields);
        for (const field in fields) {
            if ('question' in this.selectedPageConfig.fields[field]) {
                this.linkedFields.push(field)
            }
        }

    },
    mounted() {
        window.addEventListener('resize', this.handleWindowResize);
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
        updateSelectedPage(page) {
            this.selectedPageConfig = page;
            this.$nextTick(() => {
                this.setPageConstants();
            })
        },
        setPageConstants() {
            const imageContainer = document.querySelector('.editor-image-container');
            const image = document.querySelector('.image-wrapper-image');
            this.scrollBarWidth = imageContainer.offsetWidth - imageContainer.clientWidth;
            this.imageToBeTaggedBoundingCLient = image.getBoundingClientRect();
            this.imageContainerBoundingCLient = imageContainer.getBoundingClientRect();
            this.imageContainerBoundingCLient.width -= this.scrollBarWidth;
            this.changeInWidthOfRenderedImageWRTOriginalImage = this.toFixedDecimal(this.imageToBeTaggedBoundingCLient.width / (this.selectedPageConfig.width / 100), 3);
            this.changeInHeightOfRenderedImageWRTOriginalImage = this.toFixedDecimal(this.imageToBeTaggedBoundingCLient.height / (this.selectedPageConfig.height / 100), 3);

            this.relativeTop = this.toFixedDecimal(image.getBoundingClientRect().top - this.imageContainerBoundingCLient.top, 3)
            this.relativeLeft = this.toFixedDecimal(image.getBoundingClientRect().left - this.imageContainerBoundingCLient.left, 3)
            this.changeInHeightOfOriginalImageWRTRenderedImage = this.toFixedDecimal(this.selectedPageConfig.height / ((this.imageContainerBoundingCLient.height) / 100), 3);
            this.renderBoundingBoxes();
        },
        setSelectedField(field, key) {
            if (field) {
                this.selectedField = { name: field, ...key }
            }
            else {
                this.selectedField = { name: field, ...this.selectedPageConfig.fields[field] }
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
            let height = `${this.toFixedDecimal(((field.h / 100) * this.changeInHeightOfRenderedImageWRTOriginalImage) / (this.imageContainerBoundingCLient.height / 100), 3)}%`;
            let width = `${this.toFixedDecimal(((field.w / 100) * this.changeInWidthOfRenderedImageWRTOriginalImage) / (this.imageContainerBoundingCLient.width / 100), 3)}%`;
            let top = `${this.toFixedDecimal(((field.y / 100) * this.changeInHeightOfRenderedImageWRTOriginalImage + this.relativeTop) / (this.imageContainerBoundingCLient.height / 100), 3)}%`;
            let left = `${this.toFixedDecimal(((field.x / 100) * this.changeInWidthOfRenderedImageWRTOriginalImage + this.relativeLeft) / ((this.imageContainerBoundingCLient.width) / 100), 3)}%`;
            return { height, width, top, left }
        },
        updateStyleAttriutesOfBBForGivenLinkedField(field) {
            console.log(field)
            let sanatizedFieldName = this.getSanitizedFieldName(field);
            let linkedBB = document.querySelector(`.${sanatizedFieldName}isLinked`);
            let filedObj = this.selectedPageConfig.fields[field]
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
                this.setPageConstants()
            }, 100);
        },

        startBBDrag(e, field) {
            e = e || window.event;
            e.preventDefault();

            const dragBB = (e) => {
                let newX = prevX - e.clientX;
                let newY = prevY - e.clientY;

                BB.style.top = bbTop - newY + "px";
                BB.style.left = bbLeft - newX + "px";

            }
            const dragBBEnd = () => {
                window.removeEventListener('mousemove', dragBB);
                window.removeEventListener('mouseup', dragBBEnd);

                this.selectedPageConfig.fields[field].y = ((parseInt(BB.style.top) - this.relativeTop) / (this.imageToBeTaggedBoundingCLient.height / 100)) * (this.selectedPageConfig.height / 100);
                this.selectedPageConfig.fields[field].x = ((parseInt(BB.style.left) - this.relativeLeft) / (this.imageToBeTaggedBoundingCLient.width / 100)) * (this.selectedPageConfig.width / 100);


                if ('question' in this.selectedPageConfig.fields[field]) {
                    this.updateStyleAttriutesOfBBForGivenLinkedField(field)
                }
                this.updateStyleAttriutesOfBBForGivenField(field);
            }

            let sanatizedFieldName = this.getSanitizedFieldName(field);
            let BB = document.querySelector(`.${sanatizedFieldName}`);

            window.addEventListener('mousemove', dragBB);
            window.addEventListener('mouseup', dragBBEnd);

            let bbTop = BB.getBoundingClientRect().y - this.imageContainerBoundingCLient.y
            let bbLeft = BB.getBoundingClientRect().x - this.imageContainerBoundingCLient.x;

            let prevX = e.clientX;
            let prevY = e.clientY;
        },
        // updateConfig(){
        //     let tempConfigstring = JSON.stringify(this.config)
        //     let tempConfig = JSON.parse(tempConfigstring)

        // }

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
                pointer-events: none;
                object-fit: scale-down;
            }

            &-description {
                width: 100%;
                text-align: center;
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
            cursor: move;

            &:active {
                background-color: rgba($color: red, $alpha: 0.25);
            }
        }

        .image-wrapper img {
            width: 100%;
            object-fit: contain;
            // opacity: 0;

        }
    }

    .fields-and-coords-container {
        height: 100vh;
        width: 20vw;
        position: relative;
        overflow-y: auto;
        overflow-x: hidden;
    }

    .field-list {
        display: flex;
        overflow-y: auto;
        overflow-x: hidden;
        justify-content: space-between;
        padding: 2%;
        border: solid 1px black;
    }
}
</style>