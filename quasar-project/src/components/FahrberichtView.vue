<template>
    <div :class="setClass()" v-if="actItem">
        <div :class="[actItem.type !== 'Linie' ? 'q-px-sm' : '', Dark.isActive ? 'bg-grey-10' : 'bg-grey-3']">
            <div class="row q-pa-sm" style="min-height: 70px">
                <div class="col-8 col-md-8" v-if="actItem.type !== 'Linie'">
                    <div class="row text-primary white" >Patient</div>
                    <div class="row text-h6" v-if="!actItem.materialfahrt && ( actItem.patName || actItem.patSurname )">{{actItem.patSurname}}, {{actItem.patName}}</div>
                    <div class="row text-h6" v-if="!actItem.patName && !actItem.patSurname && !actItem.materialfahrt">Keine Patientenangaben vorhanden</div>
                    <div class="row text-h6" v-if="actItem.materialfahrt">Materialfahrt</div>
                </div>
                <div class="col-8 col-md-8" v-if="actItem.type === 'Linie'" :class="[Dark.isActive ? '' : 'text-primary']">
                    <div class="row" >Linie</div>
                    <div class="row text-h6">{{actItem.titel}}</div>
                </div>
                <div class="col-4 col-md-4 text-right">
                    <div class="row text-primary emptyLabel"></div>
                    <div class="text-h6 text-right text-negative"><q-icon name="fas fa-circle" v-if="actItem.color && actItem.type !== 'Linie'" :style="{ color: actItem.color }" style="margin-right: 10px" /> {{actItem.einsatzNummer}}</div>
                </div>
            </div>
            <div class="row q-pb-sm q-px-sm" style="min-height: 55px" v-if="actItem.type !== 'Linie'">
                <div class="col-4 ">
                    <div class="row text-primary white">Kostenübername</div>
                    <div class="row text-body1">{{setCostStatus()}}</div>
                </div>
                <div class="col-8 ">
                    <div class="row text-primary white">Sonderleistungen</div>
                    <div class="row text-body1">{{setSonderleistungen()}}</div>
                </div>
            </div>
            <div class="row q-pa-sm q-mb-sm" :class="darkMode ? 'bg-blue-5' : 'bg-blue-2'" style="min-height: 55px" v-if="actItem.type !== 'Linie'">
                <div class="col-4 q-pr-xs">
                    <div class="row text-primary white"><div class="col ellipsis"><i style="padding-top: 3px" class="fas fa-car q-pr-sm"></i>Verordnungsart</div></div>
                    <div class="row text-body1 ellipsis">{{actItem.verordnungsName || na}}</div>
                </div>
                <div class="col-4 q-pr-xs">
                    <div class="row text-primary white"><div class="col ellipsis"><i style="padding-top: 3px" class="fas fa-clipboard q-pr-sm"></i>Kategorie</div></div>
                    <div class="row text-body1 ellipsis">{{actItem.serienKategorName || na}}</div>
                </div>
                <div class="col-4 ">
                    <div class="row text-primary white"><div class="col ellipsis"><i style="padding-top: 3px" class="fas fa-heartbeat q-pr-sm"></i>Transportart</div></div>
                    <div class="row text-body1 ellipsis">{{actItem.transportName || na}}</div>
                </div>
            </div>
            <div class="col-6 q-pb-sm" style="min-height: 45px" v-if="actItem.type !== 'Linie'">
                <q-btn unelevated icon="fas fa-bacterium" @click="(actItem.infektion && actItem.itName) || showStatusButtons ? setShowInfection(true) : ''" align="left" class="full-width text-body1" padding="6px" :color="actItem.infektion ? 'orange' : 'grey'"  >
                    <div class="ellipsis q-pl-sm">
                            {{ setInfText() }}
                    </div>
                </q-btn>
            </div>
            <div class="bg-grey-3" :class="!showStatusButtons ? 'q-mb-sm' : ''" style="min-height: 135px" v-if="actItem.type !== 'Linie'">
                <div class="row q-pb-sm q-pa-sm">
                    <div class="col-6 ">
                        <div class="row text-primary"><i style="padding-top: 3px" class="fas fa-phone q-pr-sm"></i>Auftraggeber</div> 
                    </div>
                    <div class="col-6 ">
                        <div class="row text-body1">
                            <q-btn unelevated :type="actItem.auftraggeberTelefon ? 'a' : 'button'" no-caps :disable="!actItem.auftraggeberTelefon" :href="`tel: ${actItem.auftraggeberTelefon}`" dense class=" col-12 bg-grey-5 text-black text-body1" padding="6px" >
                                <div class="ellipsis">
                                    {{actItem.auftraggeberTelefon || na}}
                                </div>
                            </q-btn>
                        </div>
                    </div>
                </div>
                <div class="row q-pb-sm q-pa-sm" v-if="actItem.type !== 'Linie'">
                    <div class="col-6 ">
                        <div class="row text-primary"><i style="padding-top: 3px" class="fas fa-phone q-pr-sm"></i>Patient</div>
                    </div>
                    <div class="col-6 ">
                        <div class="row text-body1">
                            <q-btn unelevated :type="actItem.patientenTelefon ? 'a' : 'button'" no-caps :disable="!actItem.patientenTelefon" :href="`tel: ${actItem.patientenTelefon}`" dense class=" col-12 bg-grey-5 text-black q-mb-sm text-body1" padding="6px" >
                                <div class="ellipsis">
                                    {{actItem.patientenTelefon || na}}
                                </div>
                            </q-btn>
                            <q-btn unelevated :type="actItem.patientenHandy ? 'a' : 'button'" no-caps :disable="!actItem.patientenHandy" :href="`tel: ${actItem.patientenHandy}`" dense class=" col-12 bg-grey-5 text-black text-body1" padding="6px"  >
                                <div class="ellipsis">
                                    {{actItem.patientenHandy || na}}
                                </div>
                            </q-btn>
                        </div>
                    </div>
                </div>
            </div>
            <FahrberichtStatusView v-if="showStatusButtons &&  actItem.type !== 'Linie'" @insertDataDialog="$emit('insertDataDialog', $event)" />
            <div class="row" :class=" darkMode ? 'bg-blue-5 ' : 'bg-blue-2'"  v-if="actItem.type !== 'Linie'">
                <div class="col-12 col-sm-6">
                    <div class="row q-pa-sm ">
                        <div class="col-12">
                            <div class="row text-primary text-body1"><i style="padding-top: 3px" class="fas fa-house-user q-pr-sm"></i> Start {{actItem.startTime}}</div> 
                        </div>
                    </div>
                    <div class="row q-pb-sm q-px-sm">
                        <div class="col-12 ">
                            <div class="row text-black text-body1">{{actItem.startInstitution || na}}</div> 
                        </div>
                    </div>
                    <div class="row q-pb-sm q-px-sm">
                        <div class="col-12 ">
                            <div class="row text-italic text-body1" :class="darkMode ? 'text-blue-10' : 'text-negative'">{{actItem.startInfo}}</div> 
                        </div>
                    </div>
                    <div class="row q-px-sm">
                        <div class="col-12 ">
                            <div class="row text-black text-body1">{{actItem.startStreet || na}}</div> 
                        </div>
                    </div>
                    <div class="row q-pb-sm q-px-sm">
                        <div class="col-12 ">
                            <div class="row text-black text-body1">{{actItem.startZip || na }} {{actItem.startCity || na}}</div> 
                        </div>
                    </div>
                </div>
                <div class="col-12 col-sm-6"  v-if="actItem.type !== 'Linie'">
                    <div class="row q-pa-sm">
                        <div class="col-12 ">
                            <div class="row text-body1 text-primary text-body1"><i style="padding-top: 3px" class="fas fa-flag q-pr-sm"></i> Ziel {{actItem.endTime}}</div> 
                        </div>
                    </div>
                    <div class="row q-pb-sm q-px-sm">
                        <div class="col-12 ">
                            <div class="row text-black text-body1">{{actItem.targetInstitution || na}}</div> 
                        </div>
                    </div>
                    <div class="row q-pb-sm q-px-sm">
                        <div class="col-12 ">
                            <div class="row text-italic text-body1" :class="darkMode ? 'text-blue-10' : 'text-negative'">{{actItem.targetInfo}}</div> 
                        </div>
                    </div>
                    <div class="row q-px-sm">
                        <div class="col-12 ">
                            <div class="row text-black text-body1">{{actItem.targetStreet || na}}</div> 
                        </div>
                    </div>
                    <div class="row q-pb-sm q-px-sm">
                        <div class="col-12 ">
                            <div class="row text-black text-body1">{{actItem.targetZip || na}} {{actItem.targetCity || na}}</div> 
                        </div>
                    </div>
                </div>
            </div>
            <div class="row" v-if="actItem.type !== 'Linie'">
                <div class="col-12">
                    <q-btn 
                        unelevated
                        padding="6px"
                        align="center" 
                        v-if="settings.changeStartTarget === 1 && ( actItem.type === 'Spontan' || actItem.type === 'Konsil' )"  
                        @click="SetShowChangeStartOrTarget()" 
                        class="full-width q-my-sm text-white text-body1" 
                        color="amber-7" 
                        label="Start/Ziel ändern" 
                    />
                </div>
            </div>
            <div class="row" v-if="actItem.type !== 'Linie'">
                <div class="col">
                    <q-btn 
                        unelevated
                        padding="6px"
                        v-if="showStatusButtons"
                        align="center"
                        @click="setShowTimestamps()" 
                        class="full-width q-my-sm text-white text-body1" 
                        color="amber-7" 
                        label="Zeitstempel anzeigen" 
                    />
                </div>
            </div>
            <div class="row q-pa-sm bg-grey-3 q-mb-sm"  v-if="actItem.type !== 'Linie'">
                <div class="col-12 q-pb-sm">
                    <div class="row text-primary">Info Patient</div>
                    <div class="row text-body1" :class="'text-black'">{{actItem.patientenInfo}}</div>
                </div>
                <div class="col-12 ">
                    <div class="row text-primary">Interne Bemerkung</div>
                    <div class="row text-body1" :class="'text-black'">{{actItem.note}}</div>
                </div>
            </div>
            <MusterVier :actItem="actItem || {}"  v-if="actItem?.type !== 'Linie'" />
            <div class="col-12 q-pb-md" v-if="actItem.type === 'Spontan'">
                <q-btn 
                    padding="6px"
                    size="md"
                    unelevated
                    dense
                    align="center"
                    @click="printEinsatzprotokoll()"
                    class="full-width q-my-sm text-white text-body1 ellipsis" 
                    color="amber-7" 
                    icon="print" 
                    label="Einsatzprotokoll drucken"
                />
            </div>
            <div class="row bg-blue-3 q-px-sm" v-if="actItem.type === 'Linie' && actItem.note">
                <div class="col-12 ">
                    <div class="row text-black">Interne Bemerkung</div>
                    <div class="row text-body1 text-black">{{actItem.note}}</div>
                </div>
            </div>
            <template  v-for="(stopgroup, index) of groupByData">
                <div style="display: contents" v-if="actItem.type === 'Linie'" :key="index"> 
                    <div class="row" v-if="stopgroup[0] !== 'Ausrückzeit'">
                        <div class="col-12 text-white text-body1 q-pa-sm" :class="[Dark.isActive ? 'bg-grey-10' : 'bg-primary']">
                            {{ stopgroup[0] }}
                        </div>
                        <div class="col-12 q-pa-sm" v-if="showStatusButtons">
                            <q-btn unelevated align="center" class="full-width text-body1" padding="6px" @click="startNavigation(stopgroup[1][0])" color="amber-7" label="Navigation Starten" />
                        </div>
                    </div>

                    <div class="row q-pb-md linie" v-for="stop of stopgroup[1]" :key="stop._id">
                        <div v-if="!stop.ziel && !stop.targetPoint" class="col-12 text-body1 q-pt-sm q-px-sm" :class="[Dark.isActive ? 'bg-grey-10' : 'bg-grey-3']"></div>
                        <div class="col-12" :class="[Dark.isActive ? 'bg-grey-9' : 'bg-grey-3']">
                            <div class="row text-body1 q-pt-sm" v-if="stopgroup[1] !== 'Ausrückzeit'">
                                <div class="col-12" v-if="stop.folge !== '99'">
                                    <div class="row" v-if="!stop.ziel">
                                        <div class="col-12 q-px-sm">
                                            {{stop.time}}
                                        </div>
                                        <div class="col-2 col-sm-1 q-px-sm" v-if="stop.folge !== '99'">
                                            <q-icon size="xs" :color="stop.exit ? 'negative' : 'teal-5'" :name=" stop.exit ? 'fas fa-arrow-right' : 'fas fa-arrow-left'"/>
                                        </div>
                                        <div class="col-8 col-sm-5">
                                            <div class="row">
                                                <div v-if="stop.institution" class="col-12 ellipsis">
                                                    {{stop.institution}}
                                                </div>
                                                <div class="col-12" v-if="stop.surname && stop.name">
                                                    {{stop.surname}}, {{stop.name}}
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-2 col-sm-5 ellipsis text-negative" v-if="stop.check === false && !stop.ziel">
                                            Abgemeldet
                                        </div>
                                        <div v-if="stop.check !== false" class="col-2 col-sm-1 ellipsis" :class=" (stop.einstieg === true && stop.timestamp) || (stop.exit && stop.timestamp) ? 'text-teal-5' : 'text-negative' ">
                                            {{stop.timestamp || na}} 
                                        </div>
                                        <div class="col-12 col-sm-5 right" v-if="stop.check !== false && stop.direction == 'Hinfahrt' && showStatusButtons">
                                            <div class="row" :class="{ 'q-mt-md': Screen.lt.sm }" >
                                                <div class="col-12 ellipsis q-mb-xs q-gutter-sm text-right" >
                                                    <q-btn unelevated class="text-body1" padding="6px"  color="negative" @click="setStatus('keinEinstieg', stop)" label="Kein Einstieg" v-if="!stop.exit"/>
                                                    <q-btn unelevated class="text-body1" padding="6px" color="teal-5"  @click="setStatus(stop.exit ? 'Ausstieg' : 'Einstieg', stop)" :label="stop.exit ? 'Ausstieg' : 'Einstieg'" />
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-12 col-sm-5 right" v-if="stop.check !== false && stop.direction == 'Rückfahrt' && showStatusButtons" >
                                            <div class="row" :class="{ 'q-mt-md': Screen.lt.sm }">
                                                <div class="col-12 ellipsis q-mb-xs q-gutter-sm text-right" >
                                                    
                                                    <q-btn unelevated class="text-body1" padding="6px" color="negative" @click="setStatus('keinEinstieg', stop)" v-if="!stop.exit" label="Kein Einstieg" />
                                                    <q-btn unelevated class="text-body1" padding="6px" color="teal-5" @click="setStatus(stop.exit ? 'Ausstieg' : 'Einstieg', stop)" :label="stop.exit ? 'Ausstieg' : 'Einstieg'" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="row text-body1 q-pa-sm text-white  bg-primary" v-if=" stop.ziel && stopgroup[0] == 'Ausrückzeit' ">
                                <div class="col">
                                    Ausrückzeit: {{stop.time}}
                                </div>
                            </div>
                            <div class="row text-body1 text-white q-pa-sm  bg-primary" v-if=" stop.ziel && stopgroup[0] !== 'Ausrückzeit' && stop.folge !== '98' ">
                                <div class="col-12">
                                    Ziel: {{stop.time}}
                                </div>
                            </div>

                            <div class="row text-body1 text-white q-pa-sm  bg-primary" v-if=" stop.direction == 'Rückfahrt' &&  stop.folge == '98' && stop.ziel ">
                                <div class="col-12">
                                    Abholzeit: {{stop.time}}
                                </div>
                            </div>

                            <div class="row text-body1 q-pa-sm" v-if=" stopgroup[0] == 'Ausrückzeit' && showStatusButtons">
                                <div class="col-12">
                                    <q-btn unelevated class="full-width text-body1" padding="6px" @click="setStatus('startBegin')" color="primary" :label="actItem.startBegin ? `Anfahrt (${actItem.startBegin})` : 'Anfahrt'" />
                                </div>
                            </div>

                            <div class="row text-body1 q-pa-sm" v-if="stop.info">
                                <div class="col-12 text-negative infotext">
                                    {{stop.info}}
                                </div>
                            </div>
                            <div class="row text-body1 q-pa-sm" v-if="stop.ziel && stopgroup[0] !== 'Ausrückzeit' && stop.direction !== 'Rückfahrt' && showStatusButtons">
                                <div class="col-12">
                                    <q-btn unelevated class="full-width text-body1" padding="6px" color="primary" :label="actItem.zielBegin ? `Ankunft Zielort (${actItem.zielBegin})` : 'Ankunft Zielort'" @click="setStatus('zielBegin')" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
            <div class="row">
                <div class="col-6 q-pr-xs" v-if="actItem.type == 'Linie' && showStatusButtons" :class="{ 'q-pr-xs': $q.screen.gt.sm, 'q-pb-sm': $q.screen.lt.md }">
                    <q-btn unelevated align="center" class="full-width text-body1" padding="6px" @click="showTripAbort = true" color="negative" label="Fahrt Abbrechen" />
                </div>
                <div class="col-6 q-pl-xs" v-if="actItem.type == 'Linie' && showStatusButtons" :class="{ 'q-pr-xs': $q.screen.gt.sm, 'q-pb-sm': $q.screen.lt.md }">
                    <q-btn unelevated align="center" class="full-width text-body1" padding="6px" @click="setStatus('frei')" color="primary" label="Frei" />
                </div>
            </div>
            
            <q-dialog
                v-model="showInfection"
                persistent
                transition-show="jump-down"
                transition-hide="jump-down"
            >
                <q-card style="width: 700px;" v-if="!settings.changeInfektion || previewFb ">
                    <q-bar class="q-pa-lg text-h6 text-white bg-primary">
                        {{actItem.itName || 'Infektion ohne Infektionsart'}}
                    </q-bar>
                    <div class="row q-px-xl q-py-sm">
                    
                        <div class="col-12 text-body1">
                            {{actItem.itDesc}}
                        </div>
                        
                    </div>
                    <q-separator />
                    <q-card-actions class="row q-px-lg q-py-sm" :class="[Dark.isActive ? 'bg-grey-10' : 'bg-grey-3']">
                        <div class="col-12 q-px-sm">
                            <q-btn unelevated align="center" class="full-width text-body1" padding="6px" color="primary" v-close-popup label="Ok" />
                        </div>
                    </q-card-actions>
                </q-card>
                
                <q-card style="width: 100%;" v-if="settings.changeInfektion && !previewFb">
                    <q-bar class="q-pa-lg text-h6 text-white bg-primary ">
                        {{actItemCopy.itName || 'Infektionsart wählen'}}
                    </q-bar>
                    <q-card-section style="max-height: 50vh" class="scroll">
                        <div class="row q-py-sm borderBottom">
                            <div class="col-2">
                                <q-radio :val="'noInf'" v-model="actItemCopy.infectionType"/>
                            </div>
                            <div class="col-10 q-pt-sm text-body1">
                                <div class="row">
                                    <div class="col-12 text-bold q-pb-sm">Ohne</div>
                                </div>
                            </div>
                            <q-separator />
                        </div>
                        <div class="row q-py-sm borderBottom">
                            <div class="col-2">
                                <q-radio :val="'onlyInf'" v-model="actItemCopy.infectionType"/>
                            </div>
                            <div class="col-10 q-pt-sm text-body1">
                                <div class="row">
                                    <div class="col-12 text-bold q-pb-sm" :class="[actItem.infektion && !actItem.infectionType ? 'text-orange' : '']">Infektion</div>
                                    <div class="col-12" style="white-space: pre-line">Infektion ohne Infektionsart</div>
                                </div>
                            </div>
                            <q-separator />
                        </div>
                        <div class="row q-py-sm borderBottom" v-for="(item, index) in infektionData" :key="index">
                            <div class="col-2">
                                <q-radio :val="item._id" v-model="actItemCopy.infectionType"/>
                            </div>
                            <div class="col-10 q-pt-sm text-body1">
                                <div class="row">
                                    <div class="col-12 text-bold q-pb-sm ellipsis" :class="[actItem.infectionType === item._id ? 'text-orange' : '']">{{item.infektionsName}}</div>
                                    <div class="col-12" style="white-space: pre-line">{{item.desc}}</div>
                                </div>
                            </div>
                            <q-separator />
                        </div>
                    </q-card-section>    
                    <q-separator />
                    <q-card-actions class="row q-px-lg q-py-sm" :class="[Dark.isActive ? 'bg-grey-10' : 'bg-grey-3']">
                        <div class="col-6 q-px-sm">
                            <q-btn unelevated align="center" class="full-width text-body1" padding="6px" color="negative" v-close-popup label="Abbrechen" />
                        </div>
                        <div class="col-6 q-px-sm">
                            <q-btn unelevated align="center" class="full-width text-body1" padding="6px" color="primary" v-close-popup @click="save('infection')" label="Speichern" />
                        </div>
                    </q-card-actions>
                </q-card>
            </q-dialog>

            <CustDialog 
                text="Möchten Sie wirklich Ihre aktuelle Fahrt abbrechen?" 
                v-if="showTripAbort" 
                :modelValue="showTripAbort" 
                :func="tripAbort" 
                @update:modelValue="(val) => showTripAbort = val"  
            />

            <q-dialog
                v-model="showChangeStartOrTarget"
                persistent
                transition-show="jump-down"
                transition-hide="jump-down">
                <q-card style="width: 700px;">
                    <q-bar class="q-pa-lg text-h6 text-white bg-primary">
                        Start/Ziel ändern
                    </q-bar>
                    <q-card-section>
                        <div class="row">
                            <div class="col-12 q-pb-sm">
                                <q-input filled  label-color="primary" v-model="fbChangeStartTarget.startInstitution" label="Institution" stack-label/>
                            </div>
                            <div class="col-12 q-pb-sm">
                                <q-input filled  label-color="primary" v-model="fbChangeStartTarget.startStreet" label="Strasse" stack-label/>
                            </div>
                            <div class="col-6 q-pr-xs">
                                <q-input filled  label-color="primary" v-model="fbChangeStartTarget.startZip" label="PLZ" stack-label/>
                            </div>
                            <div class="col-6 q-pl-xs">
                                <q-input filled  label-color="primary" v-model="fbChangeStartTarget.startCity" label="Stadt" stack-label/>
                            </div>
                            <div class="col-12 q-pt-sm">
                                <q-input filled  label-color="primary" v-model="fbChangeStartTarget.startInfo" autogrow label="Info Start" stack-label/>
                            </div>
                            <div class="col-12 q-pt-sm">
                                <q-btn unelevated align="center"  @click="getMyLocation('start')" class="full-width q-mb-sm text-white text-body1" padding="6px" color="amber-7" label="Standort als Start eintragen" />
                            </div>
                        </div>
                        <div class="row q-py-md">
                            <div class="col-12 q-pb-sm">
                                <q-input filled  label-color="primary" v-model="fbChangeStartTarget.targetInstitution" label="Institution" stack-label/>
                            </div>
                            <div class="col-12 q-pb-sm">
                                <q-input filled  label-color="primary" v-model="fbChangeStartTarget.targetStreet" label="Strasse" stack-label/>
                            </div>
                            <div class="col-6 q-pr-xs">
                                <q-input filled  label-color="primary" v-model="fbChangeStartTarget.targetZip" label="PLZ" stack-label/>
                            </div>
                            <div class="col-6 q-pl-xs">
                                <q-input filled  label-color="primary" v-model="fbChangeStartTarget.targetCity" label="Stadt" stack-label/>
                            </div>
                            <div class="col-12 q-pt-sm">
                                <q-input filled  label-color="primary" v-model="fbChangeStartTarget.targetInfo" autogrow label="Info Ziel" stack-label/>
                            </div>
                            <div class="col-12 q-pt-sm">
                                <q-btn unelevated align="center"  @click="getMyLocation('target')" class="full-width q-mb-sm text-white text-body1" padding="6px" color="amber-7" label="Standort als Ziel eintragen" />
                            </div>
                        </div>
                    </q-card-section>
                    <q-separator />
                    <q-card-actions align="center"  class="row" :class="[Dark.isActive ? 'bg-grey-10' : 'bg-grey-3']">
                        <q-btn unelevated align="center" class="col-5 text-body1" padding="6px" color="negative" v-close-popup label="Abbrechen" />
                        <q-btn unelevated align="center" class="col-5 text-body1" padding="6px" color="primary" @click="save()" label="Speichern" />
                    </q-card-actions>
                </q-card>
            </q-dialog>

            <q-dialog
                v-model="showTimestamps"
                persistent
                transition-show="jump-down"
                transition-hide="jump-down">
                <q-card style="width: 700px;">
                    <q-bar class="q-pa-lg text-h6 text-white bg-primary">
                        Zeitstempel
                    </q-bar>
                    <q-card-section>
                        <div class="row">
                            <div class="col-6 q-pb-sm text-weight-medium">
                            Anfahrt:
                            </div>
                            <div class="col-6 q-pr-xs">
                                {{actItem.startBegin}}
                            </div>
                            <div class="col-6 q-pb-sm text-weight-medium">
                            Ankunft Abholort:
                            </div>
                            <div class="col-6 q-pr-xs">
                                {{actItem.startEnd}}
                            </div>
                            <div class="col-6 q-pb-sm text-weight-medium">
                            Abfahrt:
                            </div>
                            <div class="col-6 q-pr-xs">
                                {{actItem.ziel}}
                            </div>
                            <div class="col-6 q-pb-sm text-weight-medium">
                            Ankunft Zielort:
                            </div>
                            <div class="col-6 q-pr-xs">
                                {{actItem.zielBegin}}
                            </div>
                            <div class="col-6 q-pb-sm text-weight-medium">
                            Frei:
                            </div>
                            <div class="col-6 q-pr-xs">
                                {{actItem.frei}}
                            </div>
                        </div>
                    </q-card-section>
                    <q-separator />
                    <q-card-actions align="center"  class="row" :class="[Dark.isActive ? 'bg-grey-10' : 'bg-grey-3']">
                        <q-btn unelevated align="center" class="col-12 text-body1" padding="6px" color="negative" v-close-popup label="Schliessen" />
                    </q-card-actions>
                </q-card>
            </q-dialog>
            <InsertDataDialog v-if="insertDataDialog" :insertDataDialog="insertDataDialog" :actItem="actItem" @close="closeDialog" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch, onBeforeMount }                        from 'vue';
