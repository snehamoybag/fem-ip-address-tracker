'use strict';

// APP LOGIC //
// get user ip
// use user ip to fetch and display data on page load
// get user typed ip
// use user typed ip to fetch and display updated data on click

const getUserIp = async () => {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
};

const getIpGeoData = async (ip) => {
    const resolvedIp = await ip;
    const url = `https://geo.ipify.org/api/v2/country,city?apiKey=at_Kc5uBj4UW4W2O8VW74w4z2mCytjRC&ipAddress=${resolvedIp}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

const displayIpData = (data) => {
    const displayIpAddress = document.querySelector('#user-ip-address');
    const displayLocation = document.querySelector('#user-location');
    const displayTimeZone = document.querySelector('#user-time-zone');
    const displayISP = document.querySelector('#user-isp');
    // display data
    displayIpAddress.textContent = data.ip;
    displayLocation.textContent = `${data.location.region}, ${data.location.city} ${data.location.postalCode}`;
    displayTimeZone.textContent = `UTC ${data.location.timezone}`;
    displayISP.textContent = data.isp;
};

// initialize leafletjs map container on page load (add DOM element of map)
let map = L.map('map');

const displayIpMap = (data) => {
    const lat = data.location.lat;
    const lng = data.location.lng;
    const defaultZoom = 15;
    // update the cordinates of the map
    map.setView([lat, lng], defaultZoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    let marker = L.marker([lat, lng]).addTo(map);
};

// show and hide loading animation
const runPageLoading = (data) => {
    const loadingEl = document.querySelector('#loading');
    (data) ? loadingEl.classList.add('hide'): loadingEl.classList.remove('hide');
}

const displayDataAndMap = async (ip) => {
    const data = await getIpGeoData(ip);
    //console.log(data);
    runPageLoading(data);
    displayIpData(data);
    displayIpMap(data);
};

// display user ip info and map location on page load
displayDataAndMap(getUserIp());
// display user typed info and map location on click
const ipForm = document.querySelector('#form-ip');
ipForm.addEventListener('submit', (e) => {
    const userTypedIp = ipForm.querySelector('#f-ip').value;
    e.preventDefault();
    displayDataAndMap(userTypedIp);
});