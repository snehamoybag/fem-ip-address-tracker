'use strict';

let currentIp = '';

const getUserIp = async () => {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    currentIp = data.ip;
    return data.ip;
};

const getIpGeoData = async (ip) => {
    // only fetch if the ip is new and not empty
    if (!ip || ip === currentIp) return;
    // if the ip is new, set it as current ip for next round
    currentIp = ip;
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

const displayDataAndMap = async (ip) => {
    const data = await getIpGeoData(ip);
    //only run the rest if data is not falsy
    if (!data) return;
    displayIpData(data);
    displayIpMap(data);
    // remove page loading animation
    document.querySelector('#page-pre-loader').classList.add('hide');
};

// display user ip info and map location on page load
displayDataAndMap(getUserIp());
// display user typed info and map location on click
const ipForm = document.querySelector('#form-ip');
ipForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userTypedIp = ipForm.querySelector('#f-ip').value;
    displayDataAndMap(userTypedIp);
});