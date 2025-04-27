// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize terminal typing effects
    initTerminalEffects();
    
    // Initialize custom cursor
    initCustomCursor();
    
    // Initialize scroll animations
    initScrollAnimations();
    
    // Initialize skill progress bars
    initSkillBars();
    
    // Initialize PCB component interactions
    initPCBComponents();
    
    // Initialize glitch effects
    initGlitchEffects();
    
    // Initialize microcontroller terminal modals
    initMCUTerminals();
    
    // Initialize matrix background effect
    initMatrixEffect();
    
    // Initialize peripheral tabs
    initPeripheralTabs();
});

/**
 * Initialize the custom cursor that follows mouse movement
 */
function initCustomCursor() {
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    });
    
    // Change cursor appearance when hovering over interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .pcb-component, .skill-item, .project-card');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            playRandomSound(['click', 'beep', 'scan']);
        });
        
        element.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
        });
    });
    
    // Hide cursor when leaving the window
    document.addEventListener('mouseout', (e) => {
        if (e.relatedTarget === null) {
            cursor.style.opacity = '0';
        }
    });
    
    document.addEventListener('mouseover', () => {
        cursor.style.opacity = '1';
    });
}

/**
 * Initialize terminal-like typing effects
 */
function initTerminalEffects() {
    // Type writing effect for command texts
    const commandTexts = document.querySelectorAll('.command-text');
    
    commandTexts.forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        
        let i = 0;
        const typeSpeed = Math.random() * (100 - 50) + 50;
        
        function typeWriter() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, typeSpeed / text.length);
            }
        }
        
        typeWriter();
    });
    
    // Terminal glitch effect on hover
    const outputs = document.querySelectorAll('.skill-command-output');
    outputs.forEach(output => {
        output.addEventListener('mouseenter', () => {
            glitchEffect(output);
            playRandomSound(['glitch', 'data', 'scan']);
        });
    });
}

/**
 * Creates a glitch effect on the given element
 * @param {HTMLElement} element - Element to apply glitch effect
 */
function glitchEffect(element) {
    const glitchClasses = ['glitch-1', 'glitch-2', 'glitch-3'];
    const text = element.textContent;
    
    // Create glitch instances on intervals
    const interval = setInterval(() => {
        // Add random glitch class
        const randomClass = glitchClasses[Math.floor(Math.random() * glitchClasses.length)];
        element.classList.add(randomClass);
        
        // Small chance to scramble text
        if (Math.random() < 0.3) {
            const scrambledText = text.split('').map(char => {
                return Math.random() < 0.3 ? String.fromCharCode(Math.floor(Math.random() * 93) + 33) : char;
            }).join('');
            
            element.textContent = scrambledText;
            
            // Reset text after a brief moment
            setTimeout(() => {
                element.textContent = text;
            }, 50);
        }
        
        // Remove the class after a random time
        setTimeout(() => {
            element.classList.remove(randomClass);
        }, Math.random() * 200);
    }, 100);
    
    // Stop the effect after 1 second
    setTimeout(() => {
        clearInterval(interval);
    }, 1000);
}

/**
 * Initialize scroll reveal animations
 */
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // Play reveal sound for significant sections
                if (entry.target.tagName === 'SECTION' || entry.target.classList.contains('pcb-component')) {
                    playRandomSound(['reveal', 'interface']);
                }
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.reveal').forEach(element => {
        observer.observe(element);
    });
    
    // Also observe sections for entrance animations
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

/**
 * Initialize skill bar animations
 */
function initSkillBars() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fill = entry.target;
                const value = fill.getAttribute('data-value');
                fill.style.transform = `scaleX(${value / 100})`;
                
                // Add visual data loading effect
                for (let i = 0; i <= 10; i++) {
                    setTimeout(() => {
                        fill.style.transform = `scaleX(${(value / 100) * (i / 10)})`;
                    }, i * 50);
                }
                
                // Play a sound when the bar is fully loaded
                setTimeout(() => {
                    playRandomSound(['complete', 'success']);
                }, 500);
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.skill-progress-fill').forEach(element => {
        observer.observe(element);
    });
}

/**
 * Initialize PCB component interactive effects
 */
