<template>
  <v-content><v-container style="max-width:620px">
    <h1 class="headline mb-3">4-тапсырма · AR-Nav</h1>
    <p>Ғимарат ішіндегі маркерлер бойынша навигация.</p>
    <v-alert :value="true" type="info" outline>Автордың үлгі қабаты: 901–908 аудиториялары. Бұл сіздің ғимаратыңыздың картасы емес.</v-alert>
    <p>1. Маркерлерді басқа экраннан ашыңыз немесе басып шығарыңыз.</p>
    <p>2. Баратын аудиторияны таңдап, камераны қосыңыз.</p>
    <p>3. Hiro суреті мен QR коды кадрға толық кірсін. Көк жебе келесі нүктенің бағытын көрсетеді; жасыл белгі — мақсатқа жеткеніңіз.</p>
    <v-select v-model="goalId" :items="goals" item-text="title" item-value="id" label="Баратын жер" outline></v-select>
    <v-btn color="primary" large :to="{name:'ar_room',params:{id:1},query:{goal:goalId}}">Камераны қосу</v-btn>
    <v-btn outline :href="base + 'markers.html'" target="_blank" rel="noopener">Маркерлерді ашу</v-btn>
    <p class="mt-4 grey--text">Камераға рұқсат беріңіз. Қайту үшін браузердің «Артқа» батырмасын басыңыз. Бағыт өзгерсе, сол жердегі маркерді сканерлеңіз — маршрут қайта есептеледі.</p>
  </v-container></v-content>
</template>
<script>
import nav from '../navigation';
export default { name:'Home', data(){return {goalId:3,goals:nav.goals,base:process.env.BASE_URL}} };
</script>
