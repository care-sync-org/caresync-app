"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQSQueueProvider = void 0;
const client_sqs_1 = require("@aws-sdk/client-sqs");
class SQSQueueProvider {
    constructor(queueUrlMap, region) {
        this.queueUrlMap = queueUrlMap;
        this.client = new client_sqs_1.SQSClient({ region });
    }
    async enqueue(queueName, message) {
        const queueUrl = this.queueUrlMap[queueName];
        if (!queueUrl) {
            throw new Error(`Queue URL not found for queue: ${queueName}`);
        }
        const command = new client_sqs_1.SendMessageCommand({
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(message),
        });
        const response = await this.client.send(command);
        return response.MessageId;
    }
    async dequeue(queueName, maxMessages = 1) {
        const queueUrl = this.queueUrlMap[queueName];
        if (!queueUrl) {
            throw new Error(`Queue URL not found for queue: ${queueName}`);
        }
        const command = new client_sqs_1.ReceiveMessageCommand({
            QueueUrl: queueUrl,
            MaxNumberOfMessages: maxMessages,
            WaitTimeSeconds: 20, // Enable long polling
        });
        const response = await this.client.send(command);
        if (!response.Messages) {
            return [];
        }
        return response.Messages.map((msg) => ({
            id: msg.ReceiptHandle,
            body: JSON.parse(msg.Body),
            sentAt: new Date(),
        }));
    }
    async deleteMessage(queueName, messageId) {
        const queueUrl = this.queueUrlMap[queueName];
        if (!queueUrl) {
            throw new Error(`Queue URL not found for queue: ${queueName}`);
        }
        const command = new client_sqs_1.DeleteMessageCommand({
            QueueUrl: queueUrl,
            ReceiptHandle: messageId,
        });
        await this.client.send(command);
    }
    async purge(queueName) {
        throw new Error('Purge not implemented for SQS to prevent accidental data loss in prod.');
    }
    async getQueueLength(queueName) {
        const queueUrl = this.queueUrlMap[queueName];
        if (!queueUrl) {
            throw new Error(`Queue URL not found for queue: ${queueName}`);
        }
        const command = new client_sqs_1.GetQueueAttributesCommand({
            QueueUrl: queueUrl,
            AttributeNames: ['ApproximateNumberOfMessages'],
        });
        const response = await this.client.send(command);
        return parseInt(response.Attributes?.ApproximateNumberOfMessages || '0', 10);
    }
}
exports.SQSQueueProvider = SQSQueueProvider;
//# sourceMappingURL=SQSQueueProvider.js.map