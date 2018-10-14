// Web scraping in Node.js

// this will make it easy to make request
// to other external websites
const rp = require('request-promise');
// cheerio makes it easy to use jquery in 
// the server side to interact with doom
// elements
const cheerio = require('cheerio');
// it is going to make it easy to display
// results in the cli
const Table = require('cli-table');

// lest of users that appear in the 
// https://www.freecodecamp.org/forum/u
let users = [];
let table = new Table({
  head: ['username', 'hearts', 'challenges'],
  colWidths: [15, 5, 10],
})

// know that we can't query the url directly
// because the data are provided from external
// source 
const options = {
  // link of the api that returns the list
  // of users
  url: 'https://www.freecodecamp.org/forum/directory_items?period=weekly&order=likes_received&_=1539515955656',
  // to parse the data into json automatically
  json: true,
}

rp(options).then((data) => {
  let userData = [];
  // directory item is the array that holds 
  // the users data and names
  for (let user of data.directory_items) {
    userData.push({name: user.user.username, likes_received: user.likes_received});
  }

  // this works like console.log with our 
  // creating a new line
  process.stdout.write('loading...');
  getChallengesCompletedAndPushToUserArray(userData);
})
.catch(error => {
  console.log(error);
})

// this will go to each user and make another 
// request to get the specific user's challenges
function getChallengesCompletedAndPushToUserArray(userData) {
  let i = 0;
  function next() {
    if (i < userData.length) {
      var options = {
        url: 'https://www.freecodecamp.org/' + userData[i].name,
        transform: body => cheerio.load(body)
      }
      rp(options).then($ => {
        process.stdout.write('.');
        // cuz some of the users don't have an account
        const fccAccount = $('h1.landing-heading').length == 0;
        // the challenges are inside an element with 
        // tage of tbody that has a tr element inside 
        // it > so the number of challenges 
        // will equal to the number of elements with 
        // this id 
        if (i == 0) {
          console.log($('body tr'));
        }
        const challengesPassed = (fccAccount ? $('tbody').length : "unknown");
        // put information in the table
        table.push([userData[i].name, userData[i].likes_received, challengesPassed]);
        i++;
        return next();
      }).catch(error => {
        console.log(error);
      });
    } 
    // printing the data when you get the info
    // for all the users
    else {
      printData();
    }
  }

  return next();
}

function printData() {
  console.log("Starting");
  console.log(table.toString());
}