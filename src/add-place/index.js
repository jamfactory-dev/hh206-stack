const AWS = require('aws-sdk');
const uuidv5 = require('uuid/v5');


const generate_place_id = name => {
  return uuidv5(name, '2e59b050-a131-11e9-a43f-69a78e05c999');
}


exports.handler = async (event, context) => {
  const dynamodb = new AWS.DynamoDB.DocumentClient();
  console.log(event.body);
  const place = {"name": "Deluxe Bar & Grill"}; // JSON.parse(event.body);
  const params = {
    TableName: process.env.PLACES_TABLE_NAME,
    Item: {
      place_id: generate_place_id(place.name),
      name: place.name,
    },
    ConditionExpression: 'attribute_not_exists(place_id)',
    ReturnConsumedCapacity: 'TOTAL'
  };

  try {
    // Write a new item to the ItemTable
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