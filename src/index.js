const express = require('express');
const config = require('./config');
const axios = require('axios');
const qs = require('qs');
const path = require('path');
const fs = require('fs');

const app = express();

getFullSites().then(() => {
  console.log('All data collected (see "data.txt")');
});

app.listen(config.port, () => {
  console.log(`App is listening on port ${config.port}`);
});

async function getSites(iDisplayStart, iDisplayLength) {
  return new Promise((resolve, reject) => {
    const queryParams = {
      sEcho: 6,
      iColumns: 4,
      iDisplayStart: iDisplayStart,
      iDisplayLength: iDisplayLength,
      mDataProp_0: 0,
      mDataProp_1: 1,
      mDataProp_2: 2,
      mDataProp_3: 3,
      bRegex: false,
      bRegex_0: false,
      bSearchable_0: true,
      bRegex_1: false,
      bSearchable_1: true,
      bRegex_2: false,
      bSearchable_2: true,
      bRegex_3: false,
      bSearchable_3: true,
      iSortCol_0: 0,
      sSortDir_0: 'asc',
      iSortingCols: 1,
      bSortable_0: true,
      bSortable_1: true,
      bSortable_2: true,
      bSortable_3: true
    };
    const method = 'get';
    const queryParamsStr = qs.stringify(queryParams, { addQueryPrefix: true });
    const url = `${config.apiUrl}${queryParamsStr}`;
    axios({ method, url })
      .then(res => {
        const sites = res?.data?.aaData ?? [];
        const preparedSites = sites.map(site => {
          return {
            rank: site[0],
            domain: site[1],
            openPageRank: site[2].replace(/(<small>|<\/small>)/gm, ''),
            extension: site[3]
          };
        });
        resolve(preparedSites);
      })
      .catch(() => {
        resolve([]);
      });
  });
}

async function getSitesWithDelay(iDisplayStart, iDisplayLength) {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const sites = await getSites(iDisplayStart, iDisplayLength);
      resolve(sites);
    }, 3000);
  });
}

async function getFullSites() {
  for (let i = 99; i < 100; i += 1) {
    console.log(`Iteration ${i} started`);
    const sites = await getSitesWithDelay(i * 100000, 100000);
    const data = sites.reduce((acc, site) => {
      const siteStr = `${site.rank};${site.domain};${site.openPageRank};${site.extension}\n`;
      return acc + siteStr;
    }, '');
    const filePath = path.join(__dirname, 'data.txt');
    fs.appendFileSync(filePath, data);
    console.log(`Iteration ${i} finished`);
  }
}
