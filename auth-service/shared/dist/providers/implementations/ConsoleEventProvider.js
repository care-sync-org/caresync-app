"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleEventProvider = void 0;
class ConsoleEventProvider {
    async publish(event) {
        const timestamp = (event.timestamp ?? new Date()).toISOString();
        const log = {
            timestamp,
            source: event.source,
            detailType: event.detailType,
            detail: event.detail,
        };
        process.stdout.write(`[EVENT] ${JSON.stringify(log)}\n`);
    }
    async publishBatch(events) {
        for (const event of events) {
            await this.publish(event);
        }
    }
}
exports.ConsoleEventProvider = ConsoleEventProvider;
//# sourceMappingURL=ConsoleEventProvider.js.map