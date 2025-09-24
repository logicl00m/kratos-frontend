/**
 * Simple Event Emitter
 * Provides a lightweight event system for the application
 */

export type EventHandler<T = any> = (data: T) => void;
export type UnsubscribeFn = () => void;

export class EventEmitter<T = any> {
  private handlers: Set<EventHandler<T>> = new Set();

  /**
   * Subscribe to events
   */
  on(handler: EventHandler<T>): UnsubscribeFn {
    this.handlers.add(handler);

    // Return unsubscribe function
    return () => {
      this.handlers.delete(handler);
    };
  }

  /**
   * Subscribe to a single event
   */
  once(handler: EventHandler<T>): UnsubscribeFn {
    const wrappedHandler: EventHandler<T> = (data) => {
      handler(data);
      this.handlers.delete(wrappedHandler);
    };

    return this.on(wrappedHandler);
  }

  /**
   * Emit an event to all handlers
   */
  emit(data: T): void {
    this.handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error('Error in event handler:', error);
      }
    });
  }

  /**
   * Remove a specific handler
   */
  off(handler: EventHandler<T>): void {
    this.handlers.delete(handler);
  }

  /**
   * Remove all handlers
   */
  clear(): void {
    this.handlers.clear();
  }

  /**
   * Get the number of handlers
   */
  get size(): number {
    return this.handlers.size;
  }
}

/**
 * Global event bus for application-wide events
 */
export class EventBus {
  private events = new Map<string, EventEmitter>();

  /**
   * Subscribe to an event
   */
  on<T = any>(event: string, handler: EventHandler<T>): UnsubscribeFn {
    if (!this.events.has(event)) {
      this.events.set(event, new EventEmitter<T>());
    }

    return this.events.get(event)!.on(handler);
  }

  /**
   * Subscribe to a single event
   */
  once<T = any>(event: string, handler: EventHandler<T>): UnsubscribeFn {
    if (!this.events.has(event)) {
      this.events.set(event, new EventEmitter<T>());
    }

    return this.events.get(event)!.once(handler);
  }

  /**
   * Emit an event
   */
  emit<T = any>(event: string, data: T): void {
    if (this.events.has(event)) {
      this.events.get(event)!.emit(data);
    }
  }

  /**
   * Remove a specific handler
   */
  off<T = any>(event: string, handler: EventHandler<T>): void {
    if (this.events.has(event)) {
      this.events.get(event)!.off(handler);
    }
  }

  /**
   * Remove all handlers for an event
   */
  clear(event: string): void {
    if (this.events.has(event)) {
      this.events.get(event)!.clear();
    }
  }

  /**
   * Remove all events
   */
  clearAll(): void {
    this.events.forEach(emitter => emitter.clear());
    this.events.clear();
  }
}

/**
 * Global event bus instance
 */
export const eventBus = new EventBus();