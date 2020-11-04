//Load required libraries 
const express = require('express');
const handlebars = require('express-handlebars');
const fetch = require('node-fetch');
const withQuery = require('with-query').default;


//Configure enviroment 
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000;
const API_KEY = process.env.API_KEY || "";


//Configure Express and handlebars 
const app = express();
app.engine('hbs', handlebars({ defaultLayout: 'default.hbs' }))
app.set('view engine', 'hbs');

//Configure the API
/*
https://api.giphy.com/v1/gifs/search
?api_key=NDHujC2vlZtOHDs0v7xs9iOqgCBeu7ro&q=troll&limit=25&offset=0&rating=g&lang=en
*/
const ENDPOINT = 'https://api.giphy.com/v1/gifs/search?'
const url = (term) => withQuery(ENDPOINT, {
    api_key:API_KEY,
    q: term,
    limit: 5,
})


//Configure the middlewares
app.get("/", (req,res) => {
    res.status(200),
    res.format({
        'text/html': () => {res.render('index')}
    })
})

app.get("/search", async (req,res) => {
    res.status(200);
    let searchTerm = req.query['searchTerm'];
    let resp = await fetch(url(searchTerm));
    let respJson = await resp.json();
    let gifArray = [];

    /*
    for(let i=0; i< respJson.data.length; i++){
        const title = respJson.data[i].title;
        const url = respJson.data[i].images.fixed_width.url;
        gifArray.push({title,url}); 
    }
    */ 

    //A better way to write the above block is using the map function. 
    gifArray = respJson.data.map(i => {
        return { title: i.title, url: i.images.fixed_width.url }
    })


    res.type('text/html')
    res.render('results',{
        gifArray, //gifArray is an array of objects with keys of title and url
        hasContent: gifArray.length > 0
        //hasContent: !!gifArray.length
         
    });

})

app.use(express.static(__dirname + '/static'))

//Start express (if API_KEY is provided)
if (API_KEY) {
app.listen(PORT, () => {console.info(`mygiphy app started on port ${PORT} at ${new Date()}`)})
}else {console.error('Please enter a valid API KEY')} 