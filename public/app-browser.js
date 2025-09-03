// --- Time dilation functions ---

function computeGamma(beta) {
    if (beta <= 0) return 1;
    if (beta >= 1) throw new Error("Speed must be less than 100% of c.");
    return 1 / Math.sqrt(1 - beta * beta);
}

function computeEarthYears(travelerYears, speedPercent) {
    if (travelerYears <= 0) throw new Error("Travelled years must be greater than 0.");
    const beta = speedPercent / 100;
    const gamma = computeGamma(beta);
    const earthYears = travelerYears * gamma;
    return { gamma, earthYears };
}

function addYearsIgnoringLeap(date, years) {
    const days = years * 365;
    const ms = days * 24 * 60 * 60 * 1000;
    return new Date(date.getTime() + ms);
}

function formatYears(y) { return Number(y).toFixed(2); }

function computeAndLog(travelerYears, speedPercent, opts = {}) {
    const departure = opts.departureDate || new Date();
    const { gamma, earthYears } = computeEarthYears(travelerYears, speedPercent);
    const returnDate = addYearsIgnoringLeap(departure, earthYears);
    const diffYears = earthYears - travelerYears;

    return { travelerYears, speedPercent, gamma, earthYears, diffYears, returnDate };
}

// --- Fetch future description from server ---
async function getFutureDescription(year, type = "neutral") {
    try {
        const res = await fetch("/future", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ year, type })
        });

        if (!res.ok) throw new Error("Failed to fetch future description");

        const data = await res.json();
        return data.text;

    } catch (err) {
        console.error("Error fetching future description:", err);
        return "No description available.";
    }
}

function showCaptainsLog(message) {

    const form = document.getElementById('time-travel-form');
    const logContainer = document.createElement('div');

    logContainer.id = 'captains-log'; // change ID to apply styles
    logContainer.innerHTML = `
    <h1>Captain's Log</h1>
    <p id="log-content">${message}</p>
    <button id="new-entry">New Entry</button>

    <div class="planet mars"></div>
    <div class="planet earth"></div>
    <div class="planet saturn"></div>
    <div class="planet nebula"></div>
    `;

    document.body.appendChild(logContainer);

      // Add button event
    logContainer.querySelector('#new-entry').addEventListener('click', () => {
        logContainer.remove(); // remove Captain’s Log
        form.reset(); // reset form
        document.getElementById('main-content').classList.remove('hidden'); // show form again
    });
}


// --- Hook into form ---
document.getElementById("time-travel-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const loadingScreen = document.getElementById('loading-screen');
    const travelerYears = parseFloat(document.getElementById("travel-time").value);
    const speedPercent = parseFloat(document.getElementById("speed").value);
    const typeRaw = document.getElementById("response-type").value.trim() || "neutral";
    const mainContent = document.getElementById('main-content');

    loadingScreen.classList.add('active'); // show video

    // const resultsContainer = document.getElementById("results");
    // if (!resultsContainer) {
    //     const pre = document.createElement("pre");
    //     pre.id = "results";
    //     document.body.appendChild(pre);
    // }

    // const resultDisplay = document.getElementById("results");
    // resultDisplay.textContent = "Calculating…";

    try {
        const result = computeAndLog(travelerYears, speedPercent);
        const currentYear = new Date().getFullYear();
        const futureYear = currentYear + Math.round(result.diffYears) + travelerYears;

        const description = await getFutureDescription(futureYear, typeRaw);

        loadingScreen.classList.remove('active'); // show video

        // Hide original page content
        mainContent.classList.add('hidden');

        // show captains log with calcs and response details
        showCaptainsLog(`
        <ul>
            <li><strong>Traveler years:</strong> ${result.travelerYears}</li>
            <li><strong>Speed % of c:</strong> ${result.speedPercent}</li>
            <li><strong>Lorentz factor (gamma):</strong> ${result.gamma.toFixed(6)}</li>
            <li><strong>Earth years elapsed:</strong> ${result.earthYears.toFixed(2)}</li>
            <li><strong>Difference (Earth - traveler):</strong> ${result.diffYears.toFixed(2)}</li>
            <li><strong>Earth return date:</strong> ${result.returnDate.toISOString().slice(0,10)}</li>
        </ul>
        <p>🌍 <strong>Future Earth description:</strong><br>${description}</p>
        `);

    } catch (err) {
        loadingScreen.classList.remove('active'); // fade out
        resultDisplay.textContent = "Error: " + err.message;
    }
});
