// UI handler for the interactive elements

export function setupUI(world) {
    const navButtons = document.querySelectorAll('.nav-button');
    const panels = document.querySelectorAll('.panel');
    
    // Handle navigation button clicks
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sectionId = button.getAttribute('data-section');
            
            // Hide all panels first
            panels.forEach(panel => {
                panel.classList.remove('active');
            });
            
            // Remove active class from all buttons
            navButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Show the selected panel and mark button as active
            document.getElementById(sectionId).classList.add('active');
            button.classList.add('active');
            
            // If world exists, navigate to the corresponding area
            if (world && world.areas && world.areas[sectionId]) {
                world.navigateToArea(sectionId);
            }
        });
    });
    
    // Set 'About' section as default active
    document.querySelector('[data-section="about"]').click();
    
    // Create a popup for component information
    createInfoPopup();
    
    // Create a controls info display
    createControlsInfo();
    
    // Setup help button
    setupHelpButton();
    
    // Setup spaceship indicator
    setupSpaceshipIndicator();
    
    // Listen for object click events from the 3D world
    window.addEventListener('object-clicked', (event) => {
        showComponentInfo(event.detail.name, event.detail.description);
    });
    
    // Listen for area navigation events
    window.addEventListener('navigate-to-section', (event) => {
        const sectionButton = document.querySelector(`[data-section="${event.detail.section}"]`);
        if (sectionButton) {
            sectionButton.click();
        }
    });
    
    // Listen for spaceship mode changes
    window.addEventListener('spaceship-mode-change', (event) => {
        const indicator = document.querySelector('.spaceship-indicator');
        if (indicator) {
            if (event.detail.active) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        }
    });
}

function setupHelpButton() {
    const helpButton = document.querySelector('.help-button');
    if (helpButton) {
        helpButton.addEventListener('click', () => {
            // Re-show the overlay with instructions
            const overlay = document.querySelector('.overlay');
            if (overlay) {
                overlay.style.display = 'flex';
                overlay.style.opacity = '1';
            }
        });
    }
}

function setupSpaceshipIndicator() {
    // The spaceship indicator is already in the HTML
    // We'll toggle its visibility via events
}

function createInfoPopup() {
    // Create container for component info popup
    const infoPopup = document.createElement('div');
    infoPopup.className = 'component-info';
    infoPopup.innerHTML = `
        <div class="info-header">
            <h3 class="component-name"></h3>
            <button class="close-info">×</button>
        </div>
        <p class="component-description"></p>
    `;
    
    // Style the popup
    infoPopup.style.position = 'fixed';
    infoPopup.style.left = '50%';
    infoPopup.style.bottom = '-200px'; // Start off-screen
    infoPopup.style.transform = 'translateX(-50%)';
    infoPopup.style.width = '400px';
    infoPopup.style.maxWidth = '90%';
    infoPopup.style.background = 'rgba(16, 24, 39, 0.95)';
    infoPopup.style.backdropFilter = 'blur(10px)';
    infoPopup.style.borderRadius = '10px';
    infoPopup.style.padding = '20px';
    infoPopup.style.boxShadow = '0 0 20px rgba(0, 240, 255, 0.5)';
    infoPopup.style.border = '1px solid rgba(0, 240, 255, 0.3)';
    infoPopup.style.transition = 'bottom 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    infoPopup.style.zIndex = '1000';
    
    // Style the info header
    const infoHeader = infoPopup.querySelector('.info-header');
    infoHeader.style.display = 'flex';
    infoHeader.style.justifyContent = 'space-between';
    infoHeader.style.alignItems = 'center';
    infoHeader.style.marginBottom = '10px';
    
    // Style the component name
    const componentName = infoPopup.querySelector('.component-name');
    componentName.style.margin = '0';
    componentName.style.color = '#00f0ff';
    componentName.style.fontSize = '1.3rem';
    
    // Style the close button
    const closeButton = infoPopup.querySelector('.close-info');
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.color = '#ffffff';
    closeButton.style.fontSize = '1.5rem';
    closeButton.style.cursor = 'pointer';
    closeButton.style.padding = '0';
    closeButton.style.lineHeight = '1';
    
    // Style the component description
    const componentDescription = infoPopup.querySelector('.component-description');
    componentDescription.style.margin = '0';
    componentDescription.style.lineHeight = '1.6';
    
    // Add close functionality
    closeButton.addEventListener('click', () => {
        infoPopup.style.bottom = '-200px';
    });
    
    // Add to body
    document.body.appendChild(infoPopup);
    
    // Store popup reference for later use
    window.componentInfoPopup = infoPopup;
}