function initPCBComponents() {
    const componentsContainer = document.querySelector('.components-container');
    
    if (!componentsContainer) {
        console.warn('PCB Components container not found');
        return;
    }

    // Create component traces (connecting lines)
    createTraces();
    
    // Add hover effect to components
    const components = document.querySelectorAll('.component');
    components.forEach(component => {
        component.addEventListener('mouseenter', () => {
            component.classList.add('active');
            const relatedTraces = document.querySelectorAll(`.trace[data-connected*="${component.id}"]`);
            relatedTraces.forEach(trace => trace.classList.add('active'));
        });
        
        component.addEventListener('mouseleave', () => {
            component.classList.remove('active');
            const relatedTraces = document.querySelectorAll(`.trace[data-connected*="${component.id}"]`);
            relatedTraces.forEach(trace => trace.classList.remove('active'));
        });
        
        // Remove click event listener for microcontroller components
        // We're removing the click functionality as requested
    });
}

/**
 * Create PCB trace elements in the PCB section
 */
function createPCBTraces() {
    const pcbSection = document.querySelector('.microcontrollers-section');
    if (!pcbSection) return;
    
    const tracesContainer = document.createElement('div');
    tracesContainer.classList.add('pcb-traces');
    
    // Create horizontal traces
    const horizontalTraces = [
        { class: 'trace-h-1', width: '30%', top: '20%', left: '10%' },
        { class: 'trace-h-2', width: '40%', top: '50%', right: '10%' },
        { class: 'trace-h-3', width: '60%', bottom: '30%', left: '20%' }
    ];
    
    horizontalTraces.forEach(trace => {
        const traceEl = document.createElement('div');
        traceEl.classList.add('pcb-trace', trace.class);
        Object.entries(trace).forEach(([key, value]) => {
            if (key !== 'class') traceEl.style[key] = value;
        });
        tracesContainer.appendChild(traceEl);
    });
    
    // Create vertical traces
    const verticalTraces = [
        { class: 'trace-v-1', height: '40%', top: '10%', left: '30%' },
        { class: 'trace-v-2', height: '30%', bottom: '20%', right: '40%' },
        { class: 'trace-v-3', height: '50%', top: '25%', right: '25%' }
    ];
    
    verticalTraces.forEach(trace => {
        const traceEl = document.createElement('div');
        traceEl.classList.add('pcb-trace', trace.class);
        Object.entries(trace).forEach(([key, value]) => {
            if (key !== 'class') traceEl.style[key] = value;
        });
        tracesContainer.appendChild(traceEl);
    });
    
    pcbSection.appendChild(tracesContainer);
}

/**
 * Add pins to PCB component
 * @param {HTMLElement} component - The PCB component element
 */
function addComponentPins(component) {
    const pinsContainer = document.createElement('div');
    pinsContainer.classList.add('pcb-component-pins');
    
    // Random number of pins between 8 and 16
    const numPins = Math.floor(Math.random() * 9) + 8;
    
    for (let i = 0; i < numPins; i++) {
        const pin = document.createElement('div');
        pin.classList.add('pcb-pin');
        pinsContainer.appendChild(pin);
    }
    
    component.appendChild(pinsContainer);
}

/**
 * Highlight traces connected to a PCB component
 * @param {HTMLElement} component - The PCB component element
 */
function highlightConnectedTraces(component) {
    // Reset all traces
    document.querySelectorAll('.pcb-trace').forEach(trace => {
        trace.style.boxShadow = '';
        trace.style.backgroundColor = '';
    });
    
    // Get random traces to highlight
    const traces = document.querySelectorAll('.pcb-trace');
    const numTracesToHighlight = Math.min(3, traces.length);
    
    for (let i = 0; i < numTracesToHighlight; i++) {
        const randomIndex = Math.floor(Math.random() * traces.length);
        const trace = traces[randomIndex];
        
        trace.style.backgroundColor = 'var(--primary)';
        trace.style.boxShadow = '0 0 15px var(--primary)';
    }
}

/**
 * Show detailed information about a PCB component in a terminal-like popup
 * @param {HTMLElement} component - The PCB component element
 */
