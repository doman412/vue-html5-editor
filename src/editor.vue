<style lang="less" src="./style.less"></style>
<template>
    <div class="vue-html5-editor" :style="{'z-index':zIndex}" :class="{'full-screen':fullScreen}">
        <div class="toolbar" :style="{'z-index':zIndex+1}" ref="toolbar">
            <ul>
                <template v-for="module in modules">
                    <li v-if="module.show" :title="locale[module.i18n]" @click="activeModule(module)" :class="{'disabled': htmlView && module.name != 'html'}">
                        <span class="icon" :class="module.icon"></span>
                    </li>
                </template>
            </ul>
            <div class="dashboard" v-show="dashboard" :style="dashboardStyle">
                <keep-alive>
                  <div v-if="dashboard" :is="dashboard"></div>
                </keep-alive>
            </div>
        </div>
        <div class="content" v-show="!htmlView" ref="content" contenteditable="true" @click="toggleDashboard(dashboard)" :style="contentStyle">
        </div>
        <div class="content html-view" v-show="htmlView" ref="htmlView" @click="toggleDashboard(dashboard)" :style="contentStyle">
            <textarea name="name" :style="contentStyle" v-model="content"></textarea>
        </div>
    </div>
</template>
<script>
    export default {
        props: {
            content: {
                //no longer be required
                type: String,
                required: true,
                default: ""
            },
            height: {
                type: Number,
                default: 300,
                validator (val) {
                    return val >= 100
                }
            },
            zIndex: {
                type: Number,
                default: 1000
            },
            autoHeight: {
                type: Boolean,
                default: true
            }
        },
        data () {
            return {
                //locale: {},
                fullScreen: false,
                dashboard: null,
                dashboardStyle: {},
                htmlView: false,
            }
        },
        watch: {
            content(val) {
                let content = this.$refs.content.innerHTML
                if (val != content) {
                    this.$refs.content.innerHTML = val
                }
            },
            dashboard(val){
                if (val) {
                    this.computeDashboardStyle()
                }
            },
            fullScreen(val){
                let component = this
                component.$nextTick(function () {
                    component.computeDashboardStyle()
                })
                if (val) {
                    component.parentEl = component.$el.parentNode
                    component.nextEl = component.$el.nextSibling
                    component.$appendTo(document.body)
                    return
                }
                if (component.nextEl) {
                    component.$before(component.nextEl)
                    return
                }
                component.$appendTo(component.parentEl)
            }
        }
        ,
        computed: {
            contentStyle(){
                let style = {}
                if (this.fullScreen) {
                    style.height = window.innerHeight - (this.$refs.toolbar.clientHeight + 1) + "px"
                    return style
                }
                if (!this.autoHeight) {
                    style.height = this.height + 'px'
                    return style
                }
                style["min-height"] = this.height + 'px'
                return style
            }
        },
        methods: {
            computeDashboardStyle(){
                this.dashboardStyle = {'max-height': this.$refs.content.clientHeight + 'px'}
            },
            getContentElement(){
                return this.$refs.content
            },
            toggleFullScreen(){
                this.fullScreen = !this.fullScreen
            },
            toggleDashboard(dashboard){
                this.dashboard == dashboard ? this.dashboard = null : this.dashboard = dashboard
            },
            execCommand(command, arg){
                this.restoreSelection()
                document.execCommand(command, false, arg)
                this.$emit('update:content', this.$refs.content.innerHTML)
                this.dashboard = null
            },
            getCurrentRange(){
                return this.range
            },
            saveCurrentRange(){
                let selection = window.getSelection ? window.getSelection() : document.getSelection()
                let range = selection.rangeCount ? selection.getRangeAt(0) : null
                if (!range) {
                    return
                }
                if (this.$refs.content.contains(range.startContainer) &&
                        this.$refs.content.contains(range.endContainer)) {
                    this.range = range
                }
            },
            restoreSelection(){
                let selection = window.getSelection ? window.getSelection() : document.getSelection()
                selection.removeAllRanges()
                if (this.range) {
                    selection.addRange(this.range)
                } else {
                    let content = this.$refs.content
                    let div = document.createElement("div")
                    let range = document.createRange()
                    content.appendChild(div)
                    range.setStart(div, 0)
                    range.setEnd(div, 0)
                    selection.addRange(range)
                }
            },
            activeModule(module){
                if(this.htmlView && module.name !== 'html'){
                    // disable module actions when html view is active
                    return;
                }
                if (typeof module.handler == "function") {
                    module.handler(this)
                    return
                }
                if (module.hasDashboard) {
                    this.toggleDashboard('dashboard-' + module.name)
                }
            },
            toggleHtmlView(){
                this.htmlView = !this.htmlView;
            }
        },
        mounted(){
            let editor = this
            editor.modules.forEach(function (module) {
                if (typeof module.init == "function") {
                    module.init(editor)
                }
            })
            this.$nextTick(()=>{
              let component = this
              let content = component.$refs.content
              content.innerHTML = component.content
              content.addEventListener("mouseup", component.saveCurrentRange, false)
              content.addEventListener("keyup", component.saveCurrentRange, false)
              content.addEventListener("mouseout", component.saveCurrentRange, false)
              content.addEventListener("keyup", function () {
                  component.$emit('update:content', component.$refs.content.innerHTML)
              }, false)
              content.addEventListener("paste", function () {
                  setTimeout(()=>{
                    component.saveCurrentRange();
                    component.$emit('update:content', component.$refs.content.innerHTML)
                  });
              }, false)

              component.touchHandler = function (e) {
                  if (component.$refs.content.contains(e.target)) {
                      component.saveCurrentRange()
                  }
              }

              window.addEventListener("touchend", component.touchHandler, false)
            })
        },
        beforeDestroy(){
            let editor = this
            window.removeEventListener("touchend", editor.touchHandler)
            editor.modules.forEach(function (module) {
                if (typeof module.destroyed == "function") {
                    module.destroyed(editor)
                }
            })
        }
    }
</script>
