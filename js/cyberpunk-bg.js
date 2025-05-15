// Cyberpunk Background Animation Effects - Simplified Version

document.addEventListener('DOMContentLoaded', function() {
    // Create random floating particles of different types
    const circuitContainer = document.querySelector('.circuit-container');
    
    // Create data particles (circles)
    for (let i = 0; i < 20; i++) {
        createDataParticle();
    }
    
    // Create energy pulse particles (lines that traverse the screen)
    for (let i = 0; i < 5; i++) {
        createEnergyPulse();
    }
    
    function createDataParticle() {
        const particle = document.createElement('div');
        particle.classList.add('particle', 'data-particle');
        
        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        // Random size
        const size = Math.random() * 3 + 1;
        
        // Random color between cyan and magenta with occasional green
        let hue;
        if (Math.random() > 0.8) {
            hue = Math.random() * 60 + 90; // 90-150 range for green/yellow-green
        } else {
            hue = Math.random() * 60 + 270; // 270-330 range for purple/magenta/pink
        }
        
        // Apply styles
        particle.style.cssText = `
            position: absolute;
            top: ${y}%;
            left: ${x}%;
            width: ${size}px;
            height: ${size}px;
            background-color: hsl(${hue}, 100%, 60%);
            border-radius: 50%;
            box-shadow: 0 0 ${size * 3}px hsl(${hue}, 100%, 70%);
            opacity: ${Math.random() * 0.5 + 0.3};
            animation: float ${Math.random() * 10 + 20}s infinite alternate ease-in-out;
            animation-delay: -${Math.random() * 10}s;
            z-index: 1;
        `;
        
        circuitContainer.appendChild(particle);
        
        // Occasionally make particles "blink"
        if (Math.random() > 0.7) {
            setInterval(() => {
                particle.style.opacity = (Math.random() * 0.5 + 0.3).toString();
            }, Math.random() * 5000 + 2000); // Random interval between 2-7 seconds
        }
    }
    
    function createEnergyPulse() {
        const pulse = document.createElement('div');
        pulse.classList.add('energy-pulse');
        
        // Decide direction (horizontal or vertical)
        const isHorizontal = Math.random() > 0.5;
        
        // Random position
        let x, y, width, height;
        if (isHorizontal) {
            y = Math.random() * 100;
            x = -10; // Start off-screen
            width = Math.random() * 20 + 10; // 10-30px
            height = Math.random() * 1 + 0.5; // 0.5-1.5px
        } else {
            x = Math.random() * 100;
            y = -10; // Start off-screen
            width = Math.random() * 1 + 0.5; // 0.5-1.5px
            height = Math.random() * 20 + 10; // 10-30px
        }
        
        // Random color
        const colors = ['#00ffff', '#ff00ff', '#39ff14']; // Cyan, Magenta, Green
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Apply styles
        pulse.style.cssText = `
            position: absolute;
            top: ${y}%;
            left: ${x}%;
            width: ${width}px;
            height: ${height}px;
            background-color: ${color};
            box-shadow: 0 0 10px ${color}, 0 0 20px ${color};
            opacity: 0.7;
            z-index: 0;
        `;
        
        circuitContainer.appendChild(pulse);
        
        // Animate the pulse across the screen
        const duration = Math.random() * 3000 + 2000; // 2-5 seconds
        let startTime = null;
        
        function animatePulse(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = (timestamp - startTime) / duration;
            
            if (progress < 1) {
                if (isHorizontal) {
                    pulse.style.left = (progress * 120 - 10) + '%'; // Move from -10% to 110%
                } else {
                    pulse.style.top = (progress * 120 - 10) + '%'; // Move from -10% to 110%
                }
                requestAnimationFrame(animatePulse);
            } else {
                // Remove and create a new pulse
                pulse.remove();
                createEnergyPulse();
            }
        }
        
        requestAnimationFrame(animatePulse);
    }
});

