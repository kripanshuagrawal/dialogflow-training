const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();

// Set up JSON parsing middleware
app.use(bodyParser.json());

// Handle incoming webhook requests
app.post('/weather-webhook', (req, res) => {
  console.log("request body ",req.body);
  // Extract parameters from Dialogflow request
  const { parameters } = req.body.queryResult;
  let timestamp = parameters['date-time']
  let city = parameters['address']['city']

  console.log("request body " + timestamp + city);
  let date = timestamp.split("T")[0]
  let time = timestamp.split("T")[1]
  // Construct URL for WWO API call
  const apiKey = 'cc8a125f86594eeea63170508231405';
  const apiUrl = `http://api.worldweatheronline.com/premium/v1/weather.ashx?key=${apiKey}&q=${city}&date=${date}&time=${time}&format=json`;

  // Make API request to WWO
  request(apiUrl, (error, response, body) => {
    if (error) {
      console.error('Error:', error);
      res.status(500).send('Error');
      return;
    }

    // Parse response from WWO API
    const data = JSON.parse(body);
    const currentConditions = data.data.current_condition[0];
    const temperature = currentConditions.temp_F;
    const description = currentConditions.weatherDesc[0].value;

    // Construct response for Dialogflow
    const speech = `The temperature in ${city} at ${time} on ${date} is ${temperature} degrees Fahrenheit with ${description}.`;
    const responseObj = {
      fulfillmentText: speech,
    };

    // Send response to Dialogflow
    res.json(responseObj);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Webhook server listening on port ${PORT}`));
