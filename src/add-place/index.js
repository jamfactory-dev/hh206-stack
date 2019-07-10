const AWS = require('aws-sdk');
const axios = require('axios');
const h3 = require("h3-js");
const uuidv5 = require('uuid/v5');

const DEFAULT_RESOLUTION = 7;

const generatePlaceId = name => {
  return uuidv5(name, '2e59b050-a131-11e9-a43f-69a78e05c999');
}

exports.handler = async (event, context) => {
  const dynamodb = new AWS.DynamoDB.DocumentClient();
  const place = event;
  let item = {
    place_id: generatePlaceId(place.shortcut),
    ...place
  };

  if (!place.lat && !place.lng) {
    try {
      console.log(`No lat/lng, attempting to geocode address ${place.address}`);
      const response = await axios.get('https://api.geocod.io/v1.3/geocode', {
        params: {
          api_key: 'c237c32595c2d45d7428432d2433d47ded5e3e4',
          q: `${place.address}, ${place.city} ${place.state}`
        }
      });
      if (response.status == 200 && !!response.data.results && response.data.results.length > 0) {
        result = response.data.results[0];
        console.log(`Found ${result.location.lat} ${result.location.lng}`);
        item.lat = result.location.lat;
        item.lng = result.location.lng;
      }
   } catch (error) {
      console.log(`Error geocoding ${place.address}.`);
      throw new Error(error);
    }
  }

  if (!!item.lat && !!item.lng) {
    item.h3_index = h3.geoToH3(item.lat, item.lng, DEFAULT_RESOLUTION);
  }

  const params = {
    TableName: process.env.PLACES_TABLE_NAME,
    Item: item,
    ConditionExpression: 'attribute_not_exists(place_id)',
    ReturnConsumedCapacity: 'TOTAL'
  };

  try {
    // Write a new item to the ItemTable
    console.log(`Data to write: ${JSON.stringify(params.Item)}`);
    await dynamodb.put(params).promise();
    console.log(`Writing item ${params.Item.place_id} to table ${process.env.PLACES_TABLE_NAME}.`);
  } catch (error) {
    console.log(`Error writing to table ${process.env.PLACES_TABLE_NAME}. Make sure this function is running in the same environment as the table.`);
    throw new Error(error); // stop execution if dynamodb is not available
  }
  
  // Return a 200 response if no errors
  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: 'Success!'
  };

  return response;
};