import { useRouter, useRoute }                              from 'vue-router';
import {Global}                                               from '../helpers/Global';
import CustDialog                                           from 'src/components/Dialog.vue'
import MusterVier                                           from 'src/components/MusterVier.vue';
import FahrberichtStatusView                                from 'src/components/FahrberichtStatusView.vue';
import { Notify, Screen, extend, Dark }                     from 'quasar';
import { ICoststatusItem, useCoststatusStore }              from 'src/stores/coststatus.store';
import { IStopItem, IFahrbericht }                                        from 'src/stores/menu.store';
import { useInfektionenStore }                              from 'src/stores/infektionen.store';
import { useSettingsStore }                                 from 'src/stores/settings.store';
import { useFahrberichtStore }                              from 'src/stores/fahrbericht.store';
import { useFahrberichteStore }                             from 'src/stores/fahrberichte.store';
import { useAccountStore }                                  from 'src/stores/account.store';
import { useNavStore }                                      from 'src/stores/nav.store';
import { useAuditStore }                                    from 'src/stores/audit.store';
import { storeToRefs, defineStore }                         from 'pinia'
import dayjs                                                from 'dayjs';
import InsertDataDialog                                     from 'src/components/InsertDataDialog.vue'

import debug                                                from 'debug';
const log                                                   = debug('app:FahrberichtView');

