const API_KEY = 'kVBXO7R76SwS8bbEwtYcNo7zlXn5bmxmZc2Bf7ns';
const API_URL = `https://api.nasa.gov/insight_weather/?api_key=${API_KEY}&feedtype=json&ver=1.0`

const previousWeatherToggle = document.querySelector('.show-previous-weather');

//Current sol data
const previousWeather = document.querySelector('.previous-weather');
const currentSolElement = document.querySelector('[data-current-sol]');
const currentDateElement = document.querySelector('[data-current-date]');
const currentTempHighElement = document.querySelector('[data-curent-temp-high]');
const currentTempLowElement = document.querySelector('[data-curent-temp-low]');
const windSpeedElement = document.querySelector('[data-wind-speed]');
const windDirectionTextElement = document.querySelector('[data-wind-direction-text]');
const windDirectionArrowElement = document.querySelector('[data-wind-direction-arrow]');
//Previous sols data
const previousSolTemplateElement = document.querySelector('[data-previous-sol-template]');
const previousSolContainerElement = document.querySelector('[data-previous-sols]');
//toggle
const unitToggle = document.querySelector('[data-unit-toggle]');
const metricRadio = document.getElementById('cel');
const imperialRadio = document.getElementById('fah')

previousWeatherToggle.addEventListener('click', () => {
    previousWeather.classList.toggle('show-weather');
})
let selectedSolIndex;

getWeather().then(sols => {
    selectedSolIndex = sols.length - 1
    displaySelectedSol(sols);
    displayPreviousSols(sols);
    updateUnits();

    unitToggle.addEventListener('click', () => {
        let metricUnits = !isMetric();
        metricRadio.checked = metricUnits;
        imperialRadio.checked = !metricUnits;
        displaySelectedSol(sols);
        displayPreviousSols(sols);
        updateUnits();
    })
});

metricRadio.addEventListener('change', () => {
    displaySelectedSol(sols);
    displayPreviousSols(sols);
    updateUnits();
})

imperialRadio.addEventListener('change', () => {
    displaySelectedSol(sols);
    displayPreviousSols(sols);
    updateUnits();
})

function displayPreviousSols(sols) {
    previousSolContainerElement.innerHTML = '';
    sols.forEach((solData, index) => {
        //Clone everything what is inside of template element.
        const solContainer = previousSolTemplateElement.content.cloneNode(true);
        solContainer.querySelector('[data-sol]').innerText = solData.sol;
        solContainer.querySelector('[data-date]').innerText = displayDate(solData.date);
        solContainer.querySelector('[data-temp-high]').innerText = displayTemperature(solData.maxTemp);
        solContainer.querySelector('[data-temp-low]').innerText = displayTemperature(solData.minTemp);
        solContainer.querySelector('[data-select-button]').addEventListener('click', () => {
            selectedSolIndex = index;
            displaySelectedSol(sols);
        })
        previousSolContainerElement.appendChild(solContainer);
    })
}

function displayDate(date) {
    return date.toLocaleDateString(
        undefined,
        {day: 'numeric', month: 'long'}
    );
}

function displayTemperature(temperature) {
    let returnTemp = temperature;
    if (!isMetric()) {
        returnTemp = (temperature - 32) * (5 / 9);
    }
    return Math.round(returnTemp);
}

function displaySpeed(speed) {
    let returnSpeed = speed;
    if (!isMetric()) {
        returnSpeed = speed / 1.609;
    }
    return Math.round(returnSpeed);
}

function displaySelectedSol(sol) {
    const selectedSol = sol[selectedSolIndex];
    currentSolElement.innerText = selectedSol.sol;

    currentDateElement.innerText = displayDate(selectedSol.date);
    currentTempHighElement.innerText = displayTemperature(selectedSol.maxTemp);
    currentTempLowElement.innerText = displayTemperature(selectedSol.minTemp);
    windSpeedElement.innerText = displaySpeed(selectedSol.windSpeed);
    windDirectionArrowElement.style.setProperty('--direction', `${selectedSol.windDirectionDegrees}deg`);
    windDirectionTextElement.innerText = selectedSol.windDirectionCardinal;
}

function getWeather() {
    return fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            const {
                sol_keys,
                validity_checks,
                ...solData
            } = data;
            return Object.entries(solData).map(([sol, data]) => {
                return {
                    sol: sol,
                    maxTemp: `${data.AT ? data.AT.mx : 'N/A'}`,
                    minTemp: `${data.AT ? data.AT.mn : 'N/A'}`,
                    windSpeed: `${data.HWS ? data.HWS.av : 'N/A'}`,
                    windDirectionDegrees: `${data.WD.most_common ? data.WD.most_common.compass_degrees : 'N/A'}`,
                    windDirectionCardinal: `${data.WD.most_common ? data.WD.most_common.compass_point : 'N/A'}`,
                    date: new Date(data.First_UTC)
                }
            })
        })
}

function updateUnits() {
    const speedUnits = document.querySelectorAll('[data-wind-units]');
    const tempUnits = document.querySelectorAll('[data-temp-units]');
    speedUnits.forEach(unit => {
        unit.innerText = isMetric() ? 'kph' : 'mph';
    })
    tempUnits.forEach(unit => {
        unit.innerText = isMetric() ? '°C' : '°F';
    })
}

function isMetric() {
    return metricRadio.checked;
}