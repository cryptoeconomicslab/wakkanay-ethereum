export type EventHandler = (e: any) => void
export type CompletedHandler = () => void
export type ErrorHandler = (err: Error) => void

export interface IEventWatcher {
  addHandler(event: string, handler: EventHandler): void
  removeHandler(event: string): void
  initPolling(handler: CompletedHandler, errorHandler?: ErrorHandler): void
}
