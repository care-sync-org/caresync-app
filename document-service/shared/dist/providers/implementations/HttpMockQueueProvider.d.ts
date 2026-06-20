import { QueueProvider, QueueMessage } from '../interfaces/QueueProvider';
export declare class HttpMockQueueProvider implements QueueProvider {
    private readonly serviceUrlMap;
    constructor(serviceUrlMap: Record<string, string>);
    enqueue(queueName: string, message: Record<string, unknown>): Promise<string>;
    dequeue(queueName: string, maxMessages?: number): Promise<QueueMessage[]>;
    deleteMessage(queueName: string, messageId: string): Promise<void>;
    purge(queueName: string): Promise<void>;
    getQueueLength(queueName: string): Promise<number>;
}
//# sourceMappingURL=HttpMockQueueProvider.d.ts.map