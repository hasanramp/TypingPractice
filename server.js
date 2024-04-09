const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const TypingPractice = require('./TypingPractice')
const fileReader = require('fs')

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set('view engine', 'ejs');
let wordsStr = ''
let wordsList = []
const get_random_words = function(words, numberOfWords) {
    let words_str = ''
    for (let i = 0; i < numberOfWords; i++) {

        let item = words[Math.floor(Math.random()*words.length)];
        words_str = words_str + ' ' + item
    }
    return words_str
    
}
const get_random_words_list = function(words, numberOfWords) {
    let words_list = []
    let words_str = ''
    for (let i = 0; i < numberOfWords; i++) {

        let item = words[Math.floor(Math.random()*words.length)];
//        item = item + ' '
        words_list.push(item);
        words_str = words_str + ' ' + item
    }
    return [words_list, words_str];
    
}

let wordsObj;

app.get('/', (req, res) => {
    
    let cookie = req.cookies.config;
    let config;
    if (cookie === undefined) {
        let randomNumber=Math.random().toString();
        randomNumber=randomNumber.substring(2,randomNumber.length);
        res.cookie('config', `{${randomNumber}},35,easy`);
        config = [35, 'easy'];
        console.log('There are no cookies')
    }else {
        const cookieParsed = cookie.split(',')
        config = [parseInt(cookieParsed[1]), cookieParsed[2]]
    }
    const difficulty = config[1]
    const nOfWords = config[0]
    let fileName;
    if (difficulty === 'easy') {
        fileName = './easy_difficulty.txt'
    }else {
        fileName = './words.txt'
    }
    console.log(fileName)
    const words_file = fileReader.readFileSync(fileName);
    // gets words from words.txt file and makes an array of those words
    const words = words_file.toString('utf8').split(',')
    //const words_str = get_random_words(words, nOfWords)
    let wordsData= get_random_words_list(words, nOfWords)
    wordsList = wordsData[0]
    wordsStr = wordsData[1]
    
    wordsObj = {
        text : wordsList
    }
    res.render('index', {words: wordsObj})
})

app.post('/result', (req, res) => {
    /* This is how we get the input text
        and time. When the form is submitted, it submits the body's
        html and app is using body parser. see line 3 and 6
        the req object has a body attribute which has a wordsInput attribute as well as a timetaken attribute
        the last two attributes are from the name or id (not sure) of the html Elements
        the html input element which has the word's string has the id wordsInput and the element which has time
        has the id timeTaken
        see index.ejs
    */
    const inputText = req.body.wordsInputFinal;
    console.log('input text', inputText)
    const timeTaken = req.body.timeTaken;
    let resultArr = TypingPractice.TypingPractice(inputText, wordsStr, parseInt(timeTaken)).getTypingData()
    let incorrectWords = ''
    for (let i = 0; i < resultArr[2].length - 1; i++) {
        incorrectWords += resultArr[2][i] + ', '
    }
    let result = {
        wpm: resultArr[0],
        accuracy: resultArr[1],
        incorrectWords: incorrectWords,
        timeTaken: timeTaken,
    }
    console.log(result)
    res.render('result', { result: result });
})

app.get('/configure', (req, res) => {
    res.render('configure')
})
app.get('/limited', (req, res) => {
    res.render('limitedTime')
})

app.post('/addCookie', (req, res) => {
    const nOfChar = req.body.nOfChar;
    console.log(nOfChar, req.body.difficulty)
    let randomNumber=Math.random().toString();
    randomNumber=randomNumber.substring(2,randomNumber.length);
    res.cookie('config', `{${randomNumber}},${parseInt(nOfChar)},${req.body.difficulty}`);
    res.send('configuration finished <a href="/">back</a>')
})
app.listen(8000)