const props = defineProps({
    showStatusButtons: {
        type: Boolean,
        default: false
    },
    insertDataDialog: {
        type: Boolean
    }
})

const emit = defineEmits(['close'])

function closeDialog() {
    emit('close')
}

const global                    = Global()
const router                    = useRouter()
const route                     = useRoute()

const   showInfection           = ref(false),
        na                      = ref('-'),
        showChangeStartOrTarget = ref(false),
        fbChangeStartTarget     = ref<{[key:string]: any}>({}),
        showTripAbort           = ref(false),
        showTimestamps          = ref(false);

const costStatusStore           = useCoststatusStore()
const { data: costStatusData }  = storeToRefs(costStatusStore)

const infektionenStore          = useInfektionenStore()
const { data: infektionData }   = storeToRefs(infektionenStore)

const settingsStore             = useSettingsStore()
const { item: settings }        = storeToRefs(settingsStore)

const fahrberichtStore          = useFahrberichtStore()

const fahrberichteStore         = useFahrberichteStore()
const { previewFb }             = storeToRefs(fahrberichteStore)

const accountStore              = useAccountStore()
const { fahrer, beifahrer, geoPos, standartNavigation, darkMode } = storeToRefs(accountStore);

const navStore                  = useNavStore()
const { searchItem: searchNavPoint }            = storeToRefs(navStore)

