const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const GOOGLE_API_KEY = 'AIzaSyCYdj4YqU_KAaQzGh-yi_ykJhoAe_x4M7E'

app.post('/restaurant-search', async (req, res) => {
  console.log("Request body is " + JSON.stringify(req.body.queryResult));
  const { parameters } = req.body.queryResult;
  const { cuisine, location } = parameters;
  let city = location['city']

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/autocomplete/json', {
      params: {
        input: `${cuisine} restaurant in ${city}`,
        // location: '37.7749,-122.4194',
        // radius: 10000,
        types: 'restaurant',
        // opennow: true,
        key: GOOGLE_API_KEY,
      },
    });

    console.log("Google API REsponse is " + JSON.stringify(response.data));
    const { predictions } = response.data;

    if (predictions.length > 0) {
      const place_id = predictions[0]['place_id'];
      const place_detail = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
        params: {
          place_id: place_id,
          fields: 'formatted_address,name,geometry',
          key: GOOGLE_API_KEY,
        },
      });
      const { name: restaurantName, formatted_address: address } = place_detail.data.result;
      const message = `I recommend ${restaurantName} for ${cuisine} cuisine located at ${address}.`;
      res.json({ fulfillmentText: message });
    } else {
      const message = `Sorry, I could not find any ${cuisine} restaurant near you that is open now. Please try again later or search for another cuisine type.`;
      res.json({ fulfillmentText: message });
    }
  } catch (error) {
    console.error(error);
    const message = `Sorry, there was an error processing your request. Please try again later.`;
    res.json({ fulfillmentText: message });
  }
});

app.listen(3000, () => {
  console.log('Webhook server is listening on port 3000!');
});
