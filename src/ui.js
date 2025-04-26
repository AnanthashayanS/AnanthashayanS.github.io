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
        });
    });
    
    // Set 'About' section as default active
    document.querySelector('[data-section="about"]').click();
    
    // Create a popup for component information
    createInfoPopup();
    
    // Listen for object click events from the 3D world
    window.addEventListener('object-clicked', (event) => {
        showComponentInfo(event.detail.name, event.detail.description);
    });
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