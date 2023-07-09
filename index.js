const express = require('express');
const multer  = require('multer');
const axios = require('axios');
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, '/tmp');
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  }
});

const upload = multer({ storage: storage });

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Handle GET requests to the root URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post('/recommend-books', upload.single('pdfFile'), (req, res) => {
  if(req.file) {
    let dataBuffer = fs.readFileSync(req.file.path);
    pdf(dataBuffer).then(function(data) {
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
    }).catch(error => {
      console.error("Error parsing the PDF: ", error);
      res.status(500).send("An error occurred while reading the PDF.");
    });
  } else {
    const prompt = req.body.prompt;
    // You can replace the following line with the code to get book recommendations using ChatGPT
    axios.post('https://api.openai.com/v1/engines/gpt-3.5-turbo/completions', {
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
      res.status(500).send("An error occurred while generating book recommendations.");
    });
  }
});

//app.listen(3000, () => {
  //console.log('Server started on port 3000');
//});
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`backend running on port ${port}!`);
});