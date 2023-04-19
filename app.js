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
    //console.log(response)
    return data.ip;
};

const getIpGeodata = async (ip) => {
    const resolvedIp = await ip;
    const url = `https://geo.ipify.org/api/v2/country,city?apiKey=at_Kc5uBj4UW4W2O8VW74w4z2mCytjRC&ipAddress=${resolvedIp}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
    return data;
};

// show user info on page load
getIpGeodata(getUserIp());

// show user typed ip info on click
document.querySelector('#form-get-ip').addEventListener('submit', (e) => {
    e.preventDefault();
    getIpGeodata(getUserTypedIp())
});