// app.js
import { getFutureDescription } from "../future.js";

// compute Lorentz factor gamma for beta = v/c (beta in range (0,1))
function computeGamma(beta) {
    if (beta <= 0) return 1;
    if (beta >= 1) throw new Error("Speed must be less than 100% of c.");
    return 1 / Math.sqrt(1 - beta * beta);
}

//compute Earth time (years) given travelers years and speed % of c
function computeEarthYears(travelerYears, speedPercent) {
    if (travelerYears <= 0) throw new Error("Travelled years must be greater than 0.");
    const beta = speedPercent / 100;
    const gamma = computeGamma(beta);
    const earthYears = travelerYears * gamma;
    return {gamma, earthYears};
}

// add fractional years to a Date, ignoring leap years (1 year = 365 days)
function addYearsIgnoringLeap(date, years) {
    const days = years /365;
    const ms = days * 24 * 60 * 60 * 1000;
    return new Date(date.getTime() + ms);
}

function formatYears(y) { return Number(y).toFixed(2); }

// main convenience function: compute values and print to console
function computeAndLog(travelerYears, speedPercent, opts = {}) {
  try {
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
  } catch (err) {
    console.error("Error:", err.message);
    return null;
  }
}

async function runConsoleApp() {
    console.log("Time-dilation console app - enter values or Cancel to quit.");

    while(true) {

        const tRaw = prompt("Travel time for you (years), or Cancel to quit:");
        if (tRaw === null) {console.log("Exited"); break};

        const sRaw = prompt("Speed as % of c (e.g. 95), or Cancel to quit:");
        if (sRaw === null) { console.log("Exited."); break;}

        const t = parseFloat(tRaw);
        const s = parseFloat(sRaw);

        if (Number.isNaN(t) || Number.isNaN(s)) {
            console.log("Invalid input — please enter numeric values.");
            continue;
        }

        if (s >= 100) {
            console.log("Speed must be less than 100% of c. Try 99.999 or lower for extreme effects.");
            continue;
        }

        const result = computeAndLog(t, s);

        if (result) {
            await getFutureDescription(Math.round(result.earthYears), "realistic");
        }
        
        console.log("[Placeholder] ChatGPT future description would go here when integrated.");
        console.log("-------");

    }
}