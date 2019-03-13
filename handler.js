'use strict';

module.exports.queue = async (event, context, callback) => {
  const aws = require('aws-sdk');
  aws.config.update({
    region: 'us-west-2',
    accessKey: process.env.ACCESS_KEY,
    secretKey: process.env.SECRET_KEY
  });

  const sqs = new aws.SQS();

  const queueURL = process.env.QUEUE_URL;

  const body = JSON.parse(event.body);
  const key = body.key;
  const metric = body.metric;
  const value = body.value;
  const user_id = body.user_id;

  const params = {
    MessageBody: 'Success',
    QueueUrl: queueURL,
    DelaySeconds: 0,
    MessageAttributes: {
      key: {
        DataType: 'String',
        StringValue: key
      },
      metric: {
        DataType: 'String',
        StringValue: metric
      },
      value: {
        DataType: 'Number',
        StringValue: value
      },
      user_id: {
        DataType: 'Number',
        StringValue: user_id
      }
    },
    MessageDeduplicationId: 'ketchupDataDeduplicationId',
    MessageGroupId: 'ketchupData'
  };

  sqs.sendMessage(params, function (err, data) {
    if (err) {
      console.log('error', err);
      callback('error', {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error",
          input: event,
        })
      });
    } else {
      console.log('success');
    }
  });

  callback(null, {
    "statusCode": 200,
    "body": JSON.stringify({
      "message": "Successfully sent",
      "input": event,
    }),
  });
};
