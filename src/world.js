import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/DRACOLoader.js';
import { Sky } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/objects/Sky.js';
import { Water } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/objects/Water.js';

// Class to create and manage the 3D embedded systems themed world
export function createEmbeddedWorld(scene, camera, loadingManager) {
    return new EmbeddedWorld(scene, camera, loadingManager);
}

class EmbeddedWorld {
    constructor(scene, camera, loadingManager) {
        this.scene = scene;
        this.camera = camera;
        this.loadingManager = loadingManager;
        
        // Loaders
        this.gltfLoader = new GLTFLoader(this.loadingManager);
        this.textureLoader = new THREE.TextureLoader(this.loadingManager);
        
        // Setup Draco loader for compressed models
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.1/');
        this.gltfLoader.setDRACOLoader(dracoLoader);
        
        // Interactive objects
        this.interactiveObjects = [];
        this.hoveredObject = null;
        this.INTERSECTED = null;
        
        // Spaceship
        this.spaceship = null;
        this.inSpaceship = false;
        this.spaceshipControls = {
            accelerate: false,
            decelerate: false,
            turnLeft: false,
            turnRight: false,
            ascend: false,
            descend: false
        };
        
        // Areas in the world
        this.areas = {
            about: null,
            projects: null,
            skills: null,
            experience: null,
            contact: null
        };
        
        // Raycaster for interactions
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Setup environment
        this.setupSpaceEnvironment();
        this.setupLights();
        this.createIslands();
        this.createSpaceship();
        this.createMCUShowcases();
        
        // Setup interaction events
        window.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        window.addEventListener('click', this.onMouseClick.bind(this), false);
    }
    
    setupSpaceEnvironment() {
        // Create a space background
        const spaceTexture = this.textureLoader.load('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80');
        this.scene.background = spaceTexture;
        
        // Create stars
        this.createStars();
        
        // Add a base platform
        this.createBasePlatform();
    }
    
    createStars() {
        const particlesGeometry = new THREE.BufferGeometry();
        const particleCount = 5000;
        
        const positionArray = new Float32Array(particleCount * 3);
        const scaleArray = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            // Position stars in a sphere around the scene
            const i3 = i * 3;
            const radius = 100 + Math.random() * 900; // Stars between 100 and 1000 units away
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positionArray[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positionArray[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positionArray[i3 + 2] = radius * Math.cos(phi);
            
            // Random star size
            scaleArray[i] = Math.random() * 2 + 0.5;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
        particlesGeometry.setAttribute('scale', new THREE.BufferAttribute(scaleArray, 1));
        
        // Create star material
        const starsMaterial = new THREE.PointsMaterial({
            size: 0.2,
            sizeAttenuation: true,
            color: 0xffffff,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending
        });
        
        // Create stars
        this.stars = new THREE.Points(particlesGeometry, starsMaterial);
        this.scene.add(this.stars);
    }
    
    createBasePlatform() {
        // Create a large platform as the base
        const geometry = new THREE.CylinderGeometry(50, 50, 1, 64);
        
        // Use a texture for the platform
        const platformTexture = this.textureLoader.load('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHw%3D&w=1000&q=80');
        platformTexture.wrapS = THREE.RepeatWrapping;
        platformTexture.wrapT = THREE.RepeatWrapping;
        platformTexture.repeat.set(10, 10);
        
        const material = new THREE.MeshStandardMaterial({
            map: platformTexture,
            roughness: 0.7,
            metalness: 0.3,
            color: 0x444466
        });
        
        const platform = new THREE.Mesh(geometry, material);
        platform.position.set(0, -0.5, 0);
        platform.receiveShadow = true;
        this.scene.add(platform);
        
        // Add grid overlay
        const gridHelper = new THREE.GridHelper(100, 100, 0x00f0ff, 0x004080);
        gridHelper.position.y = 0.01;
        this.scene.add(gridHelper);
    }
    
    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404080, 0.4);
        this.scene.add(ambientLight);
        
        // Directional light (like a sun)
        const sunLight = new THREE.DirectionalLight(0xffffcc, 1.2);
        sunLight.position.set(50, 100, 50);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 500;
        sunLight.shadow.camera.left = -100;
        sunLight.shadow.camera.right = 100;
        sunLight.shadow.camera.top = 100;
        sunLight.shadow.camera.bottom = -100;
        this.scene.add(sunLight);
        
        // Add point lights for areas
        this.addPointLight(0x00f0ff, 2, new THREE.Vector3(-30, 5, 0)); // About
        this.addPointLight(0xff0080, 2, new THREE.Vector3(0, 5, -30)); // Projects
        this.addPointLight(0x80ff00, 2, new THREE.Vector3(30, 5, 0));  // Skills
        this.addPointLight(0xffaa00, 2, new THREE.Vector3(0, 5, 30));  // Experience
        this.addPointLight(0x8800ff, 2, new THREE.Vector3(-20, 5, -20)); // Contact
    }
    