function showComponentDetails(component) {
    // Get component type from data attribute
    const componentType = component.getAttribute('data-component');
    
    // Create modal if it doesn't exist
    let modal = document.querySelector('.terminal-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.classList.add('terminal-modal');
        document.body.appendChild(modal);
        
        // Close button
        const closeBtn = document.createElement('span');
        closeBtn.textContent = '×';
        closeBtn.classList.add('terminal-modal-close');
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        });
        modal.appendChild(closeBtn);
    }
    
    // Create content container
    const content = document.createElement('div');
    content.classList.add('terminal-content');
    
    // Get component data from mcu-data template
    let mcuData = null;
    try {
        const mcuDataElement = document.getElementById('mcu-data');
        if (mcuDataElement) {
            const mcuDataJson = JSON.parse(mcuDataElement.textContent);
            mcuData = mcuDataJson[componentType];
        }
    } catch (error) {
        console.error('Error parsing MCU data:', error);
    }
    
    if (mcuData) {
        // Create terminal header
        const header = document.createElement('div');
        header.classList.add('terminal-header');
        header.textContent = `${mcuData.name} Technical Details`;
        content.appendChild(header);
        
        // Create command line
        const cmdLine = document.createElement('div');
        cmdLine.classList.add('command-text');
        cmdLine.textContent = `cat /dev/mcu/${componentType}_specs.txt`;
        content.appendChild(cmdLine);
        
        // Create output
        const output = document.createElement('div');
        output.classList.add('command-output');
        
        // Description
        const descSection = document.createElement('div');
        descSection.classList.add('terminal-section');
        descSection.innerHTML = `<h3>Overview</h3><p>${mcuData.description}</p>`;
        output.appendChild(descSection);
        
        // Core initialization code
        const initSection = document.createElement('div');
        initSection.classList.add('terminal-section');
        initSection.innerHTML = `<h3>Core Initialization</h3><pre class="code-snippet"><code>${mcuData.initialization}</code></pre>`;
        output.appendChild(initSection);
        
        // Peripherals
        if (mcuData.peripherals && mcuData.peripherals.length > 0) {
            const peripheralsSection = document.createElement('div');
            peripheralsSection.classList.add('terminal-section');
            peripheralsSection.innerHTML = `<h3>Peripheral Examples</h3>`;
            
            // Create tabs for peripherals
            const tabsContainer = document.createElement('div');
            tabsContainer.classList.add('tabs-container');
            
            const tabsContent = document.createElement('div');
            tabsContent.classList.add('tabs-content');
            
            mcuData.peripherals.forEach((peripheral, index) => {
                // Create tab
                const tab = document.createElement('button');
                tab.classList.add('tab-button');
                tab.textContent = peripheral.name;
                if (index === 0) tab.classList.add('active');
                tab.setAttribute('data-tab', `tab-${componentType}-${index}`);
                tabsContainer.appendChild(tab);
                
                // Create tab content
                const tabContent = document.createElement('div');
                tabContent.classList.add('tab-content');
                tabContent.id = `tab-${componentType}-${index}`;
                if (index === 0) tabContent.classList.add('active');
                
                tabContent.innerHTML = `<pre class="code-snippet"><code>${peripheral.code}</code></pre>`;
                tabsContent.appendChild(tabContent);
                
                // Tab click event
                tab.addEventListener('click', () => {
                    // Clear active classes
                    tabsContainer.querySelectorAll('.tab-button').forEach(t => t.classList.remove('active'));
                    tabsContent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                    
                    // Set active class
                    tab.classList.add('active');
                    document.getElementById(tab.getAttribute('data-tab')).classList.add('active');
                    
                    // Play sound
                    playRandomSound(['click', 'interface']);
                });
            });
            
            peripheralsSection.appendChild(tabsContainer);
            peripheralsSection.appendChild(tabsContent);
            output.appendChild(peripheralsSection);
        }
        
        content.appendChild(output);
    } else {
        // Fallback if data is not available
        content.innerHTML = `
            <div class="terminal-header">Component Details</div>
            <div class="command-text">cat /dev/components/${componentType}.txt</div>
            <div class="command-output">
                <p>Error: Detailed specifications not found.</p>
                <p>Check back later for more information about this component.</p>
            </div>
        `;
    }
    
    // Clear previous content and add new
    modal.innerHTML = '';
    modal.appendChild(content);
    
    // Add close button
    const closeBtn = document.createElement('span');
    closeBtn.textContent = '×';
    closeBtn.classList.add('terminal-modal-close');
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    });
    modal.appendChild(closeBtn);
    
    // Show modal with animation
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Play sound
    playRandomSound(['terminal', 'interface']);
}

/**
 * Initialize MCU terminal modals and tabs functionality
 */
