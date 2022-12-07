<template>
    <div class="editor" v-if="config">
        <div class="image-list-container">
            <div class="pages" v-for="page in config.pages" :key="page.id" @click="updateSelectedPage(page)">
                <img class="pages-img" :src="'http://34.93.226.10/files/' + config.id + '/' + page.id + '.png'"
                    alt="" />
                <div class="pages-description">
                    {{ page.description }}
                </div>
            </div>
        </div>
        <div class="editor-image-container">
            <div v-if="selectedPageConfig" class="image-wrapper"
                :style="{ height: this.imageToBeTaggedHeight + 'px', width: this.imageToBeTaggedWidth + 'px' }"
                @mouseleave.stop="handleMouseLeave()" @mouseover.stop="handleMouseOver()">
                <div class="newbb"></div>
                <img class="image-wrapper-image"
                    :style="{ height: this.imageToBeTaggedHeight + 'px', width: this.imageToBeTaggedWidth + 'px' }"
                    :src="'http://34.93.226.10/files/' + config.id + '/' + this.selectedPageConfig.id + '.png'" alt=""
                    @load="setPageConstants" @mousedown="startNewBBDraw($event)" draggable="false">
                <template v-if="this.selectedPageConfig.fields">
                    <div v-for="(key, field) in selectedPageConfig.fields" :key="field"
                        :class="['bounding-box ' + getSanitizedFieldName(field), { 'active': selectedField && selectedField === field }, { 'hidden': fieldsToHide.includes(field) }]"
                        @click="setSelectedField(field)" @mousedown="handleBBMouseDown($event, field, false)">
                        <div class="bb_side right"></div>
                        <div class="bb_side top"></div>
                        <div class="bb_side bottom"></div>
                        <div class="bb_side left"></div>
                    </div>
                </template>
                <template v-if="this.selectedPageConfig.fields">
                    <div v-for="field in linkedFields" :key="`${field}isLinked}`"
                        :class="['bounding-box ' + getSanitizedFieldName(field) + 'isLinked', { 'question-active': selectedField && selectedField === field }, { 'hidden': fieldsToHide.includes(field) }]"
                        @click="setSelectedField(field)" @mousedown="handleBBMouseDown($event, field, true)">
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
                <div v-for="(key, field) in     selectedPageConfig.fields" :key="field" class="field-list"
                    :class="[getSanitizedFieldName(field) + 'menu', { 'active': selectedField && selectedField === field }]"
                    @click="setSelectedField(field), bringBBIntoView(field)">
                    <div class="fieldname">
                        <span v-if="fieldBeingEdited !== field">{{ field }}</span>
                        <v-text-field v-else :label="field" :value="field" autofocus @focus="handleInputFieldFocus"
                            @keyup="handleFieldEditKeyUp($event, field)"></v-text-field>
                    </div>
                    <v-menu absolute offset-y style="max-width: 600px">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn icon v-bind="attrs" v-on="on">
                                <v-icon>
                                    mdi-dots-vertical
                                </v-icon>
                            </v-btn>
                        </template>

                        <v-list class="options">
                            <v-btn v-if="fieldsToHide.includes(field)" plain depressed tile @click="showField(field)">
                                Show</v-btn>
                            <v-btn v-else plain depressed tile @click="hideField(field)">Hide</v-btn>
                            <v-btn plain depressed tile @click="handleFieldEdit(field)">Edit</v-btn>
                            <v-btn plain depressed tile @click="deleteField(field)">Delete</v-btn>
                            <v-btn plain depressed tile @click="handleNewLinkedBBDraw(field)">Link Field</v-btn>
                        </v-list>
                    </v-menu>
                </div>
            </div>
            <div class="coords-showcase" v-if="selectedField">
                <span class="field-name">Name: {{ selectedField }}</span>
                <template v-for="(coord, index) of coordsPositionOrder" id="coords">
                    <div :key="index">
                        <span v-if="dimensionBeingEdited !== coord" @click.stop="handleDimensionCoordsClick(coord)">{{
                                coord
                        }}:{{
        selectedPageConfig.fields[selectedField][coord]
}}</span>
                        <v-text-field v-else-if="
                            dimensionBeingEdited == coord && !isLinkedFieldDimensionsBeingEdited
                        " type="number" :label="coord" :value="selectedPageConfig.fields[selectedField][coord]"
                            autofocus @click.stop="" @keyup="handleDimensionCoordEditKeyUp($event, coord)"
                            @input="handleDimensionCoordEditInput($event, coord)"></v-text-field>
                    </div>
                </template>

                <template v-if="doesFieldHaveLink(selectedField)">
                    <span class="field-name">Question</span>
                    <template v-for="(coord, index) of coordsPositionOrder" id="coords">
                        <div :key="'question_' + coord + index">
                            <span v-if="dimensionBeingEdited !== coord"
                                @click.stop="handleLinkedFieldDimensionCoordsClick(coord)">{{
                                        coord
                                }}:{{
        selectedPageConfig.fields[selectedField]['question'][coord]
}}</span>
                            <v-text-field v-else-if="
                                dimensionBeingEdited == coord && isLinkedFieldDimensionsBeingEdited
                            " type="number" :label="coord"
                                :value="selectedPageConfig.fields[selectedField]['question'][coord]" autofocus
                                @click.stop="" @keyup="handleDimensionCoordEditKeyUp($event, coord)"
                                @input="handleDimensionCoordEditInput($event, coord)"></v-text-field>
                        </div>
                    </template>
                </template>
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
            imageToBeTaggedHeight: null,
            imageToBeTaggedWidth: null,
            imageToBeTaggedBoundingCLient: null,
            imageContainerBoundingCLient: null,
            changeInWidthOfRenderedImageWRTOriginalImage: null,
            changeInHeightOfRenderedImageWRTOriginalImage: null,
            changeInHeightOfOriginalImageWRTRenderedImage: null,
            relativeTopOfTheImageToBeTagged: null,
            relativeTop: null,
            relativeLeft: null,
            scrollBarWidth: null,
            selectedField: '',
            BBToBeEditied: null,
            linkedFields: [],
            moveBB: null,
            needForRaf: null,
            showOptions: false,
            hasBBChanged: false,
            fieldsToHide: [],
            initialImageContainerHeight: null,
            initialImageContainerWidth: null,
            newFieldBeingLinked: null,
            fieldBeingEdited: null,
            dimensionBeingEdited: null,
            isLinkedFieldDimensionsBeingEdited: false,
            isNewFieldBeingLinked: false,
            mouseOnImage: false,
            items: [
                { title: 'Edit' },
                { title: 'Delete' },
                { title: 'Link Field' }
            ],
            coordsPositionOrder: ['x', 'y', 'h', 'w'],
        }
    },
    created() {
        if (localStorage.getItem('config')) {
            this.setConfig(JSON.parse(localStorage.getItem('config')));
            this.setUn
        }
        this.selectedPageConfig = this.config.pages[0];
        this.updateConfig();
        const fields = new Object(this.config.pages[0].fields);
        for (const field in fields) {
            if ('question' in this.selectedPageConfig.fields[field]) {
                this.linkedFields.push(field)
            }
        }
        eventBus.$on('handleZoom', (data) => {
            let onePrecentWidth = this.toFixedDecimal(this.initialImageContainerWidth / 100, 3)
            let onePrecentHeight = this.toFixedDecimal(this.initialImageContainerHeight / 100, 3)

            this.imageToBeTaggedWidth = this.toFixedDecimal(onePrecentWidth * data, 3);
            this.imageToBeTaggedHeight = this.toFixedDecimal(onePrecentHeight * data, 3)

            this.$nextTick(() => {
                this.setPageConstants();
            })
        })
        eventBus.$on('undoConfig', this.handleUndo);
    },
    mounted() {
        window.addEventListener('resize', this.handleWindowResize);
        this.setDimensionsOfImage()
        this.$nextTick(() => {
            const imageContainer = document.querySelector('.image-wrapper-image');
            this.initialImageContainerHeight = imageContainer.getBoundingClientRect().height;
            this.initialImageContainerWidth = imageContainer.getBoundingClientRect().width;
        })
    },
    computed: {
        ...mapGetters(['config', 'undoRef']),
    },
    methods: {
        ...mapMutations(['setConfig', 'updateUndoRef', 'setUndoRef']),
        switchToInput(e) {
            e.target.nextSibling.focus;
            console.log(e.target.nextSibling.focus)
        },
        setDimensionsOfImage() {
            const imageContainer = document.querySelector('.editor-image-container');
            // let widthRatio = imageContainer.getBoundingClientRect().width / this.selectedPageConfig.width;
            // let HeightRatio = imageContainer.getBoundingClientRect().height / this.selectedPageConfig.height;
            // let ratio = widthRatio < HeightRatio ? widthRatio : HeightRatio;
            // this.imageToBeTaggedHeight = Math.round(this.selectedPageConfig.height * ratio);
            // this.imageToBeTaggedWidth = Math.round(this.selectedPageConfig.width * ratio);

            let changeInDimensionInPercenntage = imageContainer.getBoundingClientRect().width / (this.selectedPageConfig.width / 100)
            this.imageToBeTaggedWidth = ((this.selectedPageConfig.width / 100) * changeInDimensionInPercenntage)
            this.imageToBeTaggedHeight = (this.selectedPageConfig.height / 100) * changeInDimensionInPercenntage
        },
        getSanitizedFieldName(field) {
            if (field) {
                return field.trim().toLowerCase();
            }
        },
        hideField(field) {
            this.fieldsToHide.push(field);
        },
        showField(field) {
            this.fieldsToHide = this.fieldsToHide.filter(e => e !== field)
        },
        updateConfig() {
            let tempConfig = JSON.parse(JSON.stringify(this.config));

            let indexOfselectedPage = this.config['pages'].indexOf(this.config['pages'].find(o => o.description === this.selectedPageConfig.description));

            tempConfig.pages[indexOfselectedPage] = this.selectedPageConfig
            this.setConfig(tempConfig);
            this.updateUndoRef({
                'indexOfselectedPage': indexOfselectedPage,
                'config': JSON.parse(JSON.stringify(tempConfig))
            })
            this.selectedPageConfig = this.config.pages[indexOfselectedPage];
        },
        handleUndo() {
            let tempUndoRef = JSON.parse(JSON.stringify(this.undoRef));
            tempUndoRef.pop()
            this.setConfig(JSON.parse(JSON.stringify(tempUndoRef[tempUndoRef.length - 1].config)))
            this.setUndoRef(tempUndoRef)
            this.selectedPageConfig = this.config.pages[tempUndoRef[tempUndoRef.length - 1].indexOfselectedPage];
            this.$nextTick(() => {
                this.setPageConstants();
            })
        },
        updateSelectedPage(page) {
            this.selectedPageConfig = page;
            this.$nextTick(() => {
                this.setPageConstants();
            })
        },
        deleteField(field) {
            if (this.selectedField == field) {
                console.log(this.selectedField = null)
            }
            if ('question' in this.selectedPageConfig.fields[field]) {
                this.linkedFields = this.linkedFields.filter(e => e !== field)
            }
            this.$delete(this.selectedPageConfig.fields, field);
            this.$nextTick(() => {
                this.setPageConstants();
                this.updateConfig();
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
            this.relativeLeft = this.toFixedDecimal(image.getBoundingClientRect().left - this.imageContainerBoundingCLient.left, 3) + imageContainer.scrollLeft;
            this.changeInHeightOfOriginalImageWRTRenderedImage = this.toFixedDecimal(this.selectedPageConfig.height / ((this.imageContainerBoundingCLient.height) / 100), 3);
            this.renderBoundingBoxes();
        },
        setSelectedField(field) {
            if (field) {
                this.selectedField = field;
            }
        },
        handleInputFieldFocus(e) {
            if (e.target) {
                e.target.select();
            }
        },
        bringBBIntoView(field) {
            let sanatizedFieldName = this.getSanitizedFieldName(field);
            let BB = document.querySelector(`.${sanatizedFieldName}`);
            BB.scrollIntoView();
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
            this.$nextTick(() => {
                BB.style.height = coords.height;
                BB.style.width = coords.width;
                BB.style.top = coords.top;
                BB.style.left = coords.left;
            })
        },
        handleWindowResize() {
            setTimeout(() => {
                this.setDimensionsOfImage();
                this.setPageConstants()
            }, 100);
        },
        startBBResize(e, field, isLinked) {
            console.log(isLinked)
            let sanatizedFieldName = this.getSanitizedFieldName(field);
            let BB;
            if (isLinked) {
                BB = document.querySelector(`.${sanatizedFieldName}isLinked`);
            }
            else {

                BB = document.querySelector(`.${sanatizedFieldName}`);
            }
            let currentResizer = e.target;

            let resizeBB = (e) => {
                let prevY = e.clientY;
                let prevX = e.clientX;
                currentResizer = e.target

                const bbBoundingClientRect = BB.getBoundingClientRect();
                const imageContainer = document.querySelector('.editor-image-container');

                let bbTop = (bbBoundingClientRect.y - this.imageContainerBoundingCLient.y) + imageContainer.scrollTop;
                let bbLeft = bbBoundingClientRect.x - this.imageContainerBoundingCLient.x; ++imageContainer.scrollLeft;


                let startBBResize = (e) => {
                    e.stopPropagation();
                    if (this.mouseOnImage) {
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

                }

                let endBBResize = (e) => {
                    window.removeEventListener('mousemove', startBBResize)
                    window.removeEventListener('mouseup', endBBResize)

                    if (isLinked) {
                        if (e.target.classList.contains('top')) {
                            this.selectedPageConfig.fields[field]['question'].y = this.toFixedDecimal(((parseInt(BB.style.top) - this.relativeTop) / (this.imageToBeTaggedBoundingCLient.height / 100)) * (this.selectedPageConfig.height / 100), 0);
                            this.selectedPageConfig.fields[field]['question'].h = this.toFixedDecimal((parseInt(BB.style.height) / (this.imageToBeTaggedBoundingCLient.height / 100)) * (this.selectedPageConfig.height / 100), 0);

                        }
                        else if (e.target.classList.contains('left')) {
                            this.selectedPageConfig.fields[field]['question'].x = this.toFixedDecimal(((parseInt(BB.style.left) - this.relativeLeft) / (this.imageToBeTaggedBoundingCLient.width / 100)) * (this.selectedPageConfig.width / 100), 0);
                            this.selectedPageConfig.fields[field]['question'].w = this.toFixedDecimal((parseInt(BB.style.width) / (this.imageToBeTaggedBoundingCLient.width / 100)) * (this.selectedPageConfig.width / 100), 0);
                        }
                        else if (e.target.classList.contains('bottom')) {
                            this.selectedPageConfig.fields[field]['question'].h = this.toFixedDecimal((parseInt(BB.style.height) / (this.imageToBeTaggedBoundingCLient.height / 100)) * (this.selectedPageConfig.height / 100), 0);

                        } else if (e.target.classList.contains('right')) {
                            this.selectedPageConfig.fields[field]['question'].w = this.toFixedDecimal((parseInt(BB.style.width) / (this.imageToBeTaggedBoundingCLient.width / 100)) * (this.selectedPageConfig.width / 100), 0);
                        }
                    }
                    else {

                        if (e.target.classList.contains('top')) {
                            this.selectedPageConfig.fields[field].y = this.toFixedDecimal(((parseInt(BB.style.top) - this.relativeTop) / (this.imageToBeTaggedBoundingCLient.height / 100)) * (this.selectedPageConfig.height / 100), 0);
                            this.selectedPageConfig.fields[field].h = this.toFixedDecimal((parseInt(BB.style.height) / (this.imageToBeTaggedBoundingCLient.height / 100)) * (this.selectedPageConfig.height / 100), 0);

                        }
                        else if (e.target.classList.contains('left')) {
                            this.selectedPageConfig.fields[field].x = this.toFixedDecimal(((parseInt(BB.style.left) - this.relativeLeft) / (this.imageToBeTaggedBoundingCLient.width / 100)) * (this.selectedPageConfig.width / 100), 0);
                            this.selectedPageConfig.fields[field].w = this.toFixedDecimal((parseInt(BB.style.width) / (this.imageToBeTaggedBoundingCLient.width / 100)) * (this.selectedPageConfig.width / 100), 0);
                        }
                        else if (e.target.classList.contains('bottom')) {
                            this.selectedPageConfig.fields[field].h = this.toFixedDecimal((parseInt(BB.style.height) / (this.imageToBeTaggedBoundingCLient.height / 100)) * (this.selectedPageConfig.height / 100), 0);

                        } else if (e.target.classList.contains('right')) {
                            this.selectedPageConfig.fields[field].w = this.toFixedDecimal((parseInt(BB.style.width) / (this.imageToBeTaggedBoundingCLient.width / 100)) * (this.selectedPageConfig.width / 100), 0);
                        }
                    }

                    this.$nextTick(() => {
                        this.updateConfig()
                    })

                }
                window.addEventListener('mousemove', startBBResize)
                window.addEventListener('mouseup', endBBResize)
            }
            currentResizer.addEventListener("mousedown", resizeBB(e));

        },
        handleBBMouseDown(e, field, isLinked) {
            if (e.target.classList.contains('bb_side')) this.startBBResize(e, field, isLinked);
            if (e.target.classList.contains('bounding-box')) this.startBBDrag(e, field, isLinked)
        },

        startBBDrag(e, field, isLinked) {
            console.log(isLinked)
            e = e || window.event;
            e.preventDefault();

            const startBBDrag = (e) => {
                e.stopPropagation();
                if (this.mouseOnImage) {
                    if (this.needForRaf) this.needForRaf = null;
                    this.needForRaf = requestAnimationFrame(() => {
                        // const image = document.querySelector('.image-wrapper-image')
                        // const imageContainer = document.querySelector('.editor-image-container');
                        let newX = prevX - e.clientX;
                        let newY = prevY - e.clientY;
                        BB.style.top = bbTop - newY + "px";
                        BB.style.left = bbLeft - newX + "px";
                        if (newX > 0 || newY > 0) this.hasBBChanged = true;
                    })
                }
            }
            const dragBBEnd = () => {
                window.removeEventListener('mousemove', startBBDrag);
                window.removeEventListener('mouseup', dragBBEnd);


                if (this.hasBBChanged) {
                    if (isLinked) {
                        this.selectedPageConfig.fields[field]['question'].y = this.toFixedDecimal(((parseInt(BB.style.top) - this.relativeTop) / (this.imageToBeTaggedBoundingCLient.height / 100)) * (this.selectedPageConfig.height / 100), 0);
                        this.selectedPageConfig.fields[field]['question'].x = this.toFixedDecimal(((parseInt(BB.style.left) - this.relativeLeft) / (this.imageToBeTaggedBoundingCLient.width / 100)) * (this.selectedPageConfig.width / 100), 0);
                    } else {
                        this.selectedPageConfig.fields[field].y = this.toFixedDecimal(((parseInt(BB.style.top) - this.relativeTop) / (this.imageToBeTaggedBoundingCLient.height / 100)) * (this.selectedPageConfig.height / 100), 0);
                        this.selectedPageConfig.fields[field].x = this.toFixedDecimal(((parseInt(BB.style.left) - this.relativeLeft) / (this.imageToBeTaggedBoundingCLient.width / 100)) * (this.selectedPageConfig.width / 100), 0);
                    }


                    if ('question' in this.selectedPageConfig.fields[field]) {
                        this.updateStyleAttriutesOfBBForGivenLinkedField(field)
                    }
                    this.updateStyleAttriutesOfBBForGivenField(field);
                    this.$nextTick(() => {
                        this.updateConfig()
                    })
                    this.hasBBChanged = false;
                }
            }

            let sanatizedFieldName = this.getSanitizedFieldName(field);
            let BB;
            if (isLinked) {
                BB = document.querySelector(`.${sanatizedFieldName}isLinked`);
            }
            else {

                BB = document.querySelector(`.${sanatizedFieldName}`);
            }

            window.addEventListener('mousemove', startBBDrag);
            window.addEventListener('mouseup', dragBBEnd);

            const imageContainer = document.querySelector('.editor-image-container');
            let bbTop = (BB.getBoundingClientRect().y - this.imageContainerBoundingCLient.y) + imageContainer.scrollTop;
            let bbLeft = BB.getBoundingClientRect().x - this.imageContainerBoundingCLient.x + + imageContainer.scrollLeft;

            let prevX = e.clientX;
            let prevY = e.clientY;
        },
        startNewBBDraw(e) {
            e.preventDefault();
            this.selectedField = '';
            let newBBDraw = (e) => {
                if (this.mouseOnImage) {
                    e.stopPropagation();
                    let newY = (e.clientY - prevY);
                    let newX = e.clientX - prevX;
                    newBB.style.height = newY + "px";
                    newBB.style.width = newX + "px";
                    if (newX > 0 || newY > 0) this.hasBBChanged = true;
                }
            }
            let endNewBBDraw = () => {
                window.removeEventListener('mousemove', newBBDraw);
                window.removeEventListener('mouseup', endNewBBDraw);
                if (this.hasBBChanged) {
                    const newField = "new_field_" + uuidv4();
                    const newBornBBCoords = {
                        y: this.toFixedDecimal(((parseInt(newBB.style.top) - this.relativeTop) / (this.imageToBeTaggedBoundingCLient.height / 100)) * (this.selectedPageConfig.height / 100), 0),
                        x: this.toFixedDecimal(((parseInt(newBB.style.left) - this.relativeLeft) / (this.imageToBeTaggedBoundingCLient.width / 100)) * (this.selectedPageConfig.width / 100), 0),
                        h: this.toFixedDecimal((parseInt(newBB.style.height) / (this.imageToBeTaggedBoundingCLient.height / 100)) * (this.selectedPageConfig.height / 100), 0),
                        w: this.toFixedDecimal((parseInt(newBB.style.width) / (this.imageToBeTaggedBoundingCLient.width / 100)) * (this.selectedPageConfig.width / 100), 0),
                    }

                    if (this.isNewFieldBeingLinked && this.selectedPageConfig.fields) {
                        this.$set(this.selectedPageConfig.fields[this.newFieldBeingLinked], 'question', newBornBBCoords)
                        this.linkedFields.push(this.newFieldBeingLinked);
                        this.isNewFieldBeingLinked = false;
                    } else if (this.selectedPageConfig.fields) {
                        this.$set(this.selectedPageConfig.fields, newField, newBornBBCoords)
                    } else {
                        this.selectedPageConfig['fields'] = {}
                        this.selectedPageConfig['fields'][newField] = newBornBBCoords
                        this.setSelectedField(newField)
                    }
                    this.$nextTick(() => {
                        this.setPageConstants();
                        this.updateConfig();
                    })
                    newBB.style.top = "-100vh";
                    newBB.style.left = "-100vW";
                    newBB.style.height = "0px";
                    newBB.style.width = "0px"
                    this.hasBBChanged = false;
                }
            }
            let newBB = document.querySelector('.newbb');
            newBB.style.top = (e.offsetY + this.relativeTop) + "px";
            newBB.style.left = (e.offsetX + this.relativeLeft) + "px";
            let prevY = e.clientY;
            let prevX = e.clientX;

            window.addEventListener('mousemove', newBBDraw);
            window.addEventListener('mouseup', endNewBBDraw);
        },
        handleNewLinkedBBDraw(field) {
            let selectedFieldOption = document.querySelector('.' + this.getSanitizedFieldName(field) + 'menu')
            selectedFieldOption.classList.add('is-being-linked')
            this.newFieldBeingLinked = field;
            this.isNewFieldBeingLinked = true;
        },
        handleFieldEdit(field) {
            this.fieldBeingEdited = field
        },
        handleFieldEditKeyUp(e, field) {
            e.stopPropagation();
            if (e.key == "Escape" || e.code == "Escape") {
                this.fieldBeingEdited = null;
            } else if (e.key == "Enter" || e.code == "Enter") {
                if (field != e.target.value) {
                    const fieldInSelectedPage = Object.keys(
                        this.selectedPageConfig.fields
                    );
                    const sanitizedFieldsInSelectedPage = fieldInSelectedPage.map((e) =>
                        this.getSanitizedFieldName(e)
                    );
                    if (sanitizedFieldsInSelectedPage.includes(this.getSanitizedFieldName(e.target.value))) {
                        alert(`The Field name ${e.target.value} already exists. Please make sure field names are unique`)
                        return;
                    }

                    const oldEle = this.selectedPageConfig.fields[field];
                    delete this.selectedPageConfig.fields[field];
                    this.selectedPageConfig.fields[e.target.value] = oldEle;
                }
                this.fieldBeingEdited = null;
                this.updateConfig();
                this.$nextTick(() => {
                    this.renderBoundingBoxes();
                    this.setSelectedField(e.target.valu);
                });
            }
        },
        handleDimensionCoordsClick(coord) {
            this.fieldBeingEdited = null;
            this.isLinkedFieldDimensionsBeingEdited = false;
            this.dimensionBeingEdited = coord;
        },
        handleLinkedFieldDimensionCoordsClick(coord) {
            this.fieldBeingEdited = null;
            this.isLinkedFieldDimensionsBeingEdited = true

            this.dimensionBeingEdited = coord;
        },
        handleDimensionCoordEditKeyUp(e) {
            if (e.key == "Escape" || e.code == "Escape") {
                this.dimensionBeingEdited = null;
            } else if (e.key == "Enter" || e.code == "Enter") {
                this.dimensionBeingEdited = null;

            }
        },
        doesFieldHaveLink(field) {
            return Object.prototype.hasOwnProperty.call(this.selectedPageConfig.fields[field], "question");
        },
        handleDimensionCoordEditInput(e, coord) {
            if (this.needForRAF) cancelAnimationFrame(this.needForRAF);
            let val = e
            console.log(this.isLinkedFieldDimensionsBeingEdited)
            this.needForRAF = requestAnimationFrame(() => {
                if (this.isLinkedFieldDimensionsBeingEdited) {
                    console.log(this.selectedPageConfig.fields[this.selectedField].question[coord])
                    this.selectedPageConfig.fields[this.selectedField].question[coord] = val;
                } else {
                    console.log(val)
                    this.selectedPageConfig.fields[this.selectedField][coord] = val;

                }

                this.$nextTick(() => {
                    this.renderBoundingBoxes();
                    this.updateConfig();
                })
            })
        },
        handleMouseLeave() {
            this.mouseOnImage = false;
            console.log(this.mouseOnImage);
        },
        handleMouseOver() {
            this.mouseOnImage = true;
            console.log(this.mouseOnImage);
        },

    }
}   
</script>


<style lang="scss" scoped>
.active {
    background-color: rgba($color: red, $alpha: 0.25);
}

.question-active {
    background-color: rgba($color: pink, $alpha: 0.25);
}

.is-being-linked {
    background-color: rgba($color: green, $alpha: 0.65);
}

.hidden {
    opacity: 0;
}

.options {
    padding: 10% 0;
    height: 30%;
    width: 10vw;

    .v-btn {
        width: 100%;
        padding: 5% 15%;
        height: 100%;
        text-transform: unset !important;
    }
}

.editor {
    display: flex;
    height: 100vh;
    width: 100vw;
    overflow-y: hidden;

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
        overflow-y: overlay;
        overflow-x: overlay;
        position: relative;
        scroll-behavior: smooth;


        .bounding-box {
            border: 2px solid red;
            position: absolute;
            cursor: move;

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

        .image-wrapper {
            width: 100%;
            margin: 0 auto;

            img {
                -webkit-user-select: none;
                -khtml-user-select: none;
                -moz-user-select: none;
                -o-user-select: none;
                user-select: none;

            }
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
        padding: 10%;
        overflow-y: auto;
        overflow-x: hidden;
        border-top: 2px solid black;
    }

    .field-list {
        display: flex;
        overflow-y: auto;
        overflow-x: hidden;
        justify-content: space-between;
        padding: 2%;
        border: solid 1px black;
        cursor: pointer;

        &:active {
            background-color: rgba($color: red, $alpha: 0.25);
        }
    }

    .newbb {
        position: absolute;
        background-color: bisque;
        background-color: rgba($color: red, $alpha: 0.25);
    }
}
</style>