<template>
  <div ref="container" class="w-full h-[100dvh] overflow-hidden"></div>
  <div
    ref="vueAppContainer"
    style="position:absolute; left:-9999px; width:1920px; height:1080px; overflow:hidden; background: white;"
  >
    <component :is="currentComponent" v-if="currentComponent" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import html2canvas from 'html2canvas';

import Home from '@/router/views/Home.vue';
import Login from '@/router/views/Login.vue';
import Boot from '@/router/views/Boot.vue';

const props = defineProps<{
  internalRoute?: string;
}>();

const container = ref<HTMLDivElement | null>(null);
const vueAppContainer = ref<HTMLDivElement | null>(null);

const routeComponentMap: Record<string, unknown> = {
  '/home': Home,
  '/login': Login,
  '/boot': Boot,
};

const currentComponent = shallowRef(routeComponentMap[props.internalRoute || '/home']);

let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let animationId: number;

onMounted(async () => {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0.15, 0.55);
  camera.lookAt(0, 0.085, 0);
  
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x222222);
  container.value!.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // Load PC model
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync('/models/macbook_v2.glb');
  const model = gltf.scene;
  scene.add(model);

  // Find your screen mesh by name
  const screenMesh = model.getObjectByName('Screen_container') as THREE.Mesh; // 👈 Change to your mesh name
  
  if (!screenMesh) {
    return;
  }

  // Create texture
  const texture = new THREE.CanvasTexture(document.createElement('canvas'));
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = true;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  
  // Apply to screen
  screenMesh.material = new THREE.MeshBasicMaterial({ 
    map: texture,
    side: THREE.DoubleSide 
  });

  // Wait for component to render
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Capture and update texture
  async function updateTexture() {
    if (!vueAppContainer.value) return;
    
    try {
      const canvas = await html2canvas(vueAppContainer.value, {
        backgroundColor: '#ffffff',
        width: 1920,
        height: 1080,
        scale: 1,
        logging: false,
      });
      
      texture.image = canvas;
      texture.needsUpdate = true;
    } catch (err) {
      console.error('Texture update error:', err);
    }
  }

  await updateTexture();
  setInterval(updateTexture, 100); // Update 10 times per second

  // Animate
  function animate() {
    animationId = requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();

  // Resize handler
  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', handleResize);
  
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });
});

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId);
  if (renderer) renderer.dispose();
});
</script>