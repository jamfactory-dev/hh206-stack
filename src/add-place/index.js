const AWS = require('aws-sdk');
const uuidv5 = require('uuid/v5');


const generate_place_id = name => {
  return uuidv5(name, '2e59b050-a131-11e9-a43f-69a78e05c999');
}


exports.handler = async (event, context) => {
  const dynamodb = new AWS.DynamoDB.DocumentClient();
  const place = event;
  const params = {
    TableName: process.env.PLACES_TABLE_NAME,
    Item: {
      place_id: generate_place_id(place.shortcut),
      ...place
    },
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