function initMCUTerminals() {
    // Style the code snippets
    document.addEventListener('click', (e) => {
        if (e.target.closest('.pcb-component')) {
            // Add syntax highlighting after modal is shown
            setTimeout(() => {
                const codeBlocks = document.querySelectorAll('.code-snippet code');
                codeBlocks.forEach(block => {
                    // Apply some basic syntax highlighting with regex
                    let code = block.innerHTML;
                    
                    // Comments
                    code = code.replace(/(\/\/.*)/g, '<span class="code-comment">$1</span>');
                    
                    // Keywords
                    const keywords = ['void', 'int', 'uint8_t', 'uint16_t', 'uint32_t', 'bool', 'struct', 'typedef', 'return', 'if', 'else', 'for', 'while', 'static', 'const'];
                    keywords.forEach(keyword => {
                        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
                        code = code.replace(regex, `<span class="code-keyword">${keyword}</span>`);
                    });
                    
                    // Functions
                    code = code.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, '<span class="code-function">$1</span>(');
                    
                    // Numbers
                    code = code.replace(/\b(\d+)\b/g, '<span class="code-number">$1</span>');
                    
                    // Strings
                    code = code.replace(/"([^"]*)"/g, '"<span class="code-string">$1</span>"');
                    
                    // Preprocessor directives
                    code = code.replace(/(#[a-zA-Z_][a-zA-Z0-9_]*)/g, '<span class="code-preprocessor">$1</span>');
                    
                    block.innerHTML = code;
                });
            }, 100);
        }
    });
}

/**
 * Initialize glitch effects for elements with glitch class
 */
function initGlitchEffects() {
    // Add data-text attribute to glitch elements
    document.querySelectorAll('.glitch').forEach(element => {
        element.setAttribute('data-text', element.textContent);
    });
    
    // Random glitch effect on interval
    setInterval(() => {
        const glitchElements = document.querySelectorAll('.glitch');
        if (glitchElements.length === 0) return;
        
        // Pick a random element to glitch
        const randomElement = glitchElements[Math.floor(Math.random() * glitchElements.length)];
        
        // Apply temporary intense glitch effect
        randomElement.classList.add('glitch-intense');
        setTimeout(() => {
            randomElement.classList.remove('glitch-intense');
        }, 500);
    }, 5000);
}

/**
 * Initialize interactive command line interface
 */
