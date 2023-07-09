// Install necessary packages: express, nodemon, axios, pdf-parse
// You can do this by running: npm install express axios pdf-parse

const express = require('express');
const axios = require('axios');
const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');
const https = require('https'); // Add this line
require('dotenv').config()

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle GET requests to the root URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post('/recommend-books', async (req, res) => {
  const file = fs.createWriteStream("file.pdf");
  const request = https.get(req.body.pdfURL, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(() => {
        try {
          let dataBuffer = fs.readFileSync("file.pdf");

          pdf(dataBuffer).then(function(data) {

            // number of pages
            console.log(data.numpages);
            // number of rendered pages
            console.log(data.numrender);
            // PDF info
            console.log(data.info);
            // PDF metadata
            console.log(data.metadata); 
            // PDF.js version
            console.log(data.version);
            // PDF text
            console.log(data.text); 

            // now we can use data.text to generate summary with GPT-4

            axios.post('https://api.openai.com/v1/engines/text-davinci-003/completions', {
  "prompt": `Summarize the following document: ${data.text}`,
  "max_tokens": 200
              
            }, {
              headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
              }
            }).then(response => {
              res.json({data: response.data.choices[0].text});
            }).catch(error => {
              console.error('Error from OpenAI API:', error.response ? error.response.data : error.message);
              res.status(500).send("An error occurred while generating summary.");
            });
          });

        } catch (error) {
          console.error(error);
          res.status(500).send("An error occurred while reading the PDF.");
        }
      });  
    });
  }).on('error', function(err) {
    fs.unlink("file.pdf");
    console.error(err);
    res.status(500).send("An error occurred while downloading the PDF.");
  });
});

app.listen(3000, () => console.log('Listening on port 3000!'));
