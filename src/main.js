// Import Three.js and dependencies
import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/GLTFLoader.js';

// Import our custom modules
import { createEmbeddedWorld } from './world.js';
import { setupUI } from './ui.js';

// Main Application Class
class EmbeddedPortfolio {
    constructor() {
        this.loadingManager = new THREE.LoadingManager();
        this.loadingScreen = document.querySelector('.loading-screen');
        this.progressBar = document.querySelector('.progress-fill');
        this.loadingText = document.querySelector('.loading-text');
        this.experience = document.querySelector('.experience');
        this.overlay = document.querySelector('.overlay');
        this.closeBtn = document.querySelector('.close-btn');
        
        this.loadingPhrases = [
            'Loading embedded components...',
            'Initializing microcontroller models...',
            'Setting up virtual circuit boards...',
            'Configuring virtual development environment...',
            'Loading 3D assets...',
            'Compiling virtual firmware...',
            'Establishing communication protocols...',
            'Preparing interactive experience...'
        ];
        
        this.currentLoadingPhrase = 0;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.world = null;
        
        this.setupLoaders();
        this.init();
    }
    
    setupLoaders() {
        // Setup loading manager
        this.loadingManager.onProgress = (url, loaded, total) => {
            const progressPercent = (loaded / total) * 100;
            this.progressBar.style.width = `${progressPercent}%`;
            
            // Change loading text periodically
            if (progressPercent > this.currentLoadingPhrase * (100 / this.loadingPhrases.length)) {
                this.loadingText.textContent = this.loadingPhrases[this.currentLoadingPhrase];
                this.currentLoadingPhrase = Math.min(
                    this.currentLoadingPhrase + 1, 
                    this.loadingPhrases.length - 1
                );
            }
        };
        
        this.loadingManager.onLoad = () => {
            // Simulate minimum loading time for effect
            setTimeout(() => {
                this.loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    this.loadingScreen.style.display = 'none';
                }, 500);
            }, 1000);
        };
    }
    
    init() {
        // Initialize Three.js
        this.scene = new THREE.Scene();
        
        // Set up camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(0, 1.6, 5);
        
        // Set up renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.experience.appendChild(this.renderer.domElement);
        
        // Set up controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 20;
        this.controls.maxPolarAngle = Math.PI / 2;
        
        // Create embedded world
        this.world = createEmbeddedWorld(this.scene, this.camera, this.loadingManager);
        
        // Setup UI events
        setupUI(this.world);
        
        // Setup instructions overlay
        this.closeBtn.addEventListener('click', () => {
            this.overlay.style.opacity = '0';
            setTimeout(() => {
                this.overlay.style.display = 'none';
            }, 500);
        });
        
        // Handle window resize
        window.addEventListener('resize', this.onResize.bind(this));
        
        // Start animation loop
        this.animate();
    }
    
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // Update controls
        this.controls.update();
        
        // Update world
        if (this.world) {
            this.world.update();
        }
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Start application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EmbeddedPortfolio();
}); 