// Add an advanced parallax effect with smooth transitions
document.addEventListener('mousemove', function(e) {
    const moveX = (e.clientX / window.innerWidth) - 0.5;
    const moveY = (e.clientY / window.innerHeight) - 0.5;
    
    // Apply parallax effect to elements
    const elements = document.querySelectorAll('.parallax');
    elements.forEach(elem => {
        const depth = parseFloat(elem.getAttribute('data-depth')) || 0.1;
        const translateX = moveX * depth * 40; // Increased movement range
        const translateY = moveY * depth * 40;
        
        // Apply smooth transition
        elem.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)';
        elem.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
    });
    
    // Create additional glow effect on grid that follows mouse
    const gridOverlay = document.querySelector('.grid-overlay');
    if (gridOverlay) {
        const glowX = e.clientX;
        const glowY = e.clientY;
        
        // Add a radial gradient that follows the cursor
        const existingBackground = window.getComputedStyle(gridOverlay).backgroundImage;
        const mouseGlow = `radial-gradient(circle at ${glowX}px ${glowY}px, rgba(0, 255, 255, 0.1) 0%, rgba(0, 255, 255, 0) 10%)`;
        
        // Only apply if not already applied
        if (!existingBackground.includes('radial-gradient')) {
            gridOverlay.style.backgroundImage = `${mouseGlow}, ${existingBackground}`;
        } else {
            // Extract the existing gradients without the mouse glow
            const backgroundParts = existingBackground.split('),');
            if (backgroundParts.length > 1) {
                // Skip the first part (which should be the mouse glow) and combine the rest
                const restOfBackground = backgroundParts.slice(1).join('),') + ')';
                gridOverlay.style.backgroundImage = `${mouseGlow}, ${restOfBackground}`;
            }
        }
    }
    
    // Make circuit lines react to mouse position
    const circuitLines = document.querySelectorAll('.circuit-line');
    circuitLines.forEach(line => {
        const rect = line.getBoundingClientRect();
        const lineX = rect.left + rect.width / 2;
        const lineY = rect.top + rect.height / 2;
        
        // Calculate distance from mouse to line center
        const dx = e.clientX - lineX;
        const dy = e.clientY - lineY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Adjust opacity based on proximity to mouse cursor
        const maxDistance = 300; // Maximum distance for effect
        let opacityBoost = 0;
        
        if (distance < maxDistance) {
            opacityBoost = 0.3 * (1 - distance / maxDistance);
            line.style.boxShadow = `0 0 ${10 + opacityBoost * 20}px rgba(0, 255, 170, ${0.7 + opacityBoost})`;
        }
    });
});

// Add scroll effects for the cyberpunk background
document.addEventListener('scroll', function() {
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    
    // Adjust grid perspective based on scroll
    const gridOverlay = document.querySelector('.grid-overlay');
    if (gridOverlay) {
        // Change perspective angle slightly as user scrolls
        const rotateX = 60 - (scrollPosition / windowHeight) * 10;
        gridOverlay.style.transform = `perspective(500px) rotateX(${Math.max(45, rotateX)}deg)`;
    }
});

// Create interactive data nodes when user interacts with financial elements
document.addEventListener('click', function(e) {
    // Only create effect for interactive elements in the financial interface
    if (e.target.closest('.cyber-card') && 
        (e.target.tagName === 'BUTTON' || 
         e.target.closest('button') || 
         e.target.closest('a') ||
         e.target.closest('.bills-container') ||
         e.target.closest('#creditCardsContainer') ||
         e.target.closest('#loansContainer'))) {
        
        createDataBurst(e.clientX, e.clientY);
    }
});

// Create a burst of data particles from a click point
function createDataBurst(x, y) {
    const container = document.querySelector('.cyberpunk-bg');
    const particleCount = 12;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        const angle = (i / particleCount) * Math.PI * 2;
        const velocity = 1 + Math.random() * 2;
        const size = Math.random() * 3 + 1;
        
        // Pick a cyberpunk color
        const colors = ['#00ffff', '#ff00ff', '#39ff14', '#ffff00'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particle.style.cssText = `
            position: fixed;
            top: ${y}px;
            left: ${x}px;
            width: ${size}px;
            height: ${size}px;
            background-color: ${color};
            border-radius: 50%;
            box-shadow: 0 0 ${size * 2}px ${color};
            pointer-events: none;
            z-index: 100;
        `;
        
        container.appendChild(particle);
        
        // Animate the particle outward
        const duration = 500 + Math.random() * 500;
        const distance = 40 + Math.random() * 60;
        let startTime = null;
        
        function animateParticle(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = (timestamp - startTime) / duration;
            
            if (progress < 1) {
                const currentX = x + Math.cos(angle) * distance * progress;
                const currentY = y + Math.sin(angle) * distance * progress;
                const scale = 1 - progress;
                
                particle.style.transform = `translate(${currentX - x}px, ${currentY - y}px) scale(${scale})`;
                particle.style.opacity = (1 - progress).toString();
                
                requestAnimationFrame(animateParticle);
            } else {
                particle.remove();
            }
        }
        
        requestAnimationFrame(animateParticle);
    }
}

// Add periodic effects for the circuit lines
function addCircuitEffects() {
    // Occasionally flash the scan lines
    setInterval(() => {
        const scanLine = document.querySelector('.scan-line');
        if (scanLine && Math.random() > 0.7) {
            scanLine.style.opacity = '1';
            scanLine.style.filter = 'brightness(1.5)';
            
            setTimeout(() => {
                scanLine.style.opacity = '0.8';
                scanLine.style.filter = 'brightness(1)';
            }, 100);
        }
    }, 3000);
    
    // Periodically boost glow effect on random circuit lines
    setInterval(() => {
        const circuitLines = document.querySelectorAll('.circuit-line');
        if (circuitLines.length > 0 && Math.random() > 0.6) {
            const randomLine = circuitLines[Math.floor(Math.random() * circuitLines.length)];
            
            // Store original box-shadow
            const originalShadow = randomLine.style.boxShadow || '0 0 10px rgba(0, 255, 170, 0.8), 0 0 20px rgba(0, 255, 170, 0.6)';
            
            // Boost the glow effect
            randomLine.style.boxShadow = '0 0 15px rgba(0, 255, 170, 1), 0 0 30px rgba(0, 255, 170, 0.8), 0 0 45px rgba(0, 255, 170, 0.5)';
            randomLine.style.opacity = '1';
            
            // Restore original after a short delay
            setTimeout(() => {
                randomLine.style.boxShadow = originalShadow;
                randomLine.style.opacity = '0.8';
            }, 200 + Math.random() * 300); // 200-500ms flash
        }
    }, 2000);
}

