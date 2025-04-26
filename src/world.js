import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/DRACOLoader.js';

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
        
        // Raycaster for interactions
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Setup environment
        this.setupEnvironment();
        this.setupLights();
        this.createCircuitBoard();
        this.createMicrocontrollers();
        this.createComponents();
        
        // Setup interaction events
        window.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        window.addEventListener('click', this.onMouseClick.bind(this), false);
    }
    
    setupEnvironment() {
        // Set background
        this.scene.background = new THREE.Color(0x0a0a12);
        
        // Add fog for depth
        this.scene.fog = new THREE.FogExp2(0x0a0a12, 0.035);
        
        // Add grid floor
        const gridHelper = new THREE.GridHelper(50, 50, 0x00f0ff, 0x004080);
        gridHelper.position.y = -0.5;
        this.scene.add(gridHelper);
        
        // Create floating particles (representing data)
        this.createDataParticles();
    }
    
    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404080, 0.2);
        this.scene.add(ambientLight);
        
        // Directional light (like sunlight)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 25;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        this.scene.add(directionalLight);
        
        // Add point lights for circuit board
        this.addPointLight(0x00f0ff, 0.8, new THREE.Vector3(-3, 1.5, 2));
        this.addPointLight(0xff0080, 0.6, new THREE.Vector3(3, 1.5, -2));
        this.addPointLight(0x0080ff, 0.7, new THREE.Vector3(0, 1, -4));
    }
    
    addPointLight(color, intensity, position) {
        const light = new THREE.PointLight(color, intensity, 10);
        light.position.copy(position);
        
        // Add a small sphere to show light position
        const lightSphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 16, 16),
            new THREE.MeshBasicMaterial({ color: color })
        );
        lightSphere.position.copy(position);
        
        this.scene.add(light);
        this.scene.add(lightSphere);
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
            }
        }
    }
    
    update() {
        // Update data particles rotation
        if (this.particles) {
            this.particles.rotation.y += 0.0003;
        }
        
        // Update data packets
        this.updateDataPackets();
        
        // Check for object interactions using raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);
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
} 