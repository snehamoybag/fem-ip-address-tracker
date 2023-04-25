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

const pageLoadingSpinner = new HideAndShowElmentConstructor('#page-pre-loader');
const contentLoadingSpinner = new HideAndShowElmentConstructor('.pre-loader--content');
const formButtonIcon = new HideAndShowElmentConstructor('.app__form_btn img');

const enableContentLoadingSpinner = () => {
    formButtonIcon.hide();
    contentLoadingSpinner.show();
};

const disableContentLoadingSpinner = () => {
    contentLoadingSpinner.hide();
    formButtonIcon.show();
};

let currentQuery = '';

const getUserIp = async () => {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        // check for errors
        if (!response.ok || response.status !== 200) {
            alert('Unable to fetch Ip Address. Try again later.')
            pageLoadingSpinner.hide();
            return;
        }
        // run if no error has occured
        const data = await response.json();
        currentQuery = data.ip;
        return data.ip;
    }
    catch (error) {
        alert('Unable to connect to the server. Please check your internet connection');
        pageLoadingSpinner.hide();
    }
};

// check if the user typed query is a domain or an ip
const getQueryType = (query) => {
    const regexDomain = /^(?=.{1,255}$)([a-zA-Z0-9_-]+\.)+[a-zA-Z]{2,}$/;
    const isDomain = regexDomain.test(query);
    const queryType = (isDomain) ? 'domain': 'ipAddress';
    return queryType;
};

const getIpGeoData = async (query) => {
    // only fetch if the ip or domain is new and not empty
    if (!query || query === currentQuery) return;
    // if the ip or domain is new, set it as current ip or domain for next round
    currentQuery = query;
    enableContentLoadingSpinner();
    const resolvedQuery = await query;
    const apiServer = 'https://geo.ipify.org/api/v2/country,city';
    const apiKey = 'at_qwMr73u5xRaIaTjQbY5gzHdKf11Mx';
    let queryType = getQueryType(resolvedQuery);
    const url = `${apiServer}?apiKey=${apiKey}&${queryType}=${resolvedQuery}`;
    try {
        const response = await fetch(url);
        // check for errors
        if (!response.ok || response.status !== 200) {
            if (response.status >= 400) {
                alert('Please enter a valid domain or an IPv4/IPv6 address.');
                disableContentLoadingSpinner();
                return;
            }
            alert('Unable to get data. Try again later.')
            disableContentLoadingSpinner();
            return;
        }
        // run if no error has occured
        const data = await response.json();
        return data;
    } catch (error) {
        alert('Unable to connect to the server. Please check your internet connection.');
        disableContentLoadingSpinner();
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
let map = L.map('map', {
    zoomControl: false
});

// setup custom marker icon
const myCustomMarker = () => {
    const icon = L.icon( {
        iconUrl: 'images/icon-location.svg',
        iconSize: [46, 56]
    });
    return icon;
};

const displayIpMap = (data) => {
    try {
        const lat = data.location.lat;
        const lng = data.location.lng;
        const defaultZoom = 17;
        // update the cordinates of the map
        map.setView([lat, lng], defaultZoom);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(map);
        let marker = L.marker(
            [lat, lng],
            {
                icon: myCustomMarker()
            }
        ).addTo(map);
    } catch (error) {
        alert(error);
        disableContentLoadingSpinner();
    }
};

const displayDataAndMap = async (query) => {
    const data = await getIpGeoData(query);
    //only run the rest if data is not falsy
    if (!data) return;
    displayIpData(data);
    displayIpMap(data);
    // disable on sucessful fetchings
    pageLoadingSpinner.hide();
    disableContentLoadingSpinner();
};

// display user ip info and map location on page load
displayDataAndMap(getUserIp());
// display user typed info and map location on click
const ipForm = document.querySelector('#form-ip');
ipForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // get input value and remove the white spaces
    const userTypedQuery = ipForm.querySelector('#f-ip').value.replace(/\s+/g, '');
    displayDataAndMap(userTypedQuery);
});