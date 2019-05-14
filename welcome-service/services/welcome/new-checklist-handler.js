const AWS = require('aws-sdk')
const SQS = new AWS.SQS()

const log = require('../../lib/log')

const queueName = process.env.EMAIL_QUEUE_NAME
if (!queueName) {
  throw new Error('EMAIL_QUEUE_NAME must be set')
}

// Get the queue here using the queue name
const params = {
  QueueName: queueName
}

const queueUrlPromise = fetchQueueUrl()

async function fetchQueueUrl() {
  return (await SQS.getQueueUrl(params).promise()).QueueUrl
}

async function handleNewChecklist(event) {
  log.info('handleNewChecklist', event)
  var params = {
    MessageAttributes: {
      Name: {
        DataType: 'String',
        StringValue: 'hi'
      },
      Description: {
        DataType: 'String',
        StringValue: 'John Grisham'
      },
      UserId: {
        DataType: 'Number',
        StringValue: '1234'
      }
    },

    MessageBody: 'Im a message body',
    QueueUrl: await queueUrlPromise
  }

  const result = await SQS.sendMessage(params).promise()
  log.info({ result, params }, 'Sent SQS message')
}

module.exports = {
  handleNewChecklist
}
