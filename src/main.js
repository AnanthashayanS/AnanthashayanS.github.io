// Interactive portfolio JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Initialize particle background
    initParticles();
    
    // Initialize custom cursor
    initCustomCursor();
    
    // Initialize reveal animations
    initRevealAnimations();
    
    // Initialize skill progress bars
    initSkillProgressBars();
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});

// Create particle background
function initParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle(particlesContainer);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.classList.add('glowing-dots');
    
    // Random position
    const xPos = Math.random() * 100;
    const yPos = Math.random() * 100;
    
    // Random size
    const size = Math.random() * 4 + 1;
    
    // Set styles
    particle.style.left = `${xPos}%`;
    particle.style.top = `${yPos}%`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    // Random animation
    const duration = Math.random() * 50 + 10;
    particle.style.animation = `pulse ${duration}s infinite alternate`;
    
    // Add to container
    container.appendChild(particle);
    
    // Create floating animation for the particle
    animateParticle(particle);
}

function animateParticle(particle) {
    const xPos = parseFloat(particle.style.left);
    const yPos = parseFloat(particle.style.top);
    
    // Create random movement
    const xMovement = (Math.random() - 0.5) * 3;
    const yMovement = (Math.random() - 0.5) * 3;
    
    // Animate with requestAnimationFrame for smooth animation
    let start = null;
    const duration = 10000; // 10 seconds for one cycle
    
    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = (timestamp - start) / duration;
        
        // Calculate new position with sine wave for smoother movement
        const newX = xPos + Math.sin(progress * 2 * Math.PI) * xMovement;
        const newY = yPos + Math.cos(progress * 2 * Math.PI) * yMovement;
        
        // Update position
        particle.style.left = `${newX}%`;
        particle.style.top = `${newY}%`;
        
        // Continue animation
        if (progress >= 1) {
            start = null;
        }
        requestAnimationFrame(step);
    }
    
    requestAnimationFrame(step);
}

// Custom cursor functionality
function initCustomCursor() {
    const cursor = document.querySelector('.custom-cursor');
    
    if (!cursor) return;
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    });
    
    // Add hover effect for links and buttons
    const interactiveElements = document.querySelectorAll('a, button, .tooltip, .work-item, .skill-item, .cert-item, .project-item, .flip-card');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.width = '40px';
            cursor.style.height = '40px';
            cursor.style.backgroundColor = 'rgba(0, 240, 255, 0.1)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.style.width = '20px';
            cursor.style.height = '20px';
            cursor.style.backgroundColor = 'transparent';
        });
    });
}

// Reveal animations on scroll
function initRevealAnimations() {
    const revealElements = document.querySelectorAll('.reveal');
    
    function checkReveal() {
        const windowHeight = window.innerHeight;
        const revealPoint = 150;
        
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            if (elementTop < windowHeight - revealPoint) {
                element.classList.add('active');
            }
        });
    }
    
    // Initial check
    checkReveal();
    
    // Check on scroll
    window.addEventListener('scroll', checkReveal);
}

// Animate skill progress bars when visible
function initSkillProgressBars() {
    const progressBars = document.querySelectorAll('.skill-progress-fill');
    
    function animateProgress() {
        progressBars.forEach(bar => {
            const rect = bar.getBoundingClientRect();
            
            // Check if in viewport
            if (rect.top < window.innerHeight && rect.bottom >= 0) {
                // Set width based on the data-width attribute or the style width
                const targetWidth = bar.style.width;
                bar.style.width = targetWidth;
                
                // Remove from the list once animated
                progressBars.splice(progressBars.indexOf(bar), 1);
            }
        });
        
        // Continue checking until all bars are animated
        if (progressBars.length > 0) {
            requestAnimationFrame(animateProgress);
        }
    }
    
    // Start animation
    requestAnimationFrame(animateProgress);
}

// Add CSS keyframes animation dynamically for the pulse effect
function addPulseAnimation() {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes pulse {
            0% {
                transform: scale(1);
                opacity: 0.1;
            }
            50% {
                opacity: 0.2;
            }
            100% {
                transform: scale(1.5);
                opacity: 0.1;
            }
        }
    `;
    document.head.appendChild(styleSheet);
}

// Call to add the pulse animation
addPulseAnimation(); 