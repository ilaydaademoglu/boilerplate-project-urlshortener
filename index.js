require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { application, response } = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyparser = require('body-parser');


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyparser.urlencoded({extended:false}))
app.use(bodyparser.json())

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

let urlSchema = new mongoose.Schema({
  originalUrl: {type: String, required: true},
  shortUrl: {type: Number}
})

let urlModel = mongoose.model('URL', urlSchema);

app.post('/api/shorturl', function(req,res){
  let inputUrl = req.body.url;
  let inputShort = 1;
  urlModel.findOne({})
  .sort({shortUrl : 'desc'})
  .exec((error,result)=>{
    if(!error&& result != undefined){
      inputShort = result.shortUrl + 1;
    } //updating the short  value, maximum short value
    if (!error) {
      urlModel.findOneAndUpdate(
        { originalUrl: inputUrl },
        { originalUrl: inputUrl, shortUrl: inputShort },
        { new: true, upsert: true },
        (error, savedUrl) => {
          if (!error) {
            res.json({original_url: inputUrl, short_url: savedUrl.shortUrl});
          }
        }
      );
    }
  });
})

app.get('/api/shorturl/:shorturl', function (req,res) {
  let originalUrl;
  urlModel.findOne({shortUrl : req.params.shorturl}, function (error, result){
    if(!error && result != undefined){
      res.redirect(result.originalUrl);
    }
    else{
      res.json('URL not found');
    }
  })
})