function initCommandLineInterface() {
    // Create CLI container at the bottom of the page
    const cli = document.createElement('div');
    cli.classList.add('cli-container');
    document.body.appendChild(cli);
    
    // Create CLI input
    const cliPrompt = document.createElement('span');
    cliPrompt.classList.add('cli-prompt');
    cliPrompt.textContent = 'visitor@portfolio:~$ ';
    
    const cliInput = document.createElement('input');
    cliInput.classList.add('cli-input');
    cliInput.setAttribute('type', 'text');
    cliInput.setAttribute('placeholder', 'Type "help" for commands...');
    
    cli.appendChild(cliPrompt);
    cli.appendChild(cliInput);
    
    // Commands dictionary
    const commands = {
        'help': () => {
            return `Available commands:
- help : Show this help
- about : Show information about me
- skills : List my technical skills
- projects : Show my projects
- clear : Clear the terminal
- contact : How to contact me
- exit : Close this CLI`;
        },
        'about': () => {
            return `Hi, I'm Ananthashayana S. I'm an embedded systems engineer specializing in NRF5340 and STM32H7 microcontrollers.`;
        },
        'skills': () => {
            return `Technical Skills:
- Embedded C/C++
- Bluetooth Low Energy
- RTOS
- Firmware Development
- PCB Design
- Microcontroller Programming
- Debugging & Testing`;
        },
        'projects': () => {
            return `Projects:
1. BLE Data Logger
2. STM32H7 Camera System
3. Low-Power Sensor Network
4. Custom Development Board

Type "project <number>" for details`;
        },
        'project 1': () => {
            return `BLE Data Logger:
A low-power data collection system using nRF5340 with advanced 
sleep modes and optimized BLE connections. Achieves 6+ month 
battery life on a single coin cell.`;
        },
        'project 2': () => {
            return `STM32H7 Camera System:
High-performance image processing system with dual-core STM32H7.
Features real-time image analysis and WiFi transmission
of processed data.`;
        },
        'project 3': () => {
            return `Low-Power Sensor Network:
Distributed sensor array with multiple nRF5340 nodes in a
mesh network topology. Features specialized power management
and fault tolerance.`;
        },
        'project 4': () => {
            return `Custom Development Board:
Designed a development platform for STM32H7 with integrated
debugging, power management, and expansion capabilities.`;
        },
        'clear': () => {
            setTimeout(() => {
                cliOutput.innerHTML = '';
            }, 100);
            return '';
        },
        'contact': () => {
            return `Email: ananthashayana.s@gmail.com
GitHub: github.com/AnanthashayanS
LinkedIn: linkedin.com/in/ananthashayana`;
        },
        'exit': () => {
            setTimeout(() => {
                cli.style.height = '0';
                cliOutput.innerHTML = '';
                cliInput.value = '';
            }, 500);
            return 'Closing CLI...';
        }
    };
    
    // Create output area
    const cliOutput = document.createElement('div');
    cliOutput.classList.add('cli-output');
    cli.appendChild(cliOutput);
    
    // Toggle CLI with shortcut (Ctrl+`)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === '`') {
            e.preventDefault();
            cli.classList.toggle('active');
            if (cli.classList.contains('active')) {
                cliInput.focus();
                playRandomSound(['interface', 'terminal']);
            }
        }
    });
    
    // Process commands
    cliInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const command = cliInput.value.trim().toLowerCase();
            
            // Add command to output
            const commandElement = document.createElement('div');
            commandElement.classList.add('cli-history-command');
            commandElement.innerHTML = `<span class="cli-prompt">visitor@portfolio:~$</span> ${command}`;
            cliOutput.appendChild(commandElement);
            
            // Process command
            let output = '';
            if (commands[command]) {
                output = commands[command]();
                playRandomSound(['success', 'interface']);
            } else if (command === '') {
                output = '';
            } else {
                output = `Command not found: ${command}. Type "help" for available commands.`;
                playRandomSound(['error']);
            }
            
            // Display output
            if (output) {
                const outputElement = document.createElement('div');
                outputElement.classList.add('cli-history-output');
                outputElement.textContent = output;
                cliOutput.appendChild(outputElement);
            }
            
            // Clear input and scroll to bottom
            cliInput.value = '';
            cliOutput.scrollTop = cliOutput.scrollHeight;
        }
    });
    
    // Add some initial welcome text
    setTimeout(() => {
        const welcomeElement = document.createElement('div');
        welcomeElement.classList.add('cli-history-output');
        welcomeElement.textContent = `Welcome to my interactive portfolio terminal.
Type "help" to see available commands.
Press Ctrl+\` to toggle this CLI.`;
        cliOutput.appendChild(welcomeElement);
    }, 1000);
}

/**
 * Play a random sound from a category
 * @param {string[]} categories - Categories of sounds to choose from 
 */
function playRandomSound(categories) {
    // Only play sounds if Audio is defined and if user has interacted with the page
    if (typeof Audio === 'undefined' || !document.hasFocus()) return;
    
    const sounds = {
        'click': ['click1.mp3', 'click2.mp3'],
        'beep': ['beep1.mp3', 'beep2.mp3'],
        'glitch': ['glitch1.mp3', 'glitch2.mp3'],
        'data': ['data1.mp3', 'data2.mp3'],
        'scan': ['scan1.mp3', 'scan2.mp3'],
        'reveal': ['reveal1.mp3', 'reveal2.mp3'],
        'interface': ['interface1.mp3', 'interface2.mp3'],
        'complete': ['complete1.mp3', 'complete2.mp3'],
        'success': ['success1.mp3', 'success2.mp3'],
        'circuit': ['circuit1.mp3', 'circuit2.mp3'],
        'electronic': ['electronic1.mp3', 'electronic2.mp3'],
        'terminal': ['terminal1.mp3', 'terminal2.mp3'],
        'error': ['error1.mp3', 'error2.mp3']
    };
    
    // Select a random category from the provided options
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    // If no sounds defined for this category, return
    if (!sounds[category]) return;
    
    // Select a random sound from the category
    const soundOptions = sounds[category];
    const soundFile = soundOptions[Math.floor(Math.random() * soundOptions.length)];
    
    try {
        // We'll just simulate sound playing for now
        // In a real implementation, you would fetch and play the actual sound file
        console.log(`Playing sound: ${soundFile}`);
        
        // Uncommenting the below code would actually play the sounds if files were available
        /*
        const sound = new Audio(`sounds/${soundFile}`);
        sound.volume = 0.3;
        sound.play();
        */
    } catch (error) {
        console.error('Error playing sound:', error);
    }
}

