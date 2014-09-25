/**
 * Created by Amit Thakkar on 17/9/14.
 */
(function () {
  /*
   * Define Configuration Here.
   * To Connect with Local DynamoDB, We are providing dummy entries
   * for required fields(accessKey, Secret and Region).
   * To Connect with AWS DynamoDB Service place actual accessKey, Secret and Region.
   * */
  var dynamoDBConfiguration = {
    "accessKeyId": "DummyKeyForLocalDynamoDB",
    "secretAccessKey": "DummySecretAccessKeyForLocalDynamoDB",
    "region": "eu-west-1"
  };

  // requiring aws-sdk, async
  var AWS = require('aws-sdk');
  var async = require('async');

  // For Local DynamoDB define endpoint will be "http://localhost:8000"
  var databaseConfig = {"endpoint": new AWS.Endpoint("http://localhost:8000")};

  // provide your configurations
  AWS.config.update(dynamoDBConfiguration);
  // initialize DynamoDB Object.
  var dynamoDB = new AWS.DynamoDB(databaseConfig);

  var tasks = [];
  var tableName = "OrderLog";
  // Listing tables
  tasks.push(function (callback) {
    dynamoDB.listTables(function (error, data) {
      if (error) {
        console.log("Error: ", error, error.stack);
        callback(error);
      } else {
        console.log("List Of Tables", data.TableNames);
        callback(null);
      }
    });
  });
  /*
   * Deleting Table
   * When running first time remove this task as Table will not be present
   * And it might be throw an Error.
   * */
  /*tasks.push(function (callback) {
    dynamoDB.deleteTable({TableName: tableName}, function (error) {
      if (error) {
        console.log("Error: ", error, error.stack);
        callback(error);
      } else {
        console.log("Table ", tableName, " Dropped!");
        callback(null);
      }
    });
  });*/
  // Creating Table
  tasks.push(function (callback) {
    /*
     * Describe table here
     * In DynamoDB we can define one primary key and one secondary key, As we know,
     * DynamoDB is key-value pair base database, so we must have to define primary key.
     * */
    var table = {
      /*
       * Defining Primary Key name and type here
       * Here primary key name is order_id, and type is N(Number)
       * for other types checkout on (http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DataModel.html)
       * */
      AttributeDefinitions: [
        {
          AttributeName: 'order_id',
          AttributeType: 'N'
        }
        // Define Secondary key here.
      ],
      /*
       * Number of attributes must same in key schema, the difference is only here,
       * we define name with key-type. Name is same as AttributeDefinitions order_id,
       * and KeyType is HASH
       * */
      KeySchema: [ // Defining Key Type Here.
        {
          AttributeName: 'order_id',
          KeyType: 'HASH'
        }
        // Define Secondary Key Type Here.
      ],
      // Define read per second and write per second here.
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 5
      },
      TableName: tableName // table Name
    };
    dynamoDB.createTable(table, function (error, data) {
      if (error) {
        console.log("Error: ", error, error.stack);
        callback(error);
      } else {
        console.log("Table ", tableName, " Created!");
        callback(null);
      }
    });
  });
  // Insert/Update a row
  tasks.push(function (callback) {
    var params = {
      Item: {
        order_id: {
          N: '1234'
        },
        order_body: {
          S: "{a:34, b:34}"
        }
      },
      TableName: tableName
    };
    dynamoDB.putItem(params, function (error, data) {
      if (error) {
        console.log("Error: ", error, error.stack);
        callback(error);
      } else {
        console.log("Row ", JSON.stringify(params), " Inserted!");
        callback(null);
      }
    });
  });
  async.series(tasks, function (error, result) {
    console.log("Result: ", arguments);
  });
})();