const auditStore                = useAuditStore()
let  actItem: any               = null    
if ( route.params?.id ) {
    const dynamicStore = defineStore(route.params?.id, {})()
    const { item }   = storeToRefs(dynamicStore);
    actItem = item;
} else {
    const { item }                  = storeToRefs(fahrberichtStore);
    actItem = item;
}

const actItemCopy             = ref<IFahrbericht>(extend( true, {}, actItem.value));

function setCostStatus () {
    const item = costStatusData.value.find( (item: ICoststatusItem) => {
        return item._id === actItem.value.costStatus
    })

    if (item)
        return item.status;
    else
        return na.value
} 

function setSonderleistungen () {
    if (actItem.value.sonderleistungen && actItem.value.sonderleistungen.length > 0)
        return actItem.value.sonderleistungen.join(', ');
    else
        return na.value;
}

async function getMyLocation ( target: any ) {
   const adress = await accountStore.getMyLocation(( res: any ) => {
       let obj = {
            startStreet:    res.street,
            startZip:       res.zip,
            startCity:      res.city
        }

        if ( target === 'target' )
            obj = {
                targetStreet:    res.street,
                targetZip:       res.zip,
                targetCity:      res.city
            }

        fbChangeStartTarget.value = { ...fbChangeStartTarget.value, ...obj }
    } );
}

