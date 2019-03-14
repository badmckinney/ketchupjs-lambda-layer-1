module.exports.queue = async (event, context, callback) => {
  const aws = require('aws-sdk');
  const { Client } = require('pg');
  aws.config.update({
    region: 'us-west-2',
    accessKey: process.env.AWS_ACCESS_KEY_ID,
    secretKey: process.env.AWS_SECRET_ACCESS_KEY
  });

  const sqs = new aws.SQS();

  const queueURL = process.env.QUEUE_URL;

  const body = JSON.parse(event.body);

  if (typeof body.value !== 'number') { }

  const key = body.key;
  const metric = body.metric;
  const value = body.value;
  const user_name = body.user_name;

  const client = new Client();
  await client.connect();

  const result = await client.query({
    text: "SELECT id, public FROM clients WHERE key = $1",
    values: [key]
  });
  await client.end();

  if (result.rows[0]) {
    const client_id = result.rows[0].id.toString();
    const public = result.rows[0].public.toString();

    const params = {
      MessageBody: 'Success',
      QueueUrl: queueURL,
      DelaySeconds: 0,
      MessageAttributes: {
        client_id: {
          DataType: 'Number',
          StringValue: client_id
        },
        metric: {
          DataType: 'String',
          StringValue: metric
        },
        value: {
          DataType: 'Number',
          StringValue: value
        },
        user_name: {
          DataType: 'String',
          StringValue: user_name
        },
        public: {
          DataType: 'String',
          StringValue: public
        }
      }
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
        "message": "Successfully sent"
      }),
    });
  } else {
    callback(null, {
      "statusCode": 401,
      "body": JSON.stringify({
        "message": "Invalid API Key"
      }),
    });
  };
};