/**
 * Matrix digital rain effect for background
 */
function initMatrixEffect() {
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const fontSize = 14;
    const columns = Math.ceil(canvas.width / fontSize);
    const drops = [];
    const velocities = [];
    
    // Initialize drops with random starting positions and velocities
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * canvas.height);
        velocities[i] = Math.random() * 1 + 1; // Random speed between 1-2
    }
    
    // Characters to display
    const matrix = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}".split("");
    
    function draw() {
        // Set semi-transparent black to slowly fade the previous frame
        ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw each character
        for (let i = 0; i < drops.length; i++) {
            // Random character to print
            const text = matrix[Math.floor(Math.random() * matrix.length)];
            
            // Vary the color to create depth effect
            const randomGreen = Math.floor(Math.random() * 50) + 140;
            ctx.fillStyle = `rgba(0, ${randomGreen}, 70, ${Math.random() * 0.5 + 0.5})`;
            ctx.font = `${fontSize}px monospace`;
            
            // Draw the character
            const x = i * fontSize;
            const y = drops[i] * fontSize;
            ctx.fillText(text, x, y);
            
            // Reset drop position when it reaches bottom or randomly
            if (y > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            } else {
                // Move drop down by its velocity
                drops[i] += velocities[i];
            }
        }
    }
    
    // Run the animation
    setInterval(draw, 33); // ~30fps for smoother animation
    
    // Resize canvas on window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Recalculate columns and reset drops
        const newColumns = Math.ceil(canvas.width / fontSize);
        
        // Add new columns if needed
        while (drops.length < newColumns) {
            drops.push(Math.floor(Math.random() * canvas.height));
            velocities.push(Math.random() * 1 + 1);
        }
        
        // Remove extra columns if needed
        drops.length = newColumns;
        velocities.length = newColumns;
    });
}

// Terminal typing effect
function typeWriter(element, text, speed = 30, callback = null) {
    let i = 0;
    element.textContent = '';
    
    const typing = setInterval(() => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(typing);
            if (callback) callback();
        }
    }, speed);
}

// PCB trace animation
function animatePCBTraces() {
    const traces = document.querySelectorAll('.pcb-trace');
    traces.forEach((trace, index) => {
        setTimeout(() => {
            trace.style.opacity = '1';
            trace.style.boxShadow = '0 0 10px var(--pcb-trace-glow)';
        }, index * 200);
    });
}

