<template>
    <q-dialog
        v-if="modelValue"
        :model-value="modelValue"
        @update:model-value="$emit('input', $event)"
        persistent
        maximized
        transition-show="jump-down"
        transition-hide="jump-down">
        <q-card  :style="{ width: '100%', height:'calc(80vh)'}">
            <q-bar>
                <div>Datenschutzrichtlinien</div>
                <q-space />
                <q-btn dense flat icon="close" @click="close">
                    <q-tooltip>Schliessen</q-tooltip>
                </q-btn>
            </q-bar>

            <q-card-section class="q-pa-none">
                <iframe v-show="true" id="iframe" src="http://wiki.dispolive.de/doku.php?id=4DatenschutzerklaerungApp" style="width:100%; height:calc(100vh - 50px)" ></iframe>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>
import debug                                                    from 'debug';
const log                                                       = debug('app:datenschutz');

const props = defineProps({
    modelValue: {
        type: Boolean
    }
});

const emit = defineEmits(['update:modelValue']);

function close () {
    log('close');
    emit('update:modelValue', false);
}
</script>
