'use strict';

function HideAndShowElmentConstructor(el) {
    const elm = document.querySelector(el);
    this.show = () => {
        elm.classList.remove('hide');
    }
    this.hide = () => {
        elm.classList.add('hide');
    }
};

const contentLoadingSpinner = new HideAndShowElmentConstructor('.pre-loader--content');
const formButtonIcon = new HideAndShowElmentConstructor('.app__form_btn img');


let currentIp = '';

const getUserIp = async () => {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        // check for errors
        if (!response.ok || response.status !== 200) {
            alert('Unable to fetch Ip Address. Try again later.')
            return;
        }
        // run if no error has occured
        const data = await response.json();
        currentIp = data.ip;
        return data.ip;
    }
    catch (error) {
        alert(error.messages);
    }
};

const getIpGeoData = async (ip) => {
    // only fetch if the ip is new and not empty
    if (!ip || ip === currentIp) return;
    // if the ip is new, set it as current ip for next round
    currentIp = ip;
    try {
        // add loading spinner
        formButtonIcon.hide();
        contentLoadingSpinner.show();
        const resolvedIp = await ip;
        const url = `https://geo.ipify.org/api/v2/country,city?apiKey=at_Kc5uBj4UW4W2O8VW74w4z2mCytjRC&ipAddress=${resolvedIp}`;
        const response = await fetch(url);
        // check for errors
        if (!response.ok || response.status !== 200) {
            if (response.status === 422) {
                alert('Please type a valid IPv4 or IPv6 address.');
                // remove loading spinner
                contentLoadingSpinner.hide();
                formButtonIcon.show();
                return;
            }
            alert('Unable to get IP address data. Try again later.')
            // remove loading spinner
            contentLoadingSpinner.hide();
            formButtonIcon.show();
            return;
        }
        // run if no error has occured
        const data = await response.json();
        return data;
    } catch (error) {
        alert(error.messages);
        // remove loading spinner
        contentLoadingSpinner.hide();
        formButtonIcon.show();
    }
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
    try {
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
    } catch (error) {
        alert(error.messages);
        // remove loading spinner
        contentLoadingSpinner.hide();
        formButtonIcon.show();
    }
};

const displayDataAndMap = async (ip) => {
    const data = await getIpGeoData(ip);
    //only run the rest if data is not falsy
    if (!data) return;
    displayIpData(data);
    displayIpMap(data);
    // remove page loading animation
    document.querySelector('#page-pre-loader').classList.add('hide');
    // remove loading spinner
    contentLoadingSpinner.hide();
    formButtonIcon.show();
};

// display user ip info and map location on page load
displayDataAndMap(getUserIp());
// display user typed info and map location on click
const ipForm = document.querySelector('#form-ip');
ipForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // get input value and remove the white spaces
    const userTypedIp = ipForm.querySelector('#f-ip').value.replace(/\s+/g, '');
    displayDataAndMap(userTypedIp);
});