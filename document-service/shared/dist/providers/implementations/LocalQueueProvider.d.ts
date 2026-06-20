import { QueueProvider, QueueMessage } from '../interfaces/QueueProvider';
export declare class LocalQueueProvider implements QueueProvider {
    private readonly queues;
    private getQueue;
    enqueue(queueName: string, message: Record<string, unknown>): Promise<string>;
    dequeue(queueName: string, maxMessages?: number): Promise<QueueMessage[]>;
    deleteMessage(queueName: string, messageId: string): Promise<void>;
    purge(queueName: string): Promise<void>;
    getQueueLength(queueName: string): Promise<number>;
}
//# sourceMappingURL=LocalQueueProvider.d.ts.map