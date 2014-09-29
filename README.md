#Node Dynamo DB App

This repository contains Demo Application for NodeJS which connects with DynamoDB.

As we know, **Dynamo** is fast, scalable, highly available **AWS NoSQL Database Service**. Although we have many other databases which are also fast, scalable and good enough, but for scaling/sharding the database, we must have good knowledge of that database, or we must have expert DBA for managing the our database.

That is not the case with **DynamoDB**. When we are working with **DynamoDB**, we don't have to care about the creating the replica, sharding the database or select the shard-key etc. All headache related to scalling/sharding purpose is already handled in **AWS Dynamo Database Service**. We have to just consume **AWS Dynamo Database Service** and concentrate on our project development, instead of spending lots of time on all this DBA related stuff.

You can checkout more about **Dynamo DB** form this [link](http://aws.amazon.com/dynamodb/).

That's enough for theory part, now lets move to practical. Lets make a basic demo application with **NodeJS**, which will communicate with **AWS DynamoDB Database Service**.

For this demo application, we are connecting with local **DynamoDB**. To install **DynamoDB** locally follow this [link](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Tools.DynamoDBLocal.html).

**Tip**: First checkout full working source code from this [link](https://github.com/AmitThakkar/NodeDynamoDBApp), and try to run. When you will run you will see output like this:
```bash
List Of Tables [ 'OrderLog' ]
Table  OrderLog  Dropped!
Table  OrderLog  Created!
Row  {"Item":{"order_id":{"N":"1234"},"order_body":{"S":"{a:34, b:34}"}},"TableName":"OrderLog"}  Inserted!
Result:  { '0': undefined,
  '1': [ undefined, undefined, undefined, undefined ] }
```

**Note**: If your are facing error while running the **DynamoDBTest.js** file which looks like:
```bash
exception when clearing com.almworks.sqlite4java.SQLiteException: [8] DB[1] reset [attempt to write a readonly database]
```
then **DynamoDB** is not having permission to write things to that particular directory/folder. So I will suggest run **DynamoDB** in home directory or run **DynamoDB** with sudo permission. And if you are running application second time then un-comment below code, so program can delete table first before creating again, otherwise it will throw an error for creating same table again.
```javascript
tasks.push(function (callback) {
  dynamoDB.deleteTable({TableName: tableName}, function (error) {
    if (error) {
      console.log("Error: ", error, error.stack);
      callback(error);
    } else {
      console.log("Table ", tableName, " Dropped!");
      callback(null);
    }
  });
});
```

Lets understand what is happening into **DynamoDBTest.js** file? Open **DynamoDBTest.js** file into your favorite Editor, and you will find everything into comments which is require to enough to explain the code.
```javascript
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
      * And it might be throwing an Error.
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
    // Describe table here.
    var table = {
      AttributeDefinitions: [ // Defining Primary Key
        {
          AttributeName: 'order_id',
          AttributeType: 'N'
        }
        // Define Secondary key here.
      ],
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
```



**Note**: You can checkout full working source code from this [link](https://github.com/AmitThakkar/NodeDynamoDBApp).