// Skill progress animation
function animateSkillProgress() {
    const skillItems = document.querySelectorAll('.skill-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target.querySelector('.skill-progress-fill');
                const progressValue = entry.target.getAttribute('data-progress');
                progressBar.style.transform = `scaleX(${progressValue / 100})`;
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    skillItems.forEach(item => {
        observer.observe(item);
    });
}

// CLI functionality
function initCLI() {
    const cliButton = document.querySelector('.cli-toggle');
    const cliContainer = document.querySelector('.cli-container');
    const cliInput = document.querySelector('.cli-input');
    const cliOutput = document.querySelector('.cli-output');
    const commandHistory = [];
    let historyIndex = -1;
    
    if (!cliButton || !cliContainer || !cliInput || !cliOutput) return;
    
    // Toggle CLI
    cliButton.addEventListener('click', () => {
        cliContainer.classList.toggle('open');
        if (cliContainer.classList.contains('open')) {
            cliInput.focus();
            playSound('terminal-open');
        } else {
            playSound('terminal-close');
        }
    });
    
    // Process command
    cliInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = cliInput.value.trim();
            if (command) {
                processCommand(command);
                commandHistory.push(command);
                historyIndex = commandHistory.length;
                cliInput.value = '';
                playSound('key-press');
            }
        } else if (e.key === 'ArrowUp') {
            if (historyIndex > 0) {
                historyIndex--;
                cliInput.value = commandHistory[historyIndex];
            }
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                cliInput.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                cliInput.value = '';
            }
            e.preventDefault();
        } else {
            playSound('key-tap');
        }
    });
    
    // Process commands
    function processCommand(command) {
        appendToOutput(`<span class="cli-prompt">></span> ${command}`, 'command');
        
        const cmd = command.toLowerCase();
        let output = '';
        
        // Command processing logic
        if (cmd === 'help') {
            output = `
Available commands:
- help: Show this help message
- about: Display information about me
- skills: List my technical skills
- projects: Show my projects
- contact: Display contact information
- clear: Clear the terminal
- theme [dark/light]: Change theme
- exit: Close the terminal
            `;
        } else if (cmd === 'about') {
            output = `
Name: Ananthashayan S
Role: Embedded Systems Developer
---------------------------------------
Passionate about developing efficient embedded systems 
with extensive experience in NRF5340 and STM32H7 microcontrollers.
Specialized in low-power applications and real-time systems.
            `;
        } else if (cmd === 'skills') {
            output = `
TECHNICAL SKILLS
---------------------------------------
» Embedded C/C++: ███████████████████ 95%
» ARM Cortex-M: ██████████████████ 90%
» BLE Stack: ████████████████ 80%
» RTOS: ████████████████ 80%
» PCB Design: ███████████████ 75%
» Hardware Debugging: █████████████████ 85%
» Python: ████████████████ 80%
            `;
        } else if (cmd === 'projects') {
            output = `
PROJECTS
---------------------------------------
1. BLE-enabled Health Monitor
   Tech: NRF5340, FreeRTOS, BLE Stack

2. Industrial Control System
   Tech: STM32H7, CAN, Modbus

3. Power Management System
   Tech: STM32H7, Power Electronics, Custom PCB

Type 'project 1', 'project 2', or 'project 3' for details.
            `;
        } else if (cmd.startsWith('project ')) {
            const num = cmd.split(' ')[1];
            if (num === '1') {
                output = `
PROJECT: BLE-enabled Health Monitor
---------------------------------------
Developed a wearable health monitoring device using NRF5340.
Features:
- Real-time heart rate and temperature monitoring
- BLE connectivity with smartphone app
- 3-week battery life on a single charge
- Waterproof enclosure

Tech stack: NRF5340, FreeRTOS, BLE Stack, Custom PCB
                `;
            } else if (num === '2') {
                output = `
PROJECT: Industrial Control System
---------------------------------------
Designed a robust control system for factory automation.
Features:
- Multiple sensor inputs (temperature, pressure, flow)
- Real-time control with 1ms response time
- Redundant communication channels
- Web dashboard for monitoring

Tech stack: STM32H7, CAN, Modbus, ThreadX RTOS
                `;
            } else if (num === '3') {
                output = `
PROJECT: Power Management System
---------------------------------------
Created an intelligent power distribution system.
Features:
- Dynamic load balancing
- Fault detection and isolation
- Power consumption optimization
- Remote monitoring and control

Tech stack: STM32H7, Power Electronics, Custom PCB, MQTT
                `;
            } else {
                output = 'Project not found. Type "projects" to see available projects.';
            }
        } else if (cmd === 'contact') {
            output = `
CONTACT INFORMATION
---------------------------------------
Email: ananthashayan@example.com
GitHub: github.com/AnanthashayanS
LinkedIn: linkedin.com/in/ananthashayan
            `;
        } else if (cmd === 'clear') {
            cliOutput.innerHTML = '';
            return;
        } else if (cmd.startsWith('theme ')) {
            const theme = cmd.split(' ')[1];
            if (theme === 'dark') {
                output = 'Theme set to dark mode.';
                document.documentElement.style.setProperty('--dark', '#0c0c0c');
            } else if (theme === 'light') {
                output = 'Theme set to light mode.';
                document.documentElement.style.setProperty('--dark', '#1a1a1a');
            } else {
                output = 'Invalid theme. Available options: dark, light';
            }
        } else if (cmd === 'exit') {
            cliContainer.classList.remove('open');
            playSound('terminal-close');
            return;
        } else if (cmd === 'matrix') {
            output = 'Activating Matrix effect...';
            document.querySelector('.matrix-canvas').style.opacity = '0.2';
            setTimeout(() => {
                document.querySelector('.matrix-canvas').style.opacity = '0.12';
            }, 5000);
        } else if (cmd === 'whoami') {
            output = 'Ananthashayan S - Embedded Systems Developer';
        } else {
            output = `Command not found: ${command}. Type 'help' for available commands.`;
        }
        
        appendToOutput(output, 'output');
    }
    
    // Add output to CLI
    function appendToOutput(text, type) {
        const element = document.createElement('div');
        element.className = `cli-history-${type}`;
        element.innerHTML = text;
        cliOutput.appendChild(element);
        cliOutput.scrollTop = cliOutput.scrollHeight;
    }
}