// No longer needed functions have been removed to simplify the background

// Add data flow animation along circuit lines
function initializeDataFlowAnimation() {
    const circuitLines = document.querySelectorAll('.circuit-line');
    
    circuitLines.forEach(line => {
        // Create data packet that travels along the circuit line
        setInterval(() => {
            if (Math.random() > 0.7) { // Only animate some of the time for a more natural effect
                createDataPacket(line);
            }
        }, 3000 + Math.random() * 5000); // Random interval between 3-8 seconds
    });
}

// Create a data packet that travels along a circuit line
function createDataPacket(line) {
    const dataPacket = document.createElement('div');
    const isHorizontal = line.classList.contains('h-line1') || 
                         line.classList.contains('h-line2') || 
                         line.classList.contains('h-line3') ||
                         line.classList.contains('h-line4') ||
                         line.classList.contains('h-line5');
    
    // Random color with cyberpunk theme
    const colors = ['#00ffff', '#39ff14', '#ff00ff'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    dataPacket.style.cssText = `
        position: absolute;
        width: ${isHorizontal ? '8px' : '4px'};
        height: ${isHorizontal ? '4px' : '8px'};
        background-color: ${color};
        border-radius: 50%;
        box-shadow: 0 0 10px ${color};
        opacity: 0.9;
        z-index: 4;
        pointer-events: none;
    `;
    
    // Set initial position based on line type
    if (isHorizontal) {
        dataPacket.style.top = '50%';
        dataPacket.style.left = '0';
        dataPacket.style.transform = 'translateY(-50%)';
    } else {
        dataPacket.style.left = '50%';
        dataPacket.style.top = '0';
        dataPacket.style.transform = 'translateX(-50%)';
    }
    
    line.appendChild(dataPacket);
    
    // Animate the data packet
    const duration = 1500 + Math.random() * 500; // 1.5-2 seconds
    let startTime = null;
    
    function animatePacket(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = (timestamp - startTime) / duration;
        
        if (progress < 1) {
            if (isHorizontal) {
                dataPacket.style.left = `${progress * 100}%`;
            } else {
                dataPacket.style.top = `${progress * 100}%`;
            }
            requestAnimationFrame(animatePacket);
        } else {
            // Create a pulse effect at the end point
            createPulseEffect(line, isHorizontal);
            dataPacket.remove();
        }
    }
    
    requestAnimationFrame(animatePacket);
}

// Create a pulse effect at circuit endpoints
function createPulseEffect(line, isHorizontal) {
    const pulse = document.createElement('div');
    
    pulse.style.cssText = `
        position: absolute;
        width: 6px;
        height: 6px;
        background-color: rgba(0, 255, 170, 0);
        border-radius: 50%;
        border: 2px solid #00ffaa;
        z-index: 4;
        pointer-events: none;
    `;
    
    // Set position based on line type
    if (isHorizontal) {
        pulse.style.top = '50%';
        pulse.style.right = '0';
        pulse.style.transform = 'translate(50%, -50%)';
    } else {
        pulse.style.left = '50%';
        pulse.style.bottom = '0';
        pulse.style.transform = 'translate(-50%, 50%)';
    }
    
    line.appendChild(pulse);
    
    // Animate the pulse
    let scale = 1;
    let opacity = 1;
    const duration = 800; // milliseconds
    const startTime = performance.now();
    
    function animatePulse(timestamp) {
        const elapsed = timestamp - startTime;
        const progress = elapsed / duration;
        
        if (progress < 1) {
            scale = 1 + progress * 2;
            opacity = 1 - progress;
            
            pulse.style.transform = isHorizontal 
                ? `translate(50%, -50%) scale(${scale})` 
                : `translate(-50%, 50%) scale(${scale})`;
            pulse.style.opacity = opacity.toString();
            
            requestAnimationFrame(animatePulse);
        } else {
            pulse.remove();
        }
    }
    
    requestAnimationFrame(animatePulse);
}

// Initialize the data flow animation after the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Call initial setup functions
    setTimeout(() => {
        initializeDataFlowAnimation();
    }, 1000); // Small delay to ensure other animations have started
});

// Start circuit effects
addCircuitEffects();
