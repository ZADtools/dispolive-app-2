<template>
    <div class="regulation q-px-sm text-black">
        <div class="row q-py-md q-px-sm">
            <div class="col-12 text-h6 header">Verordnung einer</div>
            <div class="col12 text-h6 header">Krankenbeförderung</div>

        </div>
        <div class="row whiteBg q-px-sm redLine text-black">
            <div class="col-4 col-md-3 ">
                <div class="row redLabel">Gebühr {{getEigenanteil() == 'Kassiert' ? global.showEaSum(actItem) : ''}}</div>
                <div class="row text-body1">{{getEigenanteil()}}</div>
            </div>
            <div class="col-8 col-md-3">
                <div class="row redLabel">Transportschein vorhanden</div>
                <div class="row text-body1">{{actItem.transVorhanden}}</div>
            </div>
            <div class="col-12 col-md-6">
                <div class="row redLabel">Krankenkasse bzw. Kostenträger</div>
                <div class="row text-body1">{{actItem.krankenkasse}} {{actItem.ikNr}}</div>
            </div>
        </div>
        <div class="row whiteBg q-px-sm redLine text-black">
            <div class="col-12">
                <div class="row redLabel">Name, Vorname des Versicherten</div>
                <div class="row text-body1">{{actItem.patSurname}} {{actItem.patName}}</div>
            </div>
            <div class="col-8">
                <div class="row redLabel emptyLabel"></div>
                <div class="row text-body1">{{actItem.patStreet}}</div>
                <div class="row text-body1">{{actItem.patZip}} {{actItem.patCity}}</div>
            </div>
            <div class="col-4">
                <div class="row redLabel">geb. am</div>
                <div class="row text-body1">{{actItem.birthday}}</div>
            </div>
        </div>
        <div class="row whiteBg q-px-sm redLine text-black">
            <div class="col-5">
                <div class="row redLabel no-wrap">Kostenträgerkennung</div>
                <div class="row text-body1">{{actItem.versNr}}</div>
            </div>
            <div class="col-5">
                <div class="row redLabel no-wrap">Versicherten-Nr.</div>
                <div class="row text-body1">{{actItem.stammVersNr}}</div>
            </div>
            <div class="col-2">
                <div class="row redLabel">Status</div>
                <div class="row text-body1">{{actItem.versStatus}}</div>
            </div>
        </div>
        <div class="row whiteBg q-px-sm text-black">
            <div class="col-4">
                <div class="row redLabel text-no-wrap">Betriebsstätten-Nr.</div>
                <div class="row text-body1">{{actItem.betriebsstaettenNummer}}</div>
            </div>
            <div class="col-4">
                <div class="row redLabel q-mx-md">Arzt-Nr.</div>
                <div class="row text-body1 q-mx-md">{{actItem.arztNummer}}</div>
            </div>
            <div class="col-4">
                <div class="row redLabel">Datum</div>
                <div class="row text-body1">{{actItem.verordnungAusstellungsDatum}}</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import Global                                               from '../helpers/Global'
import debug                                                from 'debug';

const log                                                   = debug('app:regulation');

const props = defineProps({
    actItem: {
        type: Object,
        default: () => {
            return {}
        }
    }
})

const global    = Global()

function getEigenanteil () {
    switch (props.actItem.eigenanteil) {
        case '20':
            return 'Befreit'
        case '10': 
            return 'Kassiert'
        case '30':
        case '40':
        case '00':
            return 'Rechnung'
        default:
            return ''
    }
}
</script>
<style scope lang="scss">

    .header {
        color: $negative
    }

    .redLabel {
        color: $negative
    }

    .regulation {
        background-color: #D3EDFA;
        padding-bottom: 10px;
    }

    .whiteBg {
        background-color: #fff;
        padding-top: 5px;
        padding-bottom: 5px;
    }

    .emptyLabel {
        min-height: 21px;
    }

</style>
