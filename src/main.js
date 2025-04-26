// Import Three.js and dependencies
import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/GLTFLoader.js';
import { FirstPersonControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/FirstPersonControls.js';
import { PointerLockControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/PointerLockControls.js';

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
            'Initializing navigation systems...',
            'Calibrating spaceship thrusters...',
            'Establishing MCU communication links...',
            'Loading embedded systems database...',
            'Preparing virtual environment...',
            'Configuring STM32 and nRF5 models...',
            'Establishing communication protocols...',
            'Preparing for launch sequence...'
        ];
        
        this.currentLoadingPhrase = 0;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.world = null;
        
        // Movement variables
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = false;
        this.isJumping = false;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.prevTime = performance.now();
        
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
        this.camera.position.set(0, 2, 5);
        
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
        
        // Create embedded world
        this.world = createEmbeddedWorld(this.scene, this.camera, this.loadingManager);
        
        // Setup first-person controls
        this.setupFirstPersonControls();
        
        // Setup UI events
        setupUI(this.world);
        
        // Setup instructions overlay
        this.closeBtn.addEventListener('click', () => {
            this.overlay.style.opacity = '0';
            setTimeout(() => {
                this.overlay.style.display = 'none';
                // Start controls when overlay is dismissed
                this.controls.lock();
            }, 500);
        });
        
        // Handle window resize
        window.addEventListener('resize', this.onResize.bind(this));
        
        // Start animation loop
        this.animate();
    }
    
    setupFirstPersonControls() {
        // Setup pointer lock controls
        this.controls = new PointerLockControls(this.camera, document.body);
        
        // Setup control events
        this.controls.addEventListener('lock', () => {
            document.body.classList.add('controls-active');
        });
        
        this.controls.addEventListener('unlock', () => {
            document.body.classList.remove('controls-active');
        });
        
        // Add event listeners for movement
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
        
        // Click to lock controls
        this.experience.addEventListener('click', () => {
            if (!this.loadingScreen.style.display || this.loadingScreen.style.display !== 'none') return;
            if (!this.overlay.style.display || this.overlay.style.display !== 'none') return;
            
            this.controls.lock();
        });
    }
    
    onKeyDown(event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.moveForward = true;
                break;
                
            case 'ArrowLeft':
            case 'KeyA':
                this.moveLeft = true;
                break;
                
            case 'ArrowDown':
            case 'KeyS':
                this.moveBackward = true;
                break;
                
            case 'ArrowRight':
            case 'KeyD':
                this.moveRight = true;
                break;
                
            case 'Space':
                if (this.canJump === true) {
                    this.velocity.y = 10;
                    this.isJumping = true;
                }
                this.canJump = false;
                break;
        }
    }
    
    onKeyUp(event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.moveForward = false;
                break;
                
            case 'ArrowLeft':
            case 'KeyA':
                this.moveLeft = false;
                break;
                
            case 'ArrowDown':
            case 'KeyS':
                this.moveBackward = false;
                break;
                
            case 'ArrowRight':
            case 'KeyD':
                this.moveRight = false;
                break;
        }
    }
    
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    updatePlayerMovement() {
        if (!this.controls.isLocked) return;
        
        const time = performance.now();
        const delta = (time - this.prevTime) / 1000;
        
        // Apply gravity
        this.velocity.y -= 9.8 * delta;
        
        // Get movement direction
        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize();
        
        // Move player
        if (this.moveForward || this.moveBackward) {
            this.controls.moveForward(this.direction.z * 5.0 * delta);
        }
        
        if (this.moveLeft || this.moveRight) {
            this.controls.moveRight(this.direction.x * 5.0 * delta);
        }
        
        // Apply vertical movement (jumping/falling)
        this.controls.getObject().position.y += this.velocity.y * delta;
        
        // Ground detection
        if (this.controls.getObject().position.y < 2) {
            this.velocity.y = 0;
            this.controls.getObject().position.y = 2;
            this.canJump = true;
            this.isJumping = false;
        }
        
        this.prevTime = time;
    }
    
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // Update player movement
        this.updatePlayerMovement();
        
        // Update world
        if (this.world) {
            this.world.update(this.camera);
        }
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Start application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EmbeddedPortfolio();
}); 