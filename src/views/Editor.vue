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
                <div class="newbb"></div>
                <img class="image-wrapper-image"
                    :src="'http://34.100.140.210/files/' + config.id + '/' + this.selectedPageConfig.id + '.png'" alt=""
                    @load="setPageConstants" @mousedown="startNewBBDraw($event)" draggable="false">
                <template v-if="this.selectedPageConfig.fields">
                    <div v-for="(key, field) in selectedPageConfig.fields" :key="field"
                        :class="['bounding-box ' + getSanitizedFieldName(field)]" @click="setSelectedField(field, key)"
                        @mousedown="handleBBMouseDown($event, field)">
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

        <div class="fields-and-coords-wrapper">
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
            <div class="coords-showcase">
                <div v-for="(value, key ) in selectedField" :key="value">
                    {{ key }}:{{ value }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import { eventBus } from "@/eventBus";
import { v4 as uuidv4 } from 'uuid';
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
            needForRaf: null,
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
        if (localStorage.getItem('config')) {
            this.setConfig(JSON.parse(localStorage.getItem('config')));
        }
        this.selectedPageConfig = this.config.pages[0];
        const fields = new Object(this.config.pages[0].fields);
        for (const field in fields) {
            if ('question' in this.selectedPageConfig.fields[field]) {
                this.linkedFields.push(field)
            }
        }
        console.log(this.config)
        eventBus.$on('reloadConfig', () => {
            let popppedConfig = JSON.parse(JSON.stringify(this.undoRef.pop()));

            this.setConfig(popppedConfig)
            this.selectedPageConfig = this.config.pages[0];

            this.setPageConstants()
        })

    },
    mounted() {
        window.addEventListener('resize', this.handleWindowResize);
    },
    computed: {
        ...mapGetters(['config', 'undoRef']),
    },
    methods: {
        ...mapMutations(['setConfig']),
        getSanitizedFieldName(field) {
            if (field) {
                return field.trim().toLowerCase();
            }
        },
        updateConfig() {
            let tempConfigString = JSON.stringify(this.config);
            let tempConfig = JSON.parse(tempConfigString);

            let indexOfselectedPage = this.config['pages'].indexOf(this.config['pages'].find(o => o.description === this.selectedPageConfig.description));

            tempConfig.pages[indexOfselectedPage] = this.selectedPageConfig

            this.setConfig(tempConfig);
            this.pushToUndoRef(tempConfig);

        },
        pushToUndoRef(config) {
            this.undoRef.push(config);
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

            this.relativeTop = this.toFixedDecimal(image.getBoundingClientRect().top - this.imageContainerBoundingCLient.top, 3) + imageContainer.scrollTop;
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
        startBBResize(e, field) {
            let sanatizedFieldName = this.getSanitizedFieldName(field);
            let BB = document.querySelector(`.${sanatizedFieldName}`);
            let currentResizer;
            const resizers = BB.childNodes;


            let resizeBB = (e) => {
                let prevY = e.clientY;
                let prevX = e.clientX;
                currentResizer = e.target

                const bbBoundingClientRect = BB.getBoundingClientRect();
                const imageContainer = document.querySelector('.editor-image-container');

                let bbTop = (bbBoundingClientRect.y - this.imageContainerBoundingCLient.y) + imageContainer.scrollTop;
                let bbLeft = bbBoundingClientRect.x - this.imageContainerBoundingCLient.x;


                let startBBResize = (e) => {
                    if (this.needForRaf) this.needForRaf = null;
                    this.needForRaf = requestAnimationFrame(() => {
                        let newY = prevY - e.clientY;
                        let newX = prevX - e.clientX;

                        if (currentResizer.classList.contains('top')) {
                            BB.style.top = bbTop - newY + "px";
                            BB.style.height = (bbBoundingClientRect.height + newY) + "px";
                        }
                        else if (currentResizer.classList.contains('left')) {
                            BB.style.width = (bbBoundingClientRect.width + newX) + "px";
                            BB.style.left = bbLeft - newX + "px"
                        }
                        else if (currentResizer.classList.contains('bottom')) {
                            BB.style.height = (bbBoundingClientRect.height - newY) + "px";
                        } else if (currentResizer.classList.contains('right')) {
                            BB.style.width = (bbBoundingClientRect.width - newX) + "px";
                        }
                    })

                }

                let endBBResize = (e) => {
                    window.removeEventListener('mousemove', startBBResize)
                    window.removeEventListener('mouseup', endBBResize)

                    if (e.target.classList.contains('top')) {
                        this.selectedPageConfig.fields[field].y = ((parseInt(BB.style.top) - this.relativeTop) / (this.imageToBeTaggedBoundingCLient.height / 100)) * (this.selectedPageConfig.height / 100);
                        this.selectedPageConfig.fields[field].h = (parseInt(BB.style.height) / (this.imageToBeTaggedBoundingCLient.height / 100)) * (this.selectedPageConfig.height / 100);

                    }
                    else if (e.target.classList.contains('left')) {
                        this.selectedPageConfig.fields[field].x = ((parseInt(BB.style.left) - this.relativeLeft) / (this.imageToBeTaggedBoundingCLient.width / 100)) * (this.selectedPageConfig.width / 100);
                        this.selectedPageConfig.fields[field].w = (parseInt(BB.style.width) / (this.imageToBeTaggedBoundingCLient.width / 100)) * (this.selectedPageConfig.width / 100);
                    }
                    else if (e.target.classList.contains('bottom')) {
                        this.selectedPageConfig.fields[field].h = (parseInt(BB.style.height) / (this.imageToBeTaggedBoundingCLient.height / 100)) * (this.selectedPageConfig.height / 100);

                    } else if (e.target.classList.contains('right')) {
                        this.selectedPageConfig.fields[field].w = (parseInt(BB.style.width) / (this.imageToBeTaggedBoundingCLient.width / 100)) * (this.selectedPageConfig.width / 100);
                    }

                }
                window.addEventListener('mousemove', startBBResize)
                window.addEventListener('mouseup', endBBResize)
            }
            resizers.forEach((resizer) => {
                resizer.addEventListener("mousedown", resizeBB(e));
            })

        },
        handleBBMouseDown(e, field) {
            if (e.target.classList.contains('bb_side')) this.startBBResize(e, field);
            if (e.target.classList.contains('bounding-box')) this.startBBDrag(e, field)
        },

        startBBDrag(e, field) {
            e = e || window.event;
            e.preventDefault();

            const dragBB = (e) => {
                if (this.needForRaf) this.needForRaf = null;
                this.needForRaf = requestAnimationFrame(() => {
                    let newX = prevX - e.clientX;
                    let newY = prevY - e.clientY;
                    BB.style.top = bbTop - newY + "px";
                    BB.style.left = bbLeft - newX + "px";
                })
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
                this.$nextTick(() => {
                    this.updateConfig()
                })
            }

            let sanatizedFieldName = this.getSanitizedFieldName(field);
            let BB = document.querySelector(`.${sanatizedFieldName}`);

            window.addEventListener('mousemove', dragBB);
            window.addEventListener('mouseup', dragBBEnd);

            const imageContainer = document.querySelector('.editor-image-container');
            let bbTop = (BB.getBoundingClientRect().y - this.imageContainerBoundingCLient.y) + imageContainer.scrollTop;
            let bbLeft = BB.getBoundingClientRect().x - this.imageContainerBoundingCLient.x;

            let prevX = e.clientX;
            let prevY = e.clientY;
        },
        startNewBBDraw(e) {
            e.preventDefault();
            let newBBDraw = (e) => {
                // const imageContainer = document.querySelector('.editor-image-container');

                let newY = (e.clientY - prevY);
                let newX = e.clientX - prevX;
                newBB.style.height = newY + "px";
                newBB.style.width = newX + "px";
            }
            let endNewBBDraw = () => {
                window.removeEventListener('mousemove', newBBDraw);
                window.removeEventListener('mouseup', endNewBBDraw);
                const newField = "new_field_" + uuidv4();
                const newBornBBCoords = {
                    y: ((parseInt(newBB.style.top) - this.relativeTop) / (this.imageToBeTaggedBoundingCLient.height / 100)) * (this.selectedPageConfig.height / 100),
                    x: ((parseInt(newBB.style.left) - this.relativeLeft) / (this.imageToBeTaggedBoundingCLient.width / 100)) * (this.selectedPageConfig.width / 100),
                    h: (parseInt(newBB.style.height) / (this.imageToBeTaggedBoundingCLient.height / 100)) * (this.selectedPageConfig.height / 100),
                    w: (parseInt(newBB.style.width) / (this.imageToBeTaggedBoundingCLient.width / 100)) * (this.selectedPageConfig.width / 100),
                }

                // this.selectedPageConfig.fields[newField] = newBornBBCoords;
                this.$set(this.selectedPageConfig.fields, newField, newBornBBCoords)
                this.$nextTick(() => {
                    this.setPageConstants();
                })
            }
            let newBB = document.querySelector('.newbb');
            newBB.style.top = (e.offsetY + this.relativeTop) + "px";
            newBB.style.left = (e.offsetX + this.relativeLeft) + "px";
            let prevY = e.clientY;
            let prevX = e.clientX;

            window.addEventListener('mousemove', newBBDraw);
            window.addEventListener('mouseup', endNewBBDraw);
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

            .bb_side {
                position: absolute;
            }

            .top {
                top: -2px;
                height: 2px;
                width: 100%;
                cursor: n-resize;
            }

            .right {
                top: 0;
                right: -2px;
                height: 100%;
                width: 2px;
                cursor: e-resize;
            }

            .bottom {
                bottom: -2px;
                height: 2px;
                width: 100%;
                cursor: n-resize;
            }

            .left {
                top: 0;
                left: -2px;
                height: 100%;
                width: 2px;
                cursor: e-resize;
            }
        }

        .image-wrapper img {
            width: 100%;
            object-fit: contain;

        }
    }

    .fields-and-coords-wrapper {
        height: 100vh;
        width: 20vw;
        position: relative;
    }

    .fields-and-coords-container {
        height: 60vh;
        width: 20vw;
        position: absolute;
        top: 0;
        right: 0;
        overflow-y: auto;
        overflow-x: hidden;

    }

    .coords-showcase {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 20vw;
        height: 40vh;
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

    .newbb {
        position: absolute;
        background-color: bisque;
        background-color: rgba($color: red, $alpha: 0.25);
    }
}
</style>