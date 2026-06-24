/* STORE-MO Premium Interactive Features */
document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Inject Floating Ambient Glow Orbs on all pages
    const blurContainer = document.createElement("div");
    blurContainer.classList.add("bg-blur-container");
    document.body.appendChild(blurContainer);
    createFloatingOrbs(blurContainer);
    
    // 2. Ripple Click Effect on Buttons
    const buttons = document.querySelectorAll(".button, input[type='submit'], .premium-btn, .object-tools a");
    buttons.forEach(button => {
        button.addEventListener("click", function(e) {
            let ripple = document.createElement("span");
            ripple.classList.add("btn-ripple");
            this.appendChild(ripple);
            
            let rect = this.getBoundingClientRect();
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;
            
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

/**
 * Creates drifting blurry glow circles in the background
 */
function createFloatingOrbs(container) {
    const orbColors = [
        "rgba(99, 102, 241, 0.08)", // Indigo
        "rgba(14, 165, 233, 0.08)", // Sky Blue
        "rgba(217, 70, 239, 0.06)"  // Pink/Violet
    ];
    
    const count = 4;
    for (let i = 0; i < count; i++) {
        const orb = document.createElement("div");
        orb.style.position = "absolute";
        orb.style.borderRadius = "50%";
        orb.style.filter = "blur(100px)";
        orb.style.pointerEvents = "none";
        orb.style.zIndex = "-1";
        
        // Random sizes
        const size = Math.floor(Math.random() * 250) + 200; // 200px to 450px
        orb.style.width = `${size}px`;
        orb.style.height = `${size}px`;
        
        // Random initial coordinates
        orb.style.left = `${Math.random() * 100}%`;
        orb.style.top = `${Math.random() * 100}%`;
        
        // Pick random color
        orb.style.background = orbColors[i % orbColors.length];
        
        container.appendChild(orb);
        
        // Animate movement using smooth drifting coordinates
        animateOrb(orb);
    }
}

function animateOrb(orb) {
    let posX = parseFloat(orb.style.left);
    let posY = parseFloat(orb.style.top);
    
    // Random speeds
    let dx = (Math.random() * 0.04 + 0.01) * (Math.random() > 0.5 ? 1 : -1);
    let dy = (Math.random() * 0.04 + 0.01) * (Math.random() > 0.5 ? 1 : -1);
    
    function step() {
        posX += dx;
        posY += dy;
        
        // Bounce on boundaries
        if (posX < -20 || posX > 120) dx = -dx;
        if (posY < -20 || posY > 120) dy = -dy;
        
        orb.style.left = `${posX}%`;
        orb.style.top = `${posY}%`;
        
        requestAnimationFrame(step);
    }
    
    requestAnimationFrame(step);
}

// Add CSS for ripple effect dynamically
const style = document.createElement("style");
style.innerHTML = `
.button, input[type='submit'], .premium-btn, .object-tools a {
    position: relative;
    overflow: hidden;
}
.btn-ripple {
    position: absolute;
    background: rgba(255, 255, 255, 0.35);
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0);
    animation: rippleAnimation 0.6s ease-out;
    pointer-events: none;
    width: 100px;
    height: 100px;
}
@keyframes rippleAnimation {
    to {
        transform: translate(-50%, -50%) scale(4);
        opacity: 0;
    }
}
`;
document.head.appendChild(style);