async function save ( type?: string ) {
    const   changeItem  = fbChangeStartTarget.value;

    const changedAdress: {[key: string]: string | number | undefined} = {
        _id: actItem.value._id,
    }

    if (type === 'infection') {
        const existsInf = infektionData.value.find( (item) => { 
            return item._id === actItemCopy.value.infectionType;
        } )

        if ( actItemCopy.value.infectionType === 'noInf' ) {
            changedAdress.infectionType     = ''
            changedAdress.itKrz             = ''
            changedAdress.itDesc            = ''
            changedAdress.itName            = ''
            changedAdress.infektion         = 0
        } else if ( actItemCopy.value.infectionType === 'onlyInf' ) {
            changedAdress.infectionType     = ''
            changedAdress.itKrz             = ''
            changedAdress.itDesc            = ''
            changedAdress.itName            = ''
            changedAdress.infektion         = 1
        } else {
            changedAdress.infectionType     = actItemCopy.value.infectionType
            changedAdress.itKrz             = existsInf?.krz
            changedAdress.itDesc            = existsInf?.desc
            changedAdress.itName            = existsInf?.infektionsName
            changedAdress.infektion         = 1
        }
    } else {
        if ( actItem.value.startStreet !== changeItem.startStreet ) 
            changedAdress.startStreet = changeItem.startStreet;
        
        if ( actItem.value.startZip !== changeItem.startZip ) 
            changedAdress.startZip = changeItem.startZip;

        if ( actItem.value.startCity !== changeItem.startCity ) 
            changedAdress.startCity = changeItem.startCity;

        if ( actItem.value.targetStreet !== changeItem.targetStreet ) 
            changedAdress.targetStreet = changeItem.targetStreet;

        if ( actItem.value.targetZip !== changeItem.targetZip ) 
            changedAdress.targetZip = changeItem.targetZip;

        if ( actItem.value.targetCity !== changeItem.targetCity ) 
            changedAdress.targetCity = changeItem.targetCity;

        if ( actItem.value.targetInfo !== changeItem.targetInfo ) 
            changedAdress.targetInfo = changeItem.targetInfo;

        if ( actItem.value.startInfo !== changeItem.startInfo ) 
            changedAdress.startInfo = changeItem.startInfo;

        if ( actItem.value.startInstitution !== changeItem.startInstitution ) 
            changedAdress.startInstitution = changeItem.startInstitution;

        if ( actItem.value.targetInstitution !== changeItem.targetInstitution ) 
            changedAdress.targetInstitution = changeItem.targetInstitution;
    }

    const changed = global.compareObjects( changedAdress, {
        _id: actItem.value._id,
    });

    if ( !changed ) {
        await auditStore.setItem({type: 'fahrbericht', value: changedAdress, fb: actItem.value });
        await fahrberichtStore.setShowItem( { ...actItem.value, ...changedAdress } );
        showChangeStartOrTarget.value = false;
        return;
    }

    Notify.create({
        type: 'negative',
        message: 'Es sind keine Änderungen vorhanden',
        position: 'bottom',
        progress: true,
        timeout: 2000,
        color: 'negative',
        classes: 'glossy',
    })
}

