export type EventHandler = (e: any) => void
export type CompletedHandler = () => void
export type ErrorHandler = (err: Error) => void

export interface IEventWatcher {
  addEvent(event: string, handler: EventHandler): void
  initPolling(handler: CompletedHandler, errorHandler?: ErrorHandler): void
}
