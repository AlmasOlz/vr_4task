<template>
  <div id="arRoomRoot">
    <a-scene embedded vr-mode-ui="enabled: false" loading-screen="enabled: false"
      renderer="alpha: true; antialias: true" :arjs="arOptions">
      <a-marker id="hiroMarker" type="pattern" :url="base + 'patt.nav'">
        <a-entity id="directionArrow" v-if="route && !route.reached" :gltf-model="base + 'gltf/arrow/scene.gltf'"
          position="0 0.25 0" :rotation="rotation" scale="0.5 0.5 0.5" nav-visual="color: #2196f3"></a-entity>
        <a-entity id="destinationPointer" v-if="route && route.reached" :gltf-model="base + 'gltf/pointer/scene.gltf'"
          position="0 0.25 0" rotation="0 0 0" scale="0.5 0.5 0.5" nav-visual="color: #18a558"></a-entity>
      </a-marker>
      <a-entity camera></a-entity>
    </a-scene>
    <div v-if="error" class="camera-error" role="alert">{{error}}<br><a :href="base">Вернуться на главную</a></div>
  </div>
</template>
<script>
import nav from '../navigation';
export default {
  name:'ArRoom', props:['id'],
  data(){return {base:process.env.BASE_URL,goalId:Number(this.$route.query.goal)||3,
    current:null,route:null,error:'',markerVisible:false,canvas:null,timer:null,lastSpoken:''};},
  computed:{
    arOptions(){return 'sourceType: webcam; sourceWidth: 1280; sourceHeight: 960; canvasWidth: 640; canvasHeight: 480; maxDetectionRate: 20; debugUIEnabled: false; cameraParametersUrl: '+this.base+'camera_para.dat;';},
    rotation(){const step=this.route&&this.route.steps[0];const match=step&&step.directions.match(/\[(\d+)\]/);return (90-Number(match?match[1]:0))+' 90 90';}
  },
  mounted(){
    document.documentElement.classList.add('ar-active');
    this.canvas=document.createElement('canvas');
    this.context=this.canvas.getContext('2d',{willReadFrequently:true});
    this.cameraError=event=>{this.error='Необходимо разрешить доступ к камере в настройках браузера и обновить страницу.';};
    window.addEventListener('camera-error',this.cameraError);
    window.addEventListener('resize',this.resizeCamera);
    const marker=document.getElementById('hiroMarker');
    marker.addEventListener('markerFound',()=>{this.markerVisible=true;this.speak();});
    marker.addEventListener('markerLost',()=>{this.markerVisible=false;});
    this.timer=setInterval(this.scanFrame,250);
  },
  beforeDestroy(){
    clearInterval(this.timer);
    window.removeEventListener('camera-error',this.cameraError);
    window.removeEventListener('resize',this.resizeCamera);
    document.documentElement.classList.remove('ar-active');
    ['width','height','margin-left','margin-top'].forEach(name=>document.body.style.removeProperty(name));
    const video=document.getElementById('arjs-video');
    if(video){if(video.srcObject)video.srcObject.getTracks().forEach(track=>track.stop());video.remove();}
    if(window.speechSynthesis)window.speechSynthesis.cancel();
  },
  methods:{
    resizeCamera(){
      const video=document.getElementById('arjs-video');
      if(!video||!video.videoWidth||!video.videoHeight)return;
      const width=window.innerWidth,height=window.innerHeight;
      const key=[width,height,video.videoWidth,video.videoHeight].join(':');
      if(this.cameraSize===key)return;
      this.cameraSize=key;
      const scale=Math.max(width/video.videoWidth,height/video.videoHeight);
      const sourceWidth=video.videoWidth*scale,sourceHeight=video.videoHeight*scale;
      this.$el.style.setProperty('--ar-width',sourceWidth+'px');
      this.$el.style.setProperty('--ar-height',sourceHeight+'px');
      this.$el.style.setProperty('--ar-left',(width-sourceWidth)/2+'px');
      this.$el.style.setProperty('--ar-top',(height-sourceHeight)/2+'px');
    },
    scanFrame(){
      const video=document.getElementById('arjs-video');
      if(!video||video.readyState<2||!video.videoWidth||!window.jsQR)return;
      this.resizeCamera();
      const width=Math.min(video.videoWidth,1280),height=Math.round(video.videoHeight*width/video.videoWidth);
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
      const text=this.route.reached?'Вы достигли цели!':nav.directionText(Number(step.directions.match(/\[(\d+)\]/)[1]));
      const key=this.current+':'+this.goalId;
      if(this.lastSpoken===key)return;
      this.lastSpoken=key;
      const utterance=new window.SpeechSynthesisUtterance(text);utterance.lang='ru-RU';
      window.speechSynthesis.cancel();window.speechSynthesis.speak(utterance);
    }
  }
};
</script>
<style>
html.ar-active,html.ar-active body{margin:0!important;width:100vw!important;height:100vh!important;overflow:hidden}
.ar-active .application,.ar-active .application--wrap,#arRoomRoot{background:transparent!important}
#arRoomRoot,#arRoomRoot a-scene{position:fixed!important;inset:0;width:100%!important;height:100%!important}
#arRoomRoot canvas{position:fixed!important;left:0!important;top:0!important;width:var(--ar-width,100vw)!important;height:var(--ar-height,100vh)!important;margin-left:var(--ar-left,0px)!important;margin-top:var(--ar-top,0px)!important}
.ar-active #arjs-video{position:fixed!important;inset:0;width:100vw!important;height:100vh!important;object-fit:cover;margin:0!important;z-index:-2!important}
.ar-active .a-enter-vr,.ar-active .a-enter-ar,.ar-active .arjs-loader,.ar-active .a-loader-title{display:none!important}
.camera-error{position:fixed;inset:24px 16px auto;background:white;padding:20px;color:#222;z-index:10}
</style>
