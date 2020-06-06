const Discord = require('discord.js');
const cheerio = require('cheerio');
const axios = require('axios');

const file_saver = require('fs');
const user_names = require('./user_names.json');

const bot = new Discord.Client(); 
let message;

token = 'NzEzOTk0NDk4OTI1MDAyNzUy.XsrfNA.Tt50utsHvcNAdUuiMqusdo1kjCA'

bot.on('ready',()=>console.log(' bot ready '));
bot.on('message',(_message)=>{

    message = _message;

    let content = message.content.split(' ');
    const name = content[1];

    if(content[0] === '!user'){
        // calls on a method that fetchs data from leetcode
        getScore(content[1]);
    }
    else if(content[0] === '!save'){
        // if user is in our database
        // ignores the process fo adding user  
        if(userExists(content[1])){
            message.channel.send(content[1]+' is already in.');
        }
        else{
            addUser(content[1]);
        }
    }
    else if(content[0] == '!start'){
        // every message has an uthor from wich we can gather their user name
        // console.log(message.author.username +' '+ message.author.discriminator);
        if(message.author.username == 'gutuu' && message.author.discriminator == '1009'){
            startContest();
        }
    }
    else if(content[0] == '!board'){
        buildBoard();
    }
});

// this starts the contest by:
// initializing each users score. this score is (number of problems a user has sovled sofar on leetcode)
// 
function startContest(){

    // since we use axios.get() to fetch we have to wait for it to finish before saving it to a file
    // therefore, counter keeps count of how many users initial score has been regestired.
    // if it equals to number of registred users we proceed to save the initial state to a json file.
    let counter = 0;
    // update the starting score of each user.
    user_names.forEach(name=>{
        (async() => {
            try {
                const response = await axios.get('https://www.leetcode.com/'+name.leet_name);
                const $ = cheerio.load(response.data);
                let str = '.list-group-item';
                let score = $(str).children().eq(2).html().trim('\n').split('/');
                name.startingScore = (score.length<2)?0:parseInt(score[0]);
               counter++;
               if(counter==user_names.length){
                let jsonData = JSON.stringify(user_names);
                file_saver.writeFile("user_names.json", jsonData, function(err) {
                    if (err) {
                        console.log(err);
                    }
                });
               }
            } catch (error) {
                console.log('error_____'+name.leet_name+' '+error)
            
            } 
        })();
    });
}

// gets the total accepted score from leetcode the user has ever done
// 
function getScore(name) {
     // use axios for http request.
     axios.get('https://www.leetcode.com/'+name).then((res)=>{
        
        const $ = cheerio.load(res.data);   // response.data is an html text
                                            // that can be parsed using cheerio
        let str = '.list-group-item';
        let score = $(str).children().eq(2).html().trim('\n').split('/');
        score = (score.length<2)?0:parseInt(score[0]);
        // console.log(name+' has solved '+score+' problems!');
        message.channel.send(name+' has solved '+score+' problems!');
        return 0;
    })
    .catch(error =>{ 
        // for some reason even whent it succeeds, some error gets caught.
        // This has to do with the way asnycrkmdfsdfsdf wroks.
        // therefore, we only catch an error that occurs because of 404.
        if(!(error instanceof ReferenceError)){
            message.channel.send(name+' is not on leetcode');
        }
    });
}

// checks if the user exist in our json file.
function userExists(leet_name) {
    for(let i =0; i<user_names.length; i++){
        if(user_names[i].leet_name == leet_name){
            return true;
        }
    }
    return false;
}

// add user to the database
function addUser(name){
   
    axios.get('https://www.leetcode.com/'+name)
    .then((res)=>{
        
        const $ = cheerio.load(res.data);   // response.data is an html text
                                            // that can be parsed using cheerio
        let str = '.list-group-item';
        let score = $(str).children().eq(2).html().trim('\n').split('/');
        score = (score.length<2)?0:parseInt(score[0]);

        let user = new User(name,score);
        // file saver
        // console.log(user_names);
        let usern = JSON.stringify(user);
        console.log(user_names.push(user));
        console.log(user_names);
        let jsonData = JSON.stringify(user_names);
        file_saver.writeFile("user_names.json", jsonData, function(err) {
            if (err) {
                console.log(err);
            }
            else{
                message.channel.send(name+' whose current score is '+score +' is added.');
            }
        });
    })
    .catch(error =>{ 
        // for some reason even whent it succeeds, some error gets caught.
        // This has to do with the way asnycrkmdfsdfsdf wroks.
        // therefore, we only catch an error that occurs because of 404.
        if(!(error instanceof ReferenceError)){
            message.channel.send(name+' is not on leetcode');
        }
    });
    
}

/**
 * builds a leader board.
 * before this is excuted. !save <user> and !start must be excuted.
 */

function buildBoard(){
    let leader_board = '';
    let board = [];
    let counter = 0;
    for (let i = 0; i < user_names.length; i++) {
       // console.log(name);
        (async() => {
            try {
                const response = await axios.get('https://www.leetcode.com/'+user_names[i].leet_name);
                const $ = cheerio.load(response.data);
                let str = '.list-group-item';
                let score = $(str).children().eq(2).html().trim('\n').split('/');
                score = (score.length<2)?0:parseInt(score[0]);
               let user = new User(user_names[i].leet_name,score-user_names[i].startingScore);
               board.push(user);
               counter++;
               if(counter==user_names.length){
                   console.log('this is how many times its equal');
                   board.sort(function(user1,user2) {
                       if(user1.startingScore>user2.startingScore){
                           return -1;
                       }
                       else{
                           return 1;
                       }
                   });
                   for (let index = 0; index < counter; index++) {
                      leader_board += ' '+board[index].leet_name +' : '+ board[index].startingScore+'\n';                     
                   }
                   // after build send the board to channel
                  message.channel.send(leader_board);
                   // console.log('195 '+leader_board);
               }
            } catch (error) { 
                // sometimes returns Erro: Request failed with status code 429
                // thi occurs because too many request is being made
                console.log('error_'+error)
            }
        })();
    }
    // console.log('205'+leader_board)
}

// a class to create a user object to be stored in our json file (database).
class User{
    constructor(lit_name,startingScore){
        this.leet_name = lit_name;
        this.startingScore = startingScore;
    }
}
bot.login(token);