function createControlsInfo() {
    // Create a floating controls info panel that's always visible in the corner
    const controlsInfo = document.createElement('div');
    controlsInfo.className = 'controls-info';
    controlsInfo.innerHTML = `
        <h4>Controls</h4>
        <ul>
            <li><kbd>W</kbd> / <kbd>↑</kbd>: Move forward</li>
            <li><kbd>S</kbd> / <kbd>↓</kbd>: Move backward</li>
            <li><kbd>A</kbd> / <kbd>←</kbd>: Move left</li>
            <li><kbd>D</kbd> / <kbd>→</kbd>: Move right</li>
            <li><kbd>Space</kbd>: Jump</li>
            <li><kbd>Mouse</kbd>: Look around</li>
            <li><kbd>Click</kbd>: Interact</li>
        </ul>
        <button class="minimize-btn">_</button>
    `;
    
    // Style the controls info
    controlsInfo.style.position = 'fixed';
    controlsInfo.style.right = '20px';
    controlsInfo.style.bottom = '20px';
    controlsInfo.style.width = '220px';
    controlsInfo.style.background = 'rgba(16, 24, 39, 0.85)';
    controlsInfo.style.backdropFilter = 'blur(10px)';
    controlsInfo.style.borderRadius = '10px';
    controlsInfo.style.padding = '15px';
    controlsInfo.style.boxShadow = '0 0 15px rgba(0, 240, 255, 0.3)';
    controlsInfo.style.border = '1px solid rgba(0, 240, 255, 0.3)';
    controlsInfo.style.zIndex = '900';
    controlsInfo.style.transition = 'transform 0.3s ease';
    
    // Style header
    const header = controlsInfo.querySelector('h4');
    header.style.margin = '0 0 10px 0';
    header.style.color = '#00f0ff';
    header.style.fontSize = '1rem';
    header.style.textAlign = 'center';
    
    // Style list
    const list = controlsInfo.querySelector('ul');
    list.style.margin = '0';
    list.style.padding = '0 0 0 20px';
    list.style.fontSize = '0.85rem';
    
    const listItems = controlsInfo.querySelectorAll('li');
    listItems.forEach(item => {
        item.style.marginBottom = '5px';
    });
    
    // Style keyboard keys
    const keyElements = controlsInfo.querySelectorAll('kbd');
    keyElements.forEach(key => {
        key.style.display = 'inline-block';
        key.style.padding = '2px 5px';
        key.style.backgroundColor = 'rgba(0, 240, 255, 0.2)';
        key.style.borderRadius = '3px';
        key.style.border = '1px solid rgba(0, 240, 255, 0.4)';
        key.style.fontFamily = 'monospace';
        key.style.color = '#ffffff';
    });
    
    // Style minimize button
    const minimizeBtn = controlsInfo.querySelector('.minimize-btn');
    minimizeBtn.style.position = 'absolute';
    minimizeBtn.style.top = '10px';
    minimizeBtn.style.right = '10px';
    minimizeBtn.style.background = 'none';
    minimizeBtn.style.border = 'none';
    minimizeBtn.style.color = '#ffffff';
    minimizeBtn.style.cursor = 'pointer';
    minimizeBtn.style.padding = '0';
    minimizeBtn.style.fontSize = '1rem';
    minimizeBtn.style.lineHeight = '1';
    
    // Minimize functionality
    let isMinimized = false;
    minimizeBtn.addEventListener('click', () => {
        if (isMinimized) {
            controlsInfo.style.transform = 'translateY(0)';
            list.style.display = 'block';
            minimizeBtn.textContent = '_';
        } else {
            controlsInfo.style.transform = `translateY(${list.offsetHeight + 10}px)`;
            list.style.display = 'none';
            minimizeBtn.textContent = '▲';
        }
        isMinimized = !isMinimized;
    });
    
    // Add to body
    document.body.appendChild(controlsInfo);
}

function showComponentInfo(name, description) {
    const popup = window.componentInfoPopup;
    if (!popup) return;
    
    // Update content
    popup.querySelector('.component-name').textContent = name;
    popup.querySelector('.component-description').textContent = description;
    
    // Show popup with animation
    popup.style.bottom = '20px';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        popup.style.bottom = '-200px';
    }, 5000);
} 