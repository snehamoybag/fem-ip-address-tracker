'use strict';

// APP LOGIC //
// get user ip
// use user ip to fetch and display data on page load
// get user typed ip
// use user typed ip to fetch and display updated data on click

const getUserTypedIp = () => { };

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

const displayIpGeoData = async (ip) => {
    const displayIpAddress = document.querySelector('#user-ip-address');
    const displayLocation = document.querySelector('#user-location');
    const displayTimeZone = document.querySelector('#user-time-zone');
    const displayISP = document.querySelector('#user-isp');
    // get ip data
    const data = await getIpGeoData(ip);
    console.log(data);
    // display data
    displayIpAddress.textContent = data.ip;
    displayLocation.textContent = `${data.location.region}, ${data.location.city} ${data.location.postalCode}`;
    displayTimeZone.textContent = `UTC ${data.location.timezone}`;
    displayISP.textContent = data.isp;
};

// display ip info on page load
displayIpGeoData(getUserIp());