function SetShowChangeStartOrTarget () {
    fbChangeStartTarget.value = { ...actItem.value };
    showChangeStartOrTarget.value = true
}

const groupByData = ref<any>(null);

watch( actItem, (newVal: any) => {
    if (newVal)
        groupByData.value = newVal.stops ? global.toPairs( global.groupBy( newVal.stops, 'adress' ) ) : null;
}, { deep: true, immediate: true } )

function startNavigation ( stop: IStopItem ) {
    accountStore.startNavigation( { type: 'Linie', datId: stop } )
}

//only for Linie
async function setStatus ( status: string, stop?: IStopItem  ) {
    let data = {};

    if ( !actItem.value )
        return;

    if (status === 'startBegin' || status === 'zielBegin' || status === 'frei') {
        await fahrberichtStore.setTimestamp( status );

        data = {
            fahrer:         fahrer.value?._id,
            beifahrer:      beifahrer.value?._id,
            _id:            actItem.value?._id,
            status,
            date:           actItem.value?.date
        }
    } else {
        if (!stop)
            return;

        data = {
            fahrer:         fahrer.value?._id,
            beifahrer:      beifahrer.value?._id,
            _id:            actItem.value?._id,
            fbId:           actItem.value?._id,
            status,
            einstieg:       status === 'Einstieg',
            id:             stop?._id,
            date:           actItem.value?.date,
            type:           'Linie',
            timestamp:       dayjs().format('HH:mm')
        }
    }

    await auditStore.setItem({ type:'zeitstempel', value: data });

    if ( status === 'frei' ) {
        global.tripAbort(actItem.value._id);
        router.push('/app/fahrberichte')
    }
}

function tripAbort () {
    showTripAbort.value = false;
    global.tripAbort(actItem.value._id);
    router.push('/app/fahrberichte')
}

function setInfText() {
    if ( actItem.value.infektion && !actItem.value.itName )
        return 'Infektion ohne Infektionsart'

    if ( actItem.value.itName )
        return actItem.value.itName
    else
        return 'Keine Angaben'
}

function setShowInfection (data: any) {
    actItemCopy.value = {...actItem.value, ...{ infectionType: !actItem.value.infectionType && !actItem.value.infektion ? 'noInf' : ( actItem.value.infektion && !actItem.value.infectionType ? 'onlyInf' : actItem.value.infectionType) }};
    showInfection.value = data
}

function setShowTimestamps () {
    if ( showTimestamps.value )
        showTimestamps.value = false;
    else
        showTimestamps.value = true;
}

function setClass () {
    if ( props.showStatusButtons !== true )
        return 'layoutHeightRoot scroll-y'
    return ''
    //return Platform.is.ios ? 'scrollarea-ios-height-modal' : 'scrollarea-default-height'
}

function printEinsatzprotokoll () {
    fahrberichtStore.printEinsatzprotokoll()
}

onBeforeMount(() => {
    accountStore.setSecondHeader('')
    if ( actItem.value?.type === 'Linie' )
        accountStore.setTitle(actItem.value?.titel)
    else {
        const title = navStore.setTitle(actItem.value)
        accountStore.setTitle(title)
    }
});
</script>
<style scope lang="scss">
    .borderBottom {
        border-bottom: 1px solid $grey-6;
    }
</style>