// Sound effects
const soundEffects = {
    'key-tap': new Audio('assets/sounds/key-tap.mp3'),
    'key-press': new Audio('assets/sounds/key-press.mp3'),
    'terminal-open': new Audio('assets/sounds/terminal-open.mp3'),
    'terminal-close': new Audio('assets/sounds/terminal-close.mp3'),
    'hover': new Audio('assets/sounds/hover.mp3')
};

function playSound(soundName) {
    try {
        if (soundEffects[soundName]) {
            soundEffects[soundName].currentTime = 0;
            soundEffects[soundName].volume = 0.3;
            soundEffects[soundName].play().catch(() => {});
        }
    } catch (error) {
        console.log('Sound not available');
    }
}

// Microcontroller component interactions
function initMicrocontrollerComponents() {
    const components = document.querySelectorAll('.pcb-component');
    const modal = document.querySelector('.terminal-modal');
    const modalContent = document.querySelector('.terminal-modal .terminal-content');
    const closeModal = document.querySelector('.terminal-modal-close');
    
    if (!components.length || !modal || !modalContent || !closeModal) return;
    
    components.forEach(component => {
        component.addEventListener('click', () => {
            const name = component.querySelector('.component-name').textContent;
            const details = component.querySelector('.component-details').textContent;
            const specs = component.querySelector('.component-specs').innerHTML;
            
            const content = `
                <div class="terminal-header">${name} Details</div>
                <div class="command-output">
                    $ cat /dev/microcontrollers/${name.toLowerCase().replace(/\s+/g, '_')}_specs.txt
                    
                    ${details}
                    
                    TECHNICAL SPECIFICATIONS:
                    ------------------------
                    ${specs}
                    
                    $ _
                </div>
            `;
            
            modalContent.innerHTML = content;
            modal.style.display = 'flex';
            playSound('terminal-open');
            
            // Fade in effect
            setTimeout(() => {
                modal.style.opacity = '1';
            }, 10);
        });
    });
    
    closeModal.addEventListener('click', () => {
        playSound('terminal-close');
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    });
}

// Reveal animations on scroll
function initRevealAnimations() {
    const revealElements = document.querySelectorAll('.reveal');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    revealElements.forEach(element => {
        observer.observe(element);
    });
}

// Initialize peripheral tabs
function initPeripheralTabs() {
    const tabButtons = document.querySelectorAll('.peripheral-tabs .tab-button');
    const tabContents = document.querySelectorAll('.peripheral-tabs-content .tab-content');
    
    if (!tabButtons.length || !tabContents.length) return;
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to current button and corresponding content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            const activeTab = document.getElementById(tabId);
            
            if (activeTab) {
                activeTab.classList.add('active');
                
                // Add typewriter effect to code
                const codeElement = activeTab.querySelector('code');
                if (codeElement) {
                    const originalCode = codeElement.textContent;
                    codeElement.textContent = '';
                    let i = 0;
                    const typeSpeed = 10; // Faster typing for code
                    
                    function typeCode() {
                        if (i < originalCode.length) {
                            codeElement.textContent += originalCode.charAt(i);
                            i++;
                            setTimeout(typeCode, typeSpeed);
                        }
                    }
                    typeCode();
                }
                
                // Play sound effect
                playSound('key-press');
            }
        });
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initMatrixEffect();
    initCustomCursor();
    animatePCBTraces();
    animateSkillProgress();
    initMicrocontrollerComponents();
    initRevealAnimations();
    initPeripheralTabs();
    
    // Type intro text
    const typingElement = document.querySelector('.typing-text');
    if (typingElement) {
        typeWriter(typingElement, 'Building embedded systems that power the future');
    }
    
    // Initialize smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                playSound('key-press');
            }
        });
    });
    
    // Add reveal class to sections
    document.querySelectorAll('section').forEach((section, index) => {
        if (!section.classList.contains('reveal')) {
            section.classList.add('reveal');
            section.style.transitionDelay = `${index * 0.1}s`;
        }
    });
    
    // Initialize the first view with animation
    setTimeout(() => {
        document.querySelectorAll('.hero .reveal').forEach(element => {
            element.classList.add('active');
        });
    }, 500);
    
    // Create directory for sounds
    console.log('Terminal theme initialized');
}); 