<template>
  <v-content><v-container style="max-width:620px">
    <h1 class="headline mb-3">AR-Nav</h1>
    <p>Приветствуем Вас в приложении AR-Nav!</p>
    <p>Приложение AR-Nav предназначено для облегчения ориентации в закрытых помещениях. Для этого мы используем технологию дополненной реальности.</p>
    <v-alert :value="true" type="info" outline>Этаж кафедры ПОАС. Учебно-лабораторный корпус «В». 9 этаж.</v-alert>
    <p>Навигация будет происходить пошагово. На каждом шаге Вам необходимо найти и сканировать AR-метку. После этого Вы получите указания, где найти следующую метку. Следуйте им, чтобы достигнуть своей цели.</p>
    <p>Указания предполагают, что Вы смотрите на метку под прямым углом. Оптимальная дистанция сканирования AR-метки — 30–40 см.</p>
    <v-select v-model="goalId" :items="goals" item-text="title" item-value="id" label="Выбор цели" outline></v-select>
    <v-btn color="primary" large :to="{name:'ar_room',params:{id:1},query:{goal:goalId}}">Исследовать</v-btn>
    <v-btn outline :href="base + 'markers.html'" target="_blank" rel="noopener">Маркеры</v-btn>
  </v-container></v-content>
</template>
<script>
import nav from '../navigation';
export default { name:'Home', data(){return {goalId:3,goals:nav.goals,base:process.env.BASE_URL}} };
</script>
