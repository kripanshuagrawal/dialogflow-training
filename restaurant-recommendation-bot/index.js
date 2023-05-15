const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/restaurant-search', async (req, res) => {
  const { parameters } = req.body.queryResult;
  const { name, cuisine, city } = parameters;

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
      params: {
        query: `${cuisine} restaurant ${name} in ${city}`,
        location: '37.7749,-122.4194',
        radius: 10000,
        type: 'restaurant',
        opennow: true,
        key: 'AIzaSyCYdj4YqU_KAaQzGh-yi_ykJhoAe_x4M7E',
      },
    });

    const { data } = response;
    const { results } = data;

    if (results.length > 0) {
      const restaurant = results[0];
      const { name: restaurantName, formatted_address: address } = restaurant;
      const message = `I recommend ${restaurantName} located at ${address} for ${cuisine} cuisine. It's open now and you can visit at ${time}.`;
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
