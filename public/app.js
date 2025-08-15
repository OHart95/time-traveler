// app.js

// compute Lorentz factor gamma for beta = v/c (beta in range (0,1))
function computeGamma(beta) {
    if (beta <= 0) return 1;
    if (beta >= 1) throw new Error("Speed must be less than 100% of c.");
    return 1 / Math.sqrt(1 - beta * beta);
}

// compute Earth time (years) given travelers years and speed % of c
function computeEarthYears(travelerYears, speedPercent) {
    if (travelerYears <= 0) throw new Error("Travelled years must be greater than 0.");
    const beta = speedPercent / 100;
    const gamma = computeGamma(beta);
    const earthYears = travelerYears * gamma;
    return { gamma, earthYears };
}

// add fractional years to a Date, ignoring leap years
function addYearsIgnoringLeap(date, years) {
    const days = years * 365; // corrected: 1 year = 365 days
    const ms = days * 24 * 60 * 60 * 1000;
    return new Date(date.getTime() + ms);
}

function formatYears(y) { return Number(y).toFixed(2); }

// main function: compute values and log
function computeAndLog(travelerYears, speedPercent, opts = {}) {
    const departure = opts.departureDate || new Date();
    const { gamma, earthYears } = computeEarthYears(travelerYears, speedPercent);
    const returnDate = addYearsIgnoringLeap(departure, earthYears);
    const diffYears = earthYears - travelerYears;

    console.log(`\nYou travel for ${formatYears(travelerYears)} years at ${formatYears(speedPercent)}% of c.`);
    console.log(` → For you: ${formatYears(travelerYears)} years.`);
    console.log(` → For Earth: ${formatYears(earthYears)} years.`);
    console.log(` → Difference (Earth - you): ${formatYears(diffYears)} years.`);
    console.log(` → Earth return date (ignoring leap years): ${returnDate.toISOString().slice(0,10)}`);
    console.log(` → Lorentz factor (gamma): ${gamma.toFixed(6)}`);

    return { travelerYears, speedPercent, gamma, earthYears, diffYears, returnDate };
}

// new: fetch future description from server
async function getFutureDescription(year, type = "neutral") {
    try {
        const res = await fetch("/future", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ year, type })
        });

        if (!res.ok) throw new Error("Failed to fetch future description");

        const data = await res.json();
        //console.log(`🌍 Future Earth for year ${year}:`, data.text);
        return data.text;

    } catch (err) {
        console.error("Error fetching future description:", err);
        return null;
    }
}

// console app
async function runConsoleApp() {
    console.log("Time-dilation console app - enter values or Cancel to quit.");

    while (true) {
        const tRaw = prompt("Travel time for you (years), or Cancel to quit:");
        if (tRaw === null) { console.log("Exited"); break; }

        const sRaw = prompt("Speed as % of c (e.g. 95), or Cancel to quit:");
        if (sRaw === null) { console.log("Exited."); break; }

    let typeRaw = prompt("Description type (e.g., optimistic, neutral, pessimistic), or Cancel to skip:");
        if (typeRaw === null || typeRaw.trim() === "") {
            console.log("Skipped description type. Using default: neutral.");
            typeRaw = "neutral"; // default if skipped
        }

        const t = parseFloat(tRaw);
        const s = parseFloat(sRaw);

        if (Number.isNaN(t) || Number.isNaN(s)) {
            console.log("Invalid input — please enter numeric values.");
            continue;
        }

        if (s >= 100) {
            console.log("Speed must be less than 100% of c.");
            continue;
        }

        const result = computeAndLog(t, s);

        if (result) {
            const currentYear = new Date().getFullYear();
            const futureYear = currentYear + Math.round(result.diffYears); // add Earth-years difference to now
            const description = await getFutureDescription(futureYear, typeRaw || "neutral");
            if (description) console.log("Future Earth description:\n", description);
        }


        console.log("-------");
    }
}
