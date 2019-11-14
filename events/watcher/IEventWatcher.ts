import EventLog from '../types/EventLog'

export type EventHandler = (event: EventLog) => void
export type CompletedHandler = () => void
export type ErrorHandler = (err: Error) => void

export interface IEventWatcher {
  subscribe(event: string, handler: EventHandler): void
  unsubscribe(event: string, handler: EventHandler): void
  start(handler: CompletedHandler, errorHandler?: ErrorHandler): void
}
