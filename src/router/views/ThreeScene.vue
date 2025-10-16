<template>
  <div ref="container" class="w-full h-[100dvh] overflow-hidden"></div>
  <div
    ref="vueAppContainer"
    style="position:absolute; left:-9999px; width:2048px; height:1080px; overflow:hidden; background: white;"
  >
    <component :is="currentComponent" v-if="currentComponent" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import html2canvas from 'html2canvas';

// Import the components you want to display
import Home from '@/router/views/Home.vue';
import Login from '@/router/views/Login.vue';
import Boot from '@/router/views/Boot.vue';

const props = defineProps<{
  internalRoute?: string;
}>();

const container = ref<HTMLDivElement | null>(null);
const vueAppContainer = ref<HTMLDivElement | null>(null);

// Map routes to components
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
  // Setup Three.js scene
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0.15, 0.5);
  camera.lookAt(0, 0.085, 0);
  
  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x222222);
  container.value!.appendChild(renderer.domElement);

  // Add some lights so your PC model is visible
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // Load the model
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync('/models/macbook_v2.glb');
  const model = gltf.scene;
  scene.add(model);

  // Debug: Log all object names in the model
  // console.log('=== Model hierarchy ===');
  // model.traverse((child) => {
  //   if (child.name) {
  //     console.log(`- ${child.name} (${child.type})`);
  //   }
  // });

  // Find the screen plane by name
  const screenMesh = model.getObjectByName('Screen_container');
  
  if (!screenMesh || !(screenMesh instanceof THREE.Mesh)) {
    // console.error('Screen mesh not found or is not a Mesh');
    // console.log('Available mesh names:', 
    //   Array.from(new Set(
    //     model.children
    //       .filter(c => c instanceof THREE.Mesh)
    //       .map(c => c.name)
    //   ))
    // );
    return;
  }

  // Create high-quality texture
  const texture = new THREE.CanvasTexture(document.createElement('canvas'));
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  // Create material with the texture
  const material = new THREE.MeshBasicMaterial({ 
    map: texture,
    side: THREE.DoubleSide
  });
  
  // Apply to the screen mesh
  screenMesh.material = material;

  // Optional: Scale the screen if aspect ratio is wrong
  // const textureAspect = 2048 / 1536; // 1.333 (4:3)
  // screenMesh.scale.x = textureAspect;

  // Wait for Vue component to fully render
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Function to capture and update texture
  async function updateTexture() {
    try {
      if (!vueAppContainer.value) {
        console.warn('Vue app container not found');
        return;
      }
      
      const canvas = await html2canvas(vueAppContainer.value, {
        backgroundColor: '#ffffff',
        width: 2048,
        height: 1080,
        scale: 1,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      
      texture.image = canvas;
      texture.needsUpdate = true;
    } catch (err) {
      console.error('Texture update error:', err);
    }
  }

  // Initial capture
  await updateTexture();
  
  // Update periodically (10 FPS)
  setInterval(updateTexture, 100);

  // Animation loop
  const animate = () => {
    animationId = requestAnimationFrame(animate);
    // Optional: Rotate the entire PC model
    // model.rotation.y += 0.002;
    renderer.render(scene, camera);
  };
  animate();

  // Handle window resize
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
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  if (renderer) {
    renderer.dispose();
  }
});
</script>