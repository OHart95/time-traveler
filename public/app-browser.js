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

// --- Hook into form ---
document.getElementById("time-travel-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const travelerYears = parseFloat(document.getElementById("travel-time").value);
    const speedPercent = parseFloat(document.getElementById("speed").value);
    const typeRaw = document.getElementById("response-type").value.trim() || "neutral";

    const resultsContainer = document.getElementById("results");
    if (!resultsContainer) {
        const pre = document.createElement("pre");
        pre.id = "results";
        document.body.appendChild(pre);
    }

    const resultDisplay = document.getElementById("results");
    resultDisplay.textContent = "Calculating…";

    try {
        const result = computeAndLog(travelerYears, speedPercent);
        const currentYear = new Date().getFullYear();
        const futureYear = currentYear + Math.round(result.diffYears);

        const description = await getFutureDescription(futureYear, typeRaw);

        resultDisplay.textContent =
            `Traveler years: ${result.travelerYears}\n` +
            `Speed % of c: ${result.speedPercent}\n` +
            `Lorentz factor (gamma): ${result.gamma.toFixed(6)}\n` +
            `Earth years elapsed: ${result.earthYears.toFixed(2)}\n` +
            `Difference (Earth - traveler): ${result.diffYears.toFixed(2)}\n` +
            `Earth return date: ${result.returnDate.toISOString().slice(0,10)}\n\n` +
            `🌍 Future Earth description:\n${description}`;

    } catch (err) {
        resultDisplay.textContent = "Error: " + err.message;
    }
});
