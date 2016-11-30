<template>
    <button v-if="config.bold !== false" type="button" @click="$parent.execCommand('bold')">{{$parent.locale["bold"]}}</button>
    <button v-if="config.italic !== false" type="button" @click="$parent.execCommand('italic')">{{$parent.locale["italic"]}}</button>
    <button v-if="config.underline !== false" type="button" @click="$parent.execCommand('underline')">{{$parent.locale["underline"]}}</button>
    <button v-if="config.strikeThrough !== false" type="button" @click="$parent.execCommand('strikeThrough')">{{$parent.locale["strike through"]}}</button>
    <button v-if="config.subscript !== false" type="button" @click="$parent.execCommand('subscript')">{{$parent.locale["subscript"]}}</button>
    <button v-if="config.superscript !== false" type="button" @click="$parent.execCommand('superscript')">{{$parent.locale["superscript"]}}</button>
</template>