    addPointLight(color, intensity, position) {
        const light = new THREE.PointLight(color, intensity, 30);
        light.position.copy(position);
        
        // Add a small sphere to mark the light position
        const lightMarker = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 16, 16),
            new THREE.MeshBasicMaterial({ color: color })
        );
        lightMarker.position.copy(position);
        
        this.scene.add(light);
        this.scene.add(lightMarker);
    }
    
    createDataParticles() {
        const particlesGeometry = new THREE.BufferGeometry();
        const particleCount = 2000;
        
        const positionArray = new Float32Array(particleCount * 3);
        const scaleArray = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            // Position
            const i3 = i * 3;
            positionArray[i3] = (Math.random() - 0.5) * 40;
            positionArray[i3 + 1] = (Math.random() - 0.5) * 20;
            positionArray[i3 + 2] = (Math.random() - 0.5) * 40;
            
            // Scale
            scaleArray[i] = Math.random();
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
        particlesGeometry.setAttribute('scale', new THREE.BufferAttribute(scaleArray, 1));
        
        // Create material
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.1,
            sizeAttenuation: true,
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        // Create points
        this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(this.particles);
    }
    
    createCircuitBoard() {
        // Create a large flat board as the base
        const geometry = new THREE.BoxGeometry(15, 0.2, 15);
        
        // Use a texture for the circuit board
        const textureCircuit = this.textureLoader.load('https://raw.githubusercontent.com/AnanthashayanS/AnanthashayanS.github.io/main/assets/circuit_texture.jpg', () => {
            // Fallback - create a procedural texture if loading fails
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const context = canvas.getContext('2d');
            
            // Fill with dark green
            context.fillStyle = '#0a380a';
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw circuit lines
            context.strokeStyle = '#00ff00';
            context.lineWidth = 2;
            
            // Horizontal lines
            for (let i = 0; i < 20; i++) {
                const y = i * 25;
                context.beginPath();
                context.moveTo(0, y);
                context.lineTo(canvas.width, y);
                context.stroke();
            }
            
            // Vertical lines
            for (let i = 0; i < 20; i++) {
                const x = i * 25;
                context.beginPath();
                context.moveTo(x, 0);
                context.lineTo(x, canvas.height);
                context.stroke();
            }
            
            // Create a texture from the canvas
            const fallbackTexture = new THREE.CanvasTexture(canvas);
            fallbackTexture.wrapS = THREE.RepeatWrapping;
            fallbackTexture.wrapT = THREE.RepeatWrapping;
            fallbackTexture.repeat.set(5, 5);
            
            return fallbackTexture;
        });
        
        textureCircuit.wrapS = THREE.RepeatWrapping;
        textureCircuit.wrapT = THREE.RepeatWrapping;
        textureCircuit.repeat.set(5, 5);
        
        const material = new THREE.MeshStandardMaterial({
            map: textureCircuit,
            roughness: 0.8,
            metalness: 0.2,
            color: 0x1a4f1a
        });
        
        const circuitBoard = new THREE.Mesh(geometry, material);
        circuitBoard.receiveShadow = true;
        this.scene.add(circuitBoard);
    }
    
    createMicrocontrollers() {
        // Create STM32H7 microcontroller
        this.createSTM32Microcontroller(new THREE.Vector3(-3, 0.3, 0));
        
        // Create NRF5340 microcontroller
        this.createNRF5340Microcontroller(new THREE.Vector3(3, 0.3, 0));
    }
    
    createSTM32Microcontroller(position) {
        // Create a simplified STM32H7 chip
        const group = new THREE.Group();
        group.position.copy(position);
        
        // Main chip body
        const chipGeometry = new THREE.BoxGeometry(2, 0.2, 2);
        const chipMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            metalness: 0.8,
            roughness: 0.2
        });
        
        const chip = new THREE.Mesh(chipGeometry, chipMaterial);
        chip.castShadow = true;
        chip.receiveShadow = true;
        group.add(chip);
        
        // Add pins
        this.addChipPins(group, new THREE.Vector3(0, 0, 0), 2, 0.2);
        
        // Add STM32H7 text
        this.addTextToChip(group, 'STM32H7', new THREE.Vector3(0, 0.15, 0), 0x00ffff, 0.15);
        
        // Make interactive
        chip.userData = { 
            type: 'microcontroller', 
            name: 'STM32H7',
            description: 'High-performance ARM Cortex-M7 based MCU with advanced peripherals'
        };
        
        this.interactiveObjects.push(chip);
        this.scene.add(group);
    }
    
    createNRF5340Microcontroller(position) {
        // Create a simplified NRF5340 chip
        const group = new THREE.Group();
        group.position.copy(position);
        
        // Main chip body
        const chipGeometry = new THREE.BoxGeometry(1.8, 0.2, 1.8);
        const chipMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.7,
            roughness: 0.3
        });
        
        const chip = new THREE.Mesh(chipGeometry, chipMaterial);
        chip.castShadow = true;
        chip.receiveShadow = true;
        group.add(chip);
        
        // Add pins
        this.addChipPins(group, new THREE.Vector3(0, 0, 0), 1.8, 0.2);
        
        // Add NRF5340 text
        this.addTextToChip(group, 'NRF5340', new THREE.Vector3(0, 0.15, 0), 0x00ff80, 0.12);
        
        // Make interactive
        chip.userData = { 
            type: 'microcontroller', 
            name: 'NRF5340',
            description: 'Dual-core ARM Cortex-M33 wireless SoC with Bluetooth Low Energy capability'
        };
        
        this.interactiveObjects.push(chip);
        this.scene.add(group);
    }
    
    addChipPins(group, center, size, height) {
        const pinSize = 0.1;
        const pinHeight = 0.05;
        const pinMaterial = new THREE.MeshStandardMaterial({
            color: 0xdddddd,
            metalness: 1.0,
            roughness: 0.2
        });
        
        const pinGeometry = new THREE.BoxGeometry(pinSize, pinHeight, pinSize);
        
        const halfSize = size / 2;
        const pinsPerSide = Math.floor(size / (pinSize * 2));
        const spacing = size / pinsPerSide;
        
        // Bottom pins
        for (let i = 0; i < pinsPerSide; i++) {
            const x = center.x - halfSize + (i * spacing) + spacing / 2;
            const pin = new THREE.Mesh(pinGeometry, pinMaterial);
            pin.position.set(x, center.y - height / 2 - pinHeight / 2, center.z + halfSize + pinSize / 2);
            group.add(pin);
        }
        
        // Top pins
        for (let i = 0; i < pinsPerSide; i++) {
            const x = center.x - halfSize + (i * spacing) + spacing / 2;
            const pin = new THREE.Mesh(pinGeometry, pinMaterial);
            pin.position.set(x, center.y - height / 2 - pinHeight / 2, center.z - halfSize - pinSize / 2);
            group.add(pin);
        }
        
        // Left pins
        for (let i = 0; i < pinsPerSide; i++) {
            const z = center.z - halfSize + (i * spacing) + spacing / 2;
            const pin = new THREE.Mesh(pinGeometry, pinMaterial);
            pin.position.set(center.x - halfSize - pinSize / 2, center.y - height / 2 - pinHeight / 2, z);
            group.add(pin);
        }
        
        // Right pins
        for (let i = 0; i < pinsPerSide; i++) {
            const z = center.z - halfSize + (i * spacing) + spacing / 2;
            const pin = new THREE.Mesh(pinGeometry, pinMaterial);
            pin.position.set(center.x + halfSize + pinSize / 2, center.y - height / 2 - pinHeight / 2, z);
            group.add(pin);
        }
    }
    
    addTextToChip(group, text, position, color, size) {
        // Create a canvas for the text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 128;
        
        // Fill with transparent background
        context.fillStyle = 'transparent';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add text
        context.font = 'bold 64px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = this.rgbToHex(color);
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        // Create texture
        const texture = new THREE.CanvasTexture(canvas);
        
        // Create plane with text
        const textGeometry = new THREE.PlaneGeometry(size * 10, size * 5);
        const textMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.copy(position);
        textMesh.rotation.x = -Math.PI / 2;
        group.add(textMesh);
    }
    
    rgbToHex(color) {
        const r = Math.floor((color >> 16) & 255);
        const g = Math.floor((color >> 8) & 255);
        const b = Math.floor(color & 255);
        return `rgb(${r},${g},${b})`;
    }
    
    createComponents() {
        // Add resistors
        this.createResistor(new THREE.Vector3(-2, 0.3, 2), 0);
        this.createResistor(new THREE.Vector3(-1.5, 0.3, 2), 0);
        this.createResistor(new THREE.Vector3(-1, 0.3, 2), 0);
        
        // Add capacitors
        this.createCapacitor(new THREE.Vector3(1, 0.3, 2), 0);
        this.createCapacitor(new THREE.Vector3(1.5, 0.3, 2), 0);
        this.createCapacitor(new THREE.Vector3(2, 0.3, 2), 0);
        
        // Add LEDs
        this.createLED(new THREE.Vector3(-2, 0.3, -2), 0xff0000);
        this.createLED(new THREE.Vector3(-1.5, 0.3, -2), 0x00ff00);
        this.createLED(new THREE.Vector3(-1, 0.3, -2), 0x0000ff);
        
        // Add animated data lines connecting the components
        this.createDataLines();
    }
    
    createResistor(position, rotation) {
        const group = new THREE.Group();
        group.position.copy(position);
        group.rotation.y = rotation;
        
        // Create the resistor body
        const bodyGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xddaa77,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.x = Math.PI / 2;
        group.add(body);
        
        // Create resistor bands
        const colors = [0x000000, 0xbb0000, 0x00bb00, 0xbbbb00];
        
        for (let i = 0; i < 4; i++) {
            const bandGeometry = new THREE.TorusGeometry(0.1, 0.02, 16, 32);
            const bandMaterial = new THREE.MeshStandardMaterial({
                color: colors[i],
                roughness: 0.5,
                metalness: 0.5
            });
            
            const band = new THREE.Mesh(bandGeometry, bandMaterial);
            band.position.y = -0.15 + (i * 0.1);
            band.rotation.x = Math.PI / 2;
            group.add(band);
        }
        
        // Create leads
        const leadGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 8);
        const leadMaterial = new THREE.MeshStandardMaterial({
            color: 0xdddddd,
            roughness: 0.2,
            metalness: 0.8
        });
        
        const lead1 = new THREE.Mesh(leadGeometry, leadMaterial);
        lead1.position.set(0, 0, 0.35);
        lead1.rotation.x = Math.PI / 2;
        group.add(lead1);
        
        const lead2 = new THREE.Mesh(leadGeometry, leadMaterial);
        lead2.position.set(0, 0, -0.35);
        lead2.rotation.x = Math.PI / 2;
        group.add(lead2);
        
        // Make interactive
        body.userData = {
            type: 'component',
            name: 'Resistor',
            description: 'Passive component that implements electrical resistance'
        };
        
        this.interactiveObjects.push(body);
        this.scene.add(group);
    }
    
    createCapacitor(position, rotation) {
        const group = new THREE.Group();
        group.position.copy(position);
        group.rotation.y = rotation;
        
        // Create the capacitor body
        const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.3, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x3377aa,
            roughness: 0.5,
            metalness: 0.5
        });
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.x = Math.PI / 2;
        group.add(body);
        
        // Create leads
        const leadGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 8);
        const leadMaterial = new THREE.MeshStandardMaterial({
            color: 0xdddddd,
            roughness: 0.2,
            metalness: 0.8
        });
        
        const lead1 = new THREE.Mesh(leadGeometry, leadMaterial);
        lead1.position.set(0, 0, 0.3);
        lead1.rotation.x = Math.PI / 2;
        group.add(lead1);
        
        const lead2 = new THREE.Mesh(leadGeometry, leadMaterial);
        lead2.position.set(0, 0, -0.3);
        lead2.rotation.x = Math.PI / 2;
        group.add(lead2);
        
        // Add stripe to indicate polarity
        const stripeGeometry = new THREE.PlaneGeometry(0.05, 0.25);
        const stripeMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide
        });
        
        const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripe.position.set(0, 0.16, 0);
        stripe.rotation.x = Math.PI / 2;
        stripe.rotation.y = Math.PI / 2;
        group.add(stripe);
        
        // Make interactive
        body.userData = {
            type: 'component',
            name: 'Capacitor',
            description: 'Stores electrical energy in an electric field'
        };
        
        this.interactiveObjects.push(body);
        this.scene.add(group);
    }
    
    createLED(position, color) {
        const group = new THREE.Group();
        group.position.copy(position);
        
        // Create the LED body
        const bodyGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 16);
        const bodyMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xdddddd,
            roughness: 0.2,
            metalness: 0.5,
            transparent: true,
            transmission: 0.6
        });
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        group.add(body);
        
        // Create the LED light
        const lightGeometry = new THREE.SphereGeometry(0.08, 16, 16);
        const lightMaterial = new THREE.MeshBasicMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.8
        });
        
        this.ledLight = new THREE.Mesh(lightGeometry, lightMaterial);
        this.ledLight.position.y = 0.05;
        group.add(this.ledLight);
        
        // Create a point light for the LED
        const light = new THREE.PointLight(color, 0.5, 1.5);
        light.position.y = 0.1;
        group.add(light);
        
        // Make interactive
        body.userData = {
            type: 'component',
            name: 'LED',
            description: 'Light Emitting Diode that converts electricity to light'
        };
        
        this.interactiveObjects.push(body);
        this.scene.add(group);
    }
    
    createDataLines() {
        // Create animated lines between components to represent data flow
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.8
        });
        
        // Line from STM32 to LEDs
        const points1 = [];
        points1.push(new THREE.Vector3(-3, 0.3, 0));
        points1.push(new THREE.Vector3(-3, 0.5, 0));
        points1.push(new THREE.Vector3(-3, 0.5, -2));
        points1.push(new THREE.Vector3(-1.5, 0.5, -2));
        points1.push(new THREE.Vector3(-1.5, 0.3, -2));
        
        const lineGeometry1 = new THREE.BufferGeometry().setFromPoints(points1);
        const line1 = new THREE.Line(lineGeometry1, lineMaterial);
        this.scene.add(line1);
        
        // Line from NRF5340 to Capacitors
        const points2 = [];
        points2.push(new THREE.Vector3(3, 0.3, 0));
        points2.push(new THREE.Vector3(3, 0.5, 0));
        points2.push(new THREE.Vector3(3, 0.5, 2));
        points2.push(new THREE.Vector3(1.5, 0.5, 2));
        points2.push(new THREE.Vector3(1.5, 0.3, 2));
        
        const lineGeometry2 = new THREE.BufferGeometry().setFromPoints(points2);
        const line2 = new THREE.Line(lineGeometry2, lineMaterial);
        this.scene.add(line2);
        
        // Line connecting the two microcontrollers
        const points3 = [];
        points3.push(new THREE.Vector3(-3, 0.3, 0));
        points3.push(new THREE.Vector3(-3, 0.7, 0));
        points3.push(new THREE.Vector3(0, 0.7, 0));
        points3.push(new THREE.Vector3(3, 0.7, 0));
        points3.push(new THREE.Vector3(3, 0.3, 0));
        
        const lineGeometry3 = new THREE.BufferGeometry().setFromPoints(points3);
        const line3 = new THREE.Line(lineGeometry3, lineMaterial);
        this.scene.add(line3);
        
        // Create data packets that move along the lines
        this.createDataPackets();
    }
    
    createDataPackets() {
        // Create small data packet objects that move along the lines
        const packetGeometry = new THREE.BoxGeometry(0.08, 0.08, 0.08);
        
        const packetMaterial1 = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.8
        });
        
        const packetMaterial2 = new THREE.MeshBasicMaterial({
            color: 0xff00ff,
            transparent: true,
            opacity: 0.8
        });
        
        // Create packets
        this.packet1 = new THREE.Mesh(packetGeometry, packetMaterial1);
        this.packet1.position.set(-3, 0.3, 0);
        this.scene.add(this.packet1);
        
        this.packet2 = new THREE.Mesh(packetGeometry, packetMaterial2);
        this.packet2.position.set(3, 0.3, 0);
        this.scene.add(this.packet2);
        
        // Packet animation properties
        this.packet1Path = [
            new THREE.Vector3(-3, 0.3, 0),
            new THREE.Vector3(-3, 0.5, 0),
            new THREE.Vector3(-3, 0.5, -2),
            new THREE.Vector3(-1.5, 0.5, -2),
            new THREE.Vector3(-1.5, 0.3, -2)
        ];
        
        this.packet2Path = [
            new THREE.Vector3(3, 0.3, 0),
            new THREE.Vector3(3, 0.5, 0),
            new THREE.Vector3(3, 0.5, 2),
            new THREE.Vector3(1.5, 0.5, 2),
            new THREE.Vector3(1.5, 0.3, 2)
        ];
        
        this.packet1PathIndex = 0;
        this.packet2PathIndex = 0;
        this.packet1Progress = 0;
        this.packet2Progress = 0;
    }
    
    updateDataPackets() {
        // Move data packets along their paths
        const speed = 0.02;
        
        // Update packet 1
        if (this.packet1PathIndex < this.packet1Path.length - 1) {
            const current = this.packet1Path[this.packet1PathIndex];
            const next = this.packet1Path[this.packet1PathIndex + 1];
            
            this.packet1Progress += speed;
            
            if (this.packet1Progress >= 1) {
                this.packet1PathIndex++;
                this.packet1Progress = 0;
                
                if (this.packet1PathIndex >= this.packet1Path.length - 1) {
                    this.packet1PathIndex = 0;
                    this.packet1.position.copy(this.packet1Path[0]);
                }
            } else {
                // Interpolate position
                this.packet1.position.lerpVectors(current, next, this.packet1Progress);
            }
        }
        
        // Update packet 2
        if (this.packet2PathIndex < this.packet2Path.length - 1) {
            const current = this.packet2Path[this.packet2PathIndex];
            const next = this.packet2Path[this.packet2PathIndex + 1];
            
            this.packet2Progress += speed;
            
            if (this.packet2Progress >= 1) {
                this.packet2PathIndex++;
                this.packet2Progress = 0;
                
                if (this.packet2PathIndex >= this.packet2Path.length - 1) {
                    this.packet2PathIndex = 0;
                    this.packet2.position.copy(this.packet2Path[0]);
                }
            } else {
                // Interpolate position
                this.packet2.position.lerpVectors(current, next, this.packet2Progress);
            }
        }
    }
    
    onMouseMove(event) {
        // Calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    
    onMouseClick(event) {
        // Detect which object was clicked
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.interactiveObjects);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            
            if (object.userData && object.userData.type) {
                // Show info about clicked object
                const event = new CustomEvent('object-clicked', {
                    detail: {
                        name: object.userData.name,
                        description: object.userData.description
                    }
                });
                
                window.dispatchEvent(event);
                
                // If spaceship was clicked, enter it
                if (object.userData.type === 'spaceship') {
                    this.toggleSpaceshipMode();
                }
                
                // If area was clicked, navigate camera to it
                if (object.userData.type === 'area') {
                    this.navigateToArea(object.userData.areaKey);
                }
            }
        }
    }
    
    toggleSpaceshipMode() {
        this.inSpaceship = !this.inSpaceship;
        
        // Emit event for UI to update
        const event = new CustomEvent('spaceship-mode-change', {
            detail: {
                active: this.inSpaceship
            }
        });
        window.dispatchEvent(event);
        
        if (this.inSpaceship) {
            // Show spaceship controls info
            const infoEvent = new CustomEvent('object-clicked', {
                detail: {
                    name: 'Spaceship Controls',
                    description: 'WASD to move, Space to ascend, Shift to descend. Click on areas to navigate to them.'
                }
            });
            window.dispatchEvent(infoEvent);
        }
    }
    
    navigateToArea(areaKey) {
        if (!this.areas[areaKey]) return;
        
        const areaPosition = this.areas[areaKey].position.clone();
        
        // Position the camera near the area
        this.camera.position.set(
            areaPosition.x,
            areaPosition.y + 3,
            areaPosition.z - 5
        );
        
        // Look at the area
        this.camera.lookAt(areaPosition);
        
        // Trigger UI to show the corresponding panel
        const event = new CustomEvent('navigate-to-section', {
            detail: { section: areaKey }
        });
        window.dispatchEvent(event);
    }
    
    update(camera) {
        // Update animated elements
        this.updateAnimations();
        
        // Update spaceship if in spaceship mode
        if (this.inSpaceship && this.spaceship) {
            this.updateSpaceship();
        }
        
        // Check for object interactions using raycaster
        this.raycaster.setFromCamera(this.mouse, camera);
        const intersects = this.raycaster.intersectObjects(this.interactiveObjects);
        
        if (intersects.length > 0) {
            if (this.INTERSECTED != intersects[0].object) {
                if (this.INTERSECTED) {
                    this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex);
                }
                
                this.INTERSECTED = intersects[0].object;
                this.INTERSECTED.currentHex = this.INTERSECTED.material.emissive.getHex();
                this.INTERSECTED.material.emissive.setHex(0x006699);
                
                document.body.style.cursor = 'pointer';
            }
        } else {
            if (this.INTERSECTED) {
                this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex);
                this.INTERSECTED = null;
                
                document.body.style.cursor = 'auto';
            }
        }
    }
    
    updateAnimations() {
        // Update stars rotation
        if (this.stars) {
            this.stars.rotation.y += 0.0001;
        }
        
        // Update all objects with animation properties
        this.scene.traverse((object) => {
            // Update floating objects (skill orbs)
            if (object.userData.floatSpeed) {
                const time = performance.now() * 0.001;
                object.position.y = object.userData.initialY + Math.sin(time * object.userData.floatSpeed * 5 + object.userData.floatOffset) * object.userData.floatRange;
            }
            
            // Update rotating platforms
            if (object.userData.rotationSpeed) {
                object.rotation.y += object.userData.rotationSpeed;
            }
            
            // Update holographic signs
            if (object.userData.pulsePhase !== undefined) {
                const time = performance.now() * 0.001;
                const scale = 1 + Math.sin(time * 2 + object.userData.pulsePhase) * 0.05;
                object.scale.set(
                    object.userData.originalScale.x * scale,
                    object.userData.originalScale.y * scale,
                    object.userData.originalScale.z * scale
                );
            }
        });
    }
    
    updateSpaceship() {
        // Placeholder for spaceship controls
        // Would implement spaceship controls here
    }
    
    createIslands() {
        // Create islands for each section
        this.createIsland(-30, 0, 'About Me', 0x00f0ff, 'about');
        this.createIsland(0, -30, 'Projects', 0xff0080, 'projects');
        this.createIsland(30, 0, 'Skills', 0x80ff00, 'skills');
        this.createIsland(0, 30, 'Experience', 0xffaa00, 'experience');
        this.createIsland(-20, -20, 'Contact', 0x8800ff, 'contact');
    }
    
    createIsland(x, z, name, color, areaKey) {
        // Create island platform
        const geometry = new THREE.CylinderGeometry(8, 10, 2, 32);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.6,
            metalness: 0.4,
            emissive: color,
            emissiveIntensity: 0.2
        });
        
        const island = new THREE.Mesh(geometry, material);
        island.position.set(x, 0, z);
        island.receiveShadow = true;
        island.castShadow = true;
        
        // Create holographic sign
        this.createHolographicSign(x, 6, z, name, color);
        
        // Store reference to this area
        this.areas[areaKey] = island;
        
        // Make interactive
        island.userData = {
            type: 'area',
            name: name,
            areaKey: areaKey
        };
        
        this.interactiveObjects.push(island);
        this.scene.add(island);
        
        // Add detail objects based on area type
        switch(areaKey) {
            case 'about':
                this.createAboutArea(x, z);
                break;
            case 'projects':
                this.createProjectsArea(x, z);
                break;
            case 'skills':
                this.createSkillsArea(x, z);
                break;
            case 'experience':
                this.createExperienceArea(x, z);
                break;
            case 'contact':
                this.createContactArea(x, z);
                break;
        }
    }
    
    createHolographicSign(x, y, z, text, color) {
        // Create a canvas for the text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;
        
        // Fill with transparent background
        context.fillStyle = 'transparent';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add text with glow effect
        context.shadowColor = this.rgbToHex(color);
        context.shadowBlur = 15;
        context.font = 'bold 64px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = '#ffffff';
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        // Create texture
        const texture = new THREE.CanvasTexture(canvas);
        
        // Create holographic sign
        const signGeometry = new THREE.PlaneGeometry(10, 2.5);
        const signMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
        
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.set(x, y, z);
        sign.lookAt(0, y, 0); // Always face the center
        
        this.scene.add(sign);
        
        // Add a pulsing animation
        this.animateHolographicSign(sign);
    }
    
    animateHolographicSign(sign) {
        // Store the original scale
        sign.userData.originalScale = new THREE.Vector3().copy(sign.scale);
        sign.userData.pulsePhase = Math.random() * Math.PI * 2; // Random starting phase
        
        // Animation will be handled in the update loop
    }
    
    createSpaceship() {
        // Create a simple spaceship model
        const group = new THREE.Group();
        
        // Main body
        const bodyGeometry = new THREE.ConeGeometry(2, 6, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x333344,
            metalness: 0.8,
            roughness: 0.2,
            emissive: 0x0033ff,
            emissiveIntensity: 0.2
        });
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.x = Math.PI / 2;
        body.position.y = 2;
        group.add(body);
        
        // Cockpit
        const cockpitGeometry = new THREE.SphereGeometry(1.2, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
        const cockpitMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x8888ff,
            metalness: 0.1,
            roughness: 0,
            transmission: 0.9,
            transparent: true
        });
        
        const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
        cockpit.position.y = 2.5;
        cockpit.rotation.x = Math.PI;
        group.add(cockpit);
        
        // Wings
        const wingGeometry = new THREE.BoxGeometry(6, 0.2, 2);
        const wingMaterial = new THREE.MeshStandardMaterial({
            color: 0x333344,
            metalness: 0.8,
            roughness: 0.2
        });
        
        const wings = new THREE.Mesh(wingGeometry, wingMaterial);
        wings.position.y = 1;
        group.add(wings);
        
        // Engines
        this.createEngine(group, -2.5, 1, 0);
        this.createEngine(group, 2.5, 1, 0);
        
        // Position spaceship
        group.position.set(0, 1, 10);
        group.rotation.y = Math.PI;
        
        // Make interactive
        body.userData = {
            type: 'spaceship',
            name: 'Exploration Craft',
            description: 'Use this craft to navigate between areas'
        };
        
        this.interactiveObjects.push(body);
        this.spaceship = group;
        this.scene.add(group);
    }
    
    createEngine(group, x, y, z) {
        const engineGeometry = new THREE.CylinderGeometry(0.5, 0.8, 1.5, 16);
        const engineMaterial = new THREE.MeshStandardMaterial({
            color: 0x444444,
            metalness: 0.9,
            roughness: 0.1
        });
        
        const engine = new THREE.Mesh(engineGeometry, engineMaterial);
        engine.position.set(x, y, z);
        engine.rotation.x = Math.PI / 2;
        group.add(engine);
        
        // Engine glow
        const glowGeometry = new THREE.ConeGeometry(0.8, 2, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });
        
        this.engineGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.engineGlow.position.set(x, y, z + 1.5);
        this.engineGlow.rotation.x = Math.PI / 2;
        this.engineGlow.visible = false; // Only visible when moving
        group.add(this.engineGlow);
    }
    
    createMCUShowcases() {
        // Create realistic STM32 MCU model
        this.createSTM32Showcase(new THREE.Vector3(15, 2, -15));
        
        // Create realistic nRF5 MCU model
        this.createNRF5Showcase(new THREE.Vector3(-15, 2, 15));
    }
    
    createSTM32Showcase(position) {
        const group = new THREE.Group();
        group.position.copy(position);
        
        // Create platform
        const platformGeometry = new THREE.CylinderGeometry(5, 5, 0.5, 32);
        const platformMaterial = new THREE.MeshStandardMaterial({
            color: 0x006699,
            metalness: 0.7,
            roughness: 0.3,
            emissive: 0x006699,
            emissiveIntensity: 0.2
        });
        
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.y = -0.25;
        group.add(platform);
        
        // Create realistic STM32H7 chip
        const mcuGeometry = new THREE.BoxGeometry(3, 0.2, 3);
        const mcuMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            metalness: 0.9,
            roughness: 0.1
        });
        
        const mcu = new THREE.Mesh(mcuGeometry, mcuMaterial);
        mcu.receiveShadow = true;
        mcu.castShadow = true;
        group.add(mcu);
        
        // Add detailed pins
        this.addRealisticChipPins(group, new THREE.Vector3(0, 0, 0), 3, 0.2);
        
        // Add STM32H7 label with precise text
        this.addDetailedTextToChip(group, 'STM32H745', new THREE.Vector3(0, 0.12, 0), 0x00ccff, 0.15);
        
        // Add a holographic display showcasing STM32 information
        this.createHolographicDisplay(
            group, 
            new THREE.Vector3(0, 3, 0), 
            [
                "STM32H7 Series",
                "ARM Cortex-M7 400MHz",
                "Dual-core performance",
                "2MB Flash / 1MB RAM",
                "Hardware acceleration",
                "Advanced peripherals"
            ],
            0x00ccff
        );
        
        // Add a rotating animation
        platform.userData.rotationSpeed = 0.005;
        mcu.userData.isSTM32 = true;
        
        // Make interactive
        mcu.userData = {
            type: 'microcontroller',
            name: 'STM32H7 Series',
            description: 'High-performance ARM Cortex-M7 based MCU with advanced peripherals'
        };
        
        this.interactiveObjects.push(mcu);
        this.scene.add(group);
    }
    
    createNRF5Showcase(position) {
        const group = new THREE.Group();
        group.position.copy(position);
        
        // Create platform
        const platformGeometry = new THREE.CylinderGeometry(5, 5, 0.5, 32);
        const platformMaterial = new THREE.MeshStandardMaterial({
            color: 0x009966,
            metalness: 0.7,
            roughness: 0.3,
            emissive: 0x009966,
            emissiveIntensity: 0.2
        });
        
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.y = -0.25;
        group.add(platform);
        
        // Create realistic nRF5 chip
        const mcuGeometry = new THREE.BoxGeometry(2.8, 0.2, 2.8);
        const mcuMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.9,
            roughness: 0.1
        });
        
        const mcu = new THREE.Mesh(mcuGeometry, mcuMaterial);
        mcu.receiveShadow = true;
        mcu.castShadow = true;
        group.add(mcu);
        
        // Add detailed pins
        this.addRealisticChipPins(group, new THREE.Vector3(0, 0, 0), 2.8, 0.2);
        
        // Add nRF5 label with precise text
        this.addDetailedTextToChip(group, 'nRF5340', new THREE.Vector3(0, 0.12, 0), 0x00ff99, 0.15);
        
        // Add a holographic display showcasing nRF5 information
        this.createHolographicDisplay(
            group, 
            new THREE.Vector3(0, 3, 0), 
            [
                "nRF5 Series",
                "ARM Cortex-M33 dual-core",
                "Bluetooth 5.2 / BLE",
                "Mesh networking",
                "Ultra-low power",
                "Embedded security"
            ],
            0x00ff99
        );
        
        // Add a rotating animation
        platform.userData.rotationSpeed = 0.005;
        mcu.userData.isNRF5 = true;
        
        // Make interactive
        mcu.userData = {
            type: 'microcontroller',
            name: 'nRF5340',
            description: 'Dual-core ARM Cortex-M33 SoC with Bluetooth Low Energy capability'
        };
        
        this.interactiveObjects.push(mcu);
        this.scene.add(group);
    }
    
    addRealisticChipPins(group, center, size, height) {
        const pinSize = 0.07;
        const pinHeight = 0.05;
        const pinMaterial = new THREE.MeshStandardMaterial({
            color: 0xdddddd,
            metalness: 1.0,
            roughness: 0.2
        });
        
        const pinGeometry = new THREE.BoxGeometry(pinSize, pinHeight, pinSize);
        
        const halfSize = size / 2;
        const pinsPerSide = 14; // Realistic pin count
        const spacing = size / pinsPerSide;
        
        // Bottom pins
        for (let i = 0; i < pinsPerSide; i++) {
            const x = center.x - halfSize + (i * spacing) + spacing / 2;
            const pin = new THREE.Mesh(pinGeometry, pinMaterial);
            pin.position.set(x, center.y - height / 2 - pinHeight / 2, center.z + halfSize + pinSize / 2);
            group.add(pin);
        }
        
        // Top pins
        for (let i = 0; i < pinsPerSide; i++) {
            const x = center.x - halfSize + (i * spacing) + spacing / 2;
            const pin = new THREE.Mesh(pinGeometry, pinMaterial);
            pin.position.set(x, center.y - height / 2 - pinHeight / 2, center.z - halfSize - pinSize / 2);
            group.add(pin);
        }
        
        // Left pins
        for (let i = 0; i < pinsPerSide; i++) {
            const z = center.z - halfSize + (i * spacing) + spacing / 2;
            const pin = new THREE.Mesh(pinGeometry, pinMaterial);
            pin.position.set(center.x - halfSize - pinSize / 2, center.y - height / 2 - pinHeight / 2, z);
            group.add(pin);
        }
        
        // Right pins
        for (let i = 0; i < pinsPerSide; i++) {
            const z = center.z - halfSize + (i * spacing) + spacing / 2;
            const pin = new THREE.Mesh(pinGeometry, pinMaterial);
            pin.position.set(center.x + halfSize + pinSize / 2, center.y - height / 2 - pinHeight / 2, z);
            group.add(pin);
        }
    }
    
    addDetailedTextToChip(group, text, position, color, size) {
        // Create a canvas for the text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 256;
        
        // Fill with transparent background
        context.fillStyle = 'transparent';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add main text
        context.font = 'bold 64px "Arial Narrow"';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = this.rgbToHex(color);
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        // Add manufacturer logo
        context.font = 'bold 30px Arial';
        context.fillText('©️ Embedded Engineer', canvas.width / 2, canvas.height / 2 + 50);
        
        // Create texture
        const texture = new THREE.CanvasTexture(canvas);
        
        // Create plane with text
        const textGeometry = new THREE.PlaneGeometry(size * 15, size * 7.5);
        const textMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.copy(position);
        textMesh.rotation.x = -Math.PI / 2;
        group.add(textMesh);
    }
    
    createHolographicDisplay(group, position, textLines, color) {
        // Create a glowing holographic frame
        const frameGeometry = new THREE.BoxGeometry(6, 4, 0.1);
        const frameMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.copy(position);
        group.add(frame);
        
        // Create a canvas for the text content
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 384;
        
        // Fill with semi-transparent background
        context.fillStyle = 'rgba(0, 30, 60, 0.7)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add grid lines
        context.strokeStyle = this.rgbToHex(color);
        context.lineWidth = 1;
        context.globalAlpha = 0.3;
        
        // Horizontal lines
        for (let i = 0; i < 10; i++) {
            const y = i * (canvas.height / 10);
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(canvas.width, y);
            context.stroke();
        }
        
        // Vertical lines
        for (let i = 0; i < 10; i++) {
            const x = i * (canvas.width / 10);
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, canvas.height);
            context.stroke();
        }
        
        // Add text content
        context.globalAlpha = 1.0;
        context.font = '26px "Courier New", monospace';
        context.fillStyle = this.rgbToHex(color);
        context.textAlign = 'left';
        context.textBaseline = 'top';
        
        textLines.forEach((line, index) => {
            context.fillText(line, 20, 30 + (index * 50));
        });
        
        // Create display texture
        const texture = new THREE.CanvasTexture(canvas);
        
        // Create display panel
        const displayGeometry = new THREE.PlaneGeometry(5.8, 3.8);
        const displayMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        
        const display = new THREE.Mesh(displayGeometry, displayMaterial);
        display.position.copy(position);
        display.position.z += 0.1;
        group.add(display);
        
        return display;
    }
    
    createAboutArea(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 1, z);
        
        // Create a holographic "about me" display
        this.createHolographicDisplay(
            group,
            new THREE.Vector3(0, 3, 0),
            [
                "ABOUT ME",
                "",
                "Embedded Systems Engineer",
                "Specializing in STM32 & nRF5",
                "Hardware/Firmware Expert",
                "IoT and BLE Solutions",
                "10+ years experience"
            ],
            0x00f0ff
        );
        
        // Create a stylized avatar or model representing you
        this.createAvatar(group);
        
        this.scene.add(group);
    }
    
    createProjectsArea(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 1, z);
        
        // Project displays positioned in a circle
        const radius = 5;
        const projectData = [
            { title: "Wireless Sensor Network", desc: "Industrial monitoring system" },
            { title: "Smart IoT Gateway", desc: "BLE to cloud connectivity" },
            { title: "Medical Device", desc: "FDA-compliant wearable" },
            { title: "Motor Controller", desc: "Precision robotic control" }
        ];
        
        projectData.forEach((project, index) => {
            const angle = (index / projectData.length) * Math.PI * 2;
            const px = Math.sin(angle) * radius;
            const pz = Math.cos(angle) * radius;
            
            this.createProjectDisplay(group, px, 1.5, pz, project.title, project.desc);
        });
        
        this.scene.add(group);
    }
    
    createSkillsArea(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 1, z);
        
        // Create floating skill orbs
        const skills = [
            { name: "C/C++", level: 0.9, color: 0x00ccff },
            { name: "ARM Cortex-M", level: 0.85, color: 0xff3300 },
            { name: "PCB Design", level: 0.8, color: 0x00ff99 },
            { name: "BLE", level: 0.9, color: 0x0066ff },
            { name: "RTOS", level: 0.8, color: 0xffcc00 },
            { name: "IoT Protocols", level: 0.75, color: 0x9900ff }
        ];
        
        skills.forEach((skill, index) => {
            this.createSkillOrb(group, skill, index, skills.length);
        });
        
        this.scene.add(group);
    }
    
    createExperienceArea(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 1, z);
        
        // Create a timeline visualization
        this.createTimeline(group);
        
        this.scene.add(group);
    }
    
    createContactArea(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 1, z);
        
        // Create holographic contact methods
        this.createHolographicDisplay(
            group,
            new THREE.Vector3(0, 3, 0),
            [
                "CONTACT",
                "",
                "Email: contact@example.com",
                "GitHub: github.com/yourusername",
                "LinkedIn: linkedin.com/in/yourusername",
                "",
                "Get in touch for embedded projects!"
            ],
            0x8800ff
        );
        
        // Create contact-related decorations
        this.createContactDecorations(group);
        
        this.scene.add(group);
    }
    
    createAvatar(group) {
        // Create a stylized human figure
        const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x0066aa,
            metalness: 0.3,
            roughness: 0.7
        });
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1;
        group.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.4, 32, 32);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0xffcc99,
            metalness: 0.1,
            roughness: 0.8
        });
        
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.2;
        group.add(head);
        
        // Arms
        this.createLimb(group, 0.8, 1.2, 0, 0.2, 0.2, 0.7, 0x0066aa);
        this.createLimb(group, -0.8, 1.2, 0, 0.2, 0.2, 0.7, 0x0066aa);
        
        // Added holographic glow effect around avatar
        const glowGeometry = new THREE.SphereGeometry(1.5, 32, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = 1;
        group.add(glow);
    }
    
    createLimb(group, x, y, z, width, depth, height, color) {
        const limbGeometry = new THREE.BoxGeometry(width, height, depth);
        const limbMaterial = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.3,
            roughness: 0.7
        });
        
        const limb = new THREE.Mesh(limbGeometry, limbMaterial);
        limb.position.set(x, y, z);
        group.add(limb);
    }
    
    createProjectDisplay(group, x, y, z, title, description) {
        // Create a model representing the project
        const displayGeometry = new THREE.BoxGeometry(1.8, 1.8, 0.2);
        const displayMaterial = new THREE.MeshStandardMaterial({
            color: 0xff0080,
            metalness: 0.5,
            roughness: 0.5,
            emissive: 0xff0080,
            emissiveIntensity: 0.2
        });
        
        const display = new THREE.Mesh(displayGeometry, displayMaterial);
        display.position.set(x, y, z);
        // Make the display face the center
        display.lookAt(group.position);
        group.add(display);
        
        // Create a text label for the project
        this.createFloatingText(group, new THREE.Vector3(x, y, z).add(new THREE.Vector3(0, 1.2, 0)), title, 0xff0080, 0.3);
        
        // Add a small description below
        this.createFloatingText(group, new THREE.Vector3(x, y, z).add(new THREE.Vector3(0, 0.8, 0)), description, 0xffffff, 0.18);
    }
    
    createFloatingText(group, position, text, color, size) {
        // Create a canvas for the text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;
        
        // Fill with transparent background
        context.fillStyle = 'transparent';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add text
        context.font = 'bold 64px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = this.rgbToHex(color);
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        // Create texture
        const texture = new THREE.CanvasTexture(canvas);
        
        // Create text plane
        const textGeometry = new THREE.PlaneGeometry(size * 10, size * 2.5);
        const textMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            depthWrite: false
        });
        
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.copy(position);
        // Make text face the same direction as parent
        if (group.position.x !== 0 || group.position.z !== 0) {
            textMesh.lookAt(new THREE.Vector3(0, position.y, 0));
        }
        
        group.add(textMesh);
        return textMesh;
    }
    
    createSkillOrb(group, skill, index, total) {
        // Position the orbs in a circle
        const radius = 4;
        const angle = (index / total) * Math.PI * 2;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        
        // Size based on skill level
        const size = 0.3 + skill.level * 0.5;
        
        // Create orb
        const orbGeometry = new THREE.SphereGeometry(size, 32, 32);
        const orbMaterial = new THREE.MeshStandardMaterial({
            color: skill.color,
            metalness: 0.5,
            roughness: 0.2,
            emissive: skill.color,
            emissiveIntensity: 0.3
        });
        
        const orb = new THREE.Mesh(orbGeometry, orbMaterial);
        orb.position.set(x, 2 + Math.random() * 2, z); // Random height variation
        group.add(orb);
        
        // Create a skill name label
        this.createFloatingText(group, new THREE.Vector3(x, orb.position.y + size + 0.3, z), skill.name, skill.color, 0.25);
        
        // Add glow effect
        const glowGeometry = new THREE.SphereGeometry(size * 1.3, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: skill.color,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(orb.position);
        group.add(glow);
        
        // Animation properties
        orb.userData.floatSpeed = 0.002 + Math.random() * 0.001;
        orb.userData.floatRange = 0.2 + Math.random() * 0.3;
        orb.userData.initialY = orb.position.y;
        orb.userData.floatOffset = Math.random() * Math.PI * 2;
        
        return orb;
    }
    
    createTimeline(group) {
        // Create a timeline bar
        const timelineGeometry = new THREE.BoxGeometry(10, 0.1, 0.1);
        const timelineMaterial = new THREE.MeshBasicMaterial({
            color: 0xffaa00
        });
        
        const timeline = new THREE.Mesh(timelineGeometry, timelineMaterial);
        timeline.position.y = 2;
        group.add(timeline);
        
        // Add experience markers
        const experiences = [
            { year: "2018", title: "Senior Embedded Engineer", company: "Tech Innovations" },
            { year: "2016", title: "Firmware Developer", company: "IoT Solutions Inc." },
            { year: "2014", title: "Hardware Engineer", company: "Embedded Systems LLC" }
        ];
        
        experiences.forEach((exp, index) => {
            const x = -4 + (index * 4);
            this.createExperienceMarker(group, x, 2, 0, exp);
        });
    }
    
    createExperienceMarker(group, x, y, z, experience) {
        // Create marker node
        const markerGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const markerMaterial = new THREE.MeshBasicMaterial({
            color: 0xffaa00
        });
        
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.set(x, y, z);
        group.add(marker);
        
        // Add year label
        this.createFloatingText(group, new THREE.Vector3(x, y + 0.5, z), experience.year, 0xffaa00, 0.3);
        
        // Add title label
        this.createFloatingText(group, new THREE.Vector3(x, y + 1.0, z), experience.title, 0xffffff, 0.25);
        
        // Add company label
        this.createFloatingText(group, new THREE.Vector3(x, y + 1.5, z), experience.company, 0xdddddd, 0.2);
    }
    
    createContactDecorations(group) {
        // Create some decorative elements for the contact area
        // Email symbol
        this.createIcon(group, -2, 2, 0, '✉', 0x8800ff);
        
        // GitHub symbol
        this.createIcon(group, 0, 2, 0, '🔗', 0x8800ff);
        
        // LinkedIn symbol
        this.createIcon(group, 2, 2, 0, '👥', 0x8800ff);
    }
    
    createIcon(group, x, y, z, symbol, color) {
        // Create a canvas for the symbol
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 128;
        canvas.height = 128;
        
        // Fill with transparent background
        context.fillStyle = 'transparent';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add symbol
        context.font = 'bold 90px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = this.rgbToHex(color);
        context.fillText(symbol, canvas.width / 2, canvas.height / 2);
        
        // Create texture
        const texture = new THREE.CanvasTexture(canvas);
        
        // Create icon plane
        const iconGeometry = new THREE.PlaneGeometry(1, 1);
        const iconMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        const icon = new THREE.Mesh(iconGeometry, iconMaterial);
        icon.position.set(x, y, z);
        
        // Make icon face upward
        icon.rotation.x = -Math.PI / 2;
        
        group.add(icon);
        
        // Add a subtle pulsing animation
        icon.userData.pulseSpeed = 0.003;
        icon.userData.pulseMin = 0.9;
        icon.userData.pulseMax = 1.1;
        
        return icon;
    }
} 