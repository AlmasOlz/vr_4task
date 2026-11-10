<template>
  <div id="arRoomRoot">
    <a-scene embedded vr-mode-ui="enabled: false" loading-screen="enabled: false"
      renderer="alpha: true; antialias: true" :arjs="arOptions">
      <a-marker id="hiroMarker" type="pattern" :url="base + 'patt.hiro'">
        <a-entity id="directionArrow" v-if="route && !route.reached" :gltf-model="base + 'gltf/arrow/scene.gltf'"
          position="0 0.25 0" :rotation="rotation" scale="0.5 0.5 0.5" nav-visual="color: #2196f3"></a-entity>
        <a-entity id="destinationPointer" v-if="route && route.reached" :gltf-model="base + 'gltf/pointer/scene.gltf'"
          position="0 0.25 0" rotation="0 0 0" scale="0.5 0.5 0.5" nav-visual="color: #18a558"></a-entity>
      </a-marker>
      <a-entity camera></a-entity>
    </a-scene>
    <div v-if="error" class="camera-error" role="alert">{{error}}<br><a :href="base">Басты бетке қайту</a></div>
  </div>
</template>
<script>
import nav from '../navigation';
export default {
  name:'ArRoom', props:['id'],
  data(){return {base:process.env.BASE_URL,goalId:Number(this.$route.query.goal)||3,
    current:null,route:null,error:'',markerVisible:false,canvas:null,timer:null,lastSpoken:''};},
  computed:{
    arOptions(){return 'sourceType: webcam; debugUIEnabled: false; cameraParametersUrl: '+this.base+'camera_para.dat;';},
    rotation(){const step=this.route&&this.route.steps[0];const match=step&&step.directions.match(/\[(\d+)\]/);return (90-Number(match?match[1]:0))+' 90 90';}
  },
  mounted(){
    document.documentElement.classList.add('ar-active');
    this.canvas=document.createElement('canvas');
    this.context=this.canvas.getContext('2d',{willReadFrequently:true});
    this.cameraError=event=>{this.error='Камера ашылмады. Браузерден камераға рұқсат беріп, бетті қайта ашыңыз.';};
    window.addEventListener('camera-error',this.cameraError);
    const marker=document.getElementById('hiroMarker');
    marker.addEventListener('markerFound',()=>{this.markerVisible=true;this.speak();});
    marker.addEventListener('markerLost',()=>{this.markerVisible=false;});
    this.timer=setInterval(this.scanFrame,250);
  },
  beforeDestroy(){
    clearInterval(this.timer);
    window.removeEventListener('camera-error',this.cameraError);
    document.documentElement.classList.remove('ar-active');
    ['width','height','margin-left','margin-top'].forEach(name=>document.body.style.removeProperty(name));
    const video=document.getElementById('arjs-video');
    if(video){if(video.srcObject)video.srcObject.getTracks().forEach(track=>track.stop());video.remove();}
    if(window.speechSynthesis)window.speechSynthesis.cancel();
  },
  methods:{
    scanFrame(){
      const video=document.getElementById('arjs-video');
      if(!video||video.readyState<2||!video.videoWidth||!window.jsQR)return;
      const width=Math.min(video.videoWidth,800),height=Math.round(video.videoHeight*width/video.videoWidth);
      if(this.canvas.width!==width||this.canvas.height!==height){this.canvas.width=width;this.canvas.height=height;}
      this.context.drawImage(video,0,0,width,height);
      const frame=this.context.getImageData(0,0,width,height);
      const code=window.jsQR(frame.data,width,height,{inversionAttempts:'dontInvert'});
      if(code)this.onDecode(code.data);
    },
    onDecode(payload){
      const key=String(payload).trim();
      if(!/^\d+$/.test(key)||!nav.nodes[key]||this.current===Number(key))return;
      this.current=Number(key);
      this.route=nav.shortestPath(this.current,this.goalId);
      document.documentElement.dataset.navMarker=key;
      document.documentElement.dataset.navState=this.route.reached?'reached':'navigating';
      this.speak();
    },
    speak(){
      if(!this.markerVisible||!this.route||!window.SpeechSynthesisUtterance||!window.speechSynthesis)return;
      const step=this.route.steps[0];
      const text=this.route.reached?'Мақсатқа жеттіңіз':nav.directionText(Number(step.directions.match(/\[(\d+)\]/)[1]));
      const key=this.current+':'+this.goalId;
      if(this.lastSpoken===key)return;
      this.lastSpoken=key;
      const utterance=new window.SpeechSynthesisUtterance(text);utterance.lang='kk-KZ';
      window.speechSynthesis.cancel();window.speechSynthesis.speak(utterance);
    }
  }
};
</script>
<style>
html.ar-active,html.ar-active body{margin:0!important;width:100vw!important;height:100vh!important;overflow:hidden}
.ar-active .application,.ar-active .application--wrap,#arRoomRoot{background:transparent!important}
#arRoomRoot,#arRoomRoot a-scene{position:fixed!important;inset:0;width:100%!important;height:100%!important}
#arRoomRoot canvas{width:100%!important;height:100%!important;left:0!important;top:0!important;margin:0!important}
.ar-active #arjs-video{position:fixed!important;inset:0;width:100vw!important;height:100vh!important;object-fit:cover;margin:0!important;z-index:-2!important}
.ar-active .a-enter-vr,.ar-active .a-enter-ar,.ar-active .arjs-loader,.ar-active .a-loader-title{display:none!important}
.camera-error{position:fixed;inset:24px 16px auto;background:white;padding:20px;color:#222;z-index:10}
</style>
