import { EventProvider, AppEvent } from '../interfaces/EventProvider';
export declare class ConsoleEventProvider implements EventProvider {
    publish(event: AppEvent): Promise<void>;
    publishBatch(events: AppEvent[]): Promise<void>;
}
//# sourceMappingURL=ConsoleEventProvider.d.ts.map