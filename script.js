// Array of available image assets
const images = [
    "Amused.png",
    "Angry.png",
    "Chill.png",
    "Confused.png",
    "Curious.png",
    "Happy.png",
    "Sad.png",
    "Sour.png",
    "Surprised.png"
];

// Configuration
const IMAGE_HEIGHT = 90; // Corresponds to .reel img height in CSS
const IMAGE_MARGIN = 10; // Corresponds to .reel img margin-bottom in CSS
const IMAGE_TOTAL_HEIGHT = IMAGE_HEIGHT + IMAGE_MARGIN;
const REEL_ITEM_COUNT = images.length;
const SPIN_DURATION = 1000; // ms, should match CSS transition duration
const LOOPS_BEFORE_STOP = 5; // How many full loops before stopping

// Get references to the HTML elements
const reelImages1 = document.getElementById('reelImages1');
const reelImages2 = document.getElementById('reelImages2');
const reelImages3 = document.getElementById('reelImages3');
const spinButton = document.getElementById('spinButton');
const slotMachine = document.querySelector('.slot-machine'); // Get reference to the machine itself

/**
 * Returns a random integer between 0 (inclusive) and max (exclusive).
 * @param {number} max - The upper bound (exclusive).
 * @returns {number} A random integer.
 */
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

/**
 * Populates a reel container with image elements.
 * @param {HTMLElement} reelContainer - The container element (e.g., reelImages1).
 * @param {string[]} imageArray - The array of image source paths.
 */
function populateReel(reelContainer, imageArray) {
    // Clear existing content
    reelContainer.innerHTML = '';

    // Add images multiple times for seamless looping effect (at least LOOPS_BEFORE_STOP + 1)
    const totalLoops = LOOPS_BEFORE_STOP + 2; // Ensure enough images for the spin
    for (let loop = 0; loop < totalLoops; loop++) {
        // Shuffle images within each loop for visual variety during spin (optional)
        const shuffledImages = [...imageArray].sort(() => Math.random() - 0.5);
        shuffledImages.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = src.split('.')[0]; // Basic alt text
            img.loading = 'lazy'; // Improve initial load performance
            reelContainer.appendChild(img);
        });
    }
}

/**
 * Spins a single reel to a specific final index.
 * @param {HTMLElement} reelContainer - The container element (e.g., reelImages1).
 * @param {number} finalIndex - The index (0 to REEL_ITEM_COUNT - 1) where the reel should stop.
 * @returns {Promise<string>} A promise that resolves with the final image source when the spin animation completes.
 */
function spinReel(reelContainer, finalIndex) {
    return new Promise(resolve => {
        const finalImageSrc = images[finalIndex]; // Get the source corresponding to the index

        // Calculate target position:
        // - Go past the initial images (1 full loop)
        // - Spin through LOOPS_BEFORE_STOP full loops
        // - Land on the finalIndex within the next loop
        const targetOffset = (LOOPS_BEFORE_STOP * REEL_ITEM_COUNT + finalIndex) * IMAGE_TOTAL_HEIGHT;

        // Ensure smooth transition is enabled
        reelContainer.style.transition = `transform ${SPIN_DURATION / 1000}s cubic-bezier(0.33, 1, 0.68, 1)`;
        reelContainer.style.transform = `translateY(-${targetOffset}px)`;

        // Use setTimeout to wait for the transition to end
        setTimeout(() => {
            // --- Reset position to avoid infinitely growing translateY ---
            // 1. Disable transition for instant snap
            reelContainer.style.transition = 'none';

            // 2. Calculate the equivalent position within the *first* set of images
            const resetOffset = finalIndex * IMAGE_TOTAL_HEIGHT;
            reelContainer.style.transform = `translateY(-${resetOffset}px)`;

            // 3. Force reflow/repaint (read offsetHeight) - browser trick
            reelContainer.offsetHeight; // Don't assign this, just access it

            // 4. Re-enable transition for future spins (done implicitly in next spin or can be set here)
            // reelContainer.style.transition = `transform ${SPIN_DURATION / 1000}s cubic-bezier(0.33, 1, 0.68, 1)`;

            resolve(finalImageSrc); // Signal completion and return the final image source
        }, SPIN_DURATION);
    });
}


/**
 * Handles the main spin button click event.
 */
async function handleSpin() {
    spinButton.disabled = true;

    // Generate final random indices for each reel
    const finalIndex1 = getRandomInt(REEL_ITEM_COUNT);
    const finalIndex2 = getRandomInt(REEL_ITEM_COUNT);
    const finalIndex3 = getRandomInt(REEL_ITEM_COUNT);

    // Spin all reels concurrently
    await Promise.all([
        spinReel(reelImages1, finalIndex1),
        spinReel(reelImages2, finalIndex2),
        spinReel(reelImages3, finalIndex3)
    ]);

    // Results contains the final image sources from each reel
    const [result1, result2, result3] = results;

    // Check for win conditions after all reels stop
    checkWin(result1, result2, result3);

    spinButton.disabled = false;
}

/**
 * Checks if the spin resulted in a win and provides feedback.
 * @param {string} img1 - Source of the final image on reel 1.
 * @param {string} img2 - Source of the final image on reel 2.
 * @param {string} img3 - Source of the final image on reel 3.
 */
function checkWin(img1, img2, img3) {
    // Remove previous win indication
    slotMachine.classList.remove('win');

    if (img1 === img2 && img2 === img3) {
        // Add win indication class
        slotMachine.classList.add('win');
        // Use setTimeout to allow the UI to update before the alert
        setTimeout(() => {
            alert(`🎉 JACKPOT! You won with ${img1.split('.')[0]}! 🎉`);
        }, 100); // Small delay
    } else {
        // Optional: Add logic for other win conditions (e.g., two matching)
        console.log("No win this time.");
    }
}

// --- Initialization ---
function initializeSlotMachine() {
    // Remove any win class on load
    slotMachine.classList.remove('win');

    // Populate reels on load
    populateReel(reelImages1, images);
    populateReel(reelImages2, images);
    populateReel(reelImages3, images);

    // Set initial position (optional, start at the first image)
    reelImages1.style.transform = `translateY(0px)`;
    reelImages2.style.transform = `translateY(0px)`;
    reelImages3.style.transform = `translateY(0px)`;

    // Add event listener to the spin button
    spinButton.addEventListener('click', handleSpin);
}

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', initializeSlotMachine);
