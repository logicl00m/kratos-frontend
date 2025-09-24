/**
 * Dependency Injection Container
 * Manages service registration and resolution for the application
 */

type Constructor<T = {}> = new (...args: any[]) => T;
type Factory<T> = () => T | Promise<T>;
type ServiceIdentifier<T> = string | symbol | Constructor<T>;

export enum ServiceScope {
  SINGLETON = 'singleton',
  TRANSIENT = 'transient',
  REQUEST = 'request',
}

interface ServiceDescriptor<T> {
  identifier: ServiceIdentifier<T>;
  implementation: Constructor<T> | Factory<T> | T;
  scope: ServiceScope;
  dependencies?: ServiceIdentifier<any>[];
  factory?: boolean;
  instance?: T;
}

/**
 * Service decorator for marking injectable classes
 */
export function Service(identifier?: string | symbol) {
  return function <T extends Constructor>(target: T) {
    Reflect.defineMetadata('service:identifier', identifier || target.name, target);
    return target;
  };
}

/**
 * Inject decorator for constructor parameters
 */
export function Inject(identifier: ServiceIdentifier<any>) {
  return function (target: any, propertyName: string | symbol | undefined, parameterIndex: number) {
    const existingTokens = Reflect.getMetadata('design:paramtypes', target) || [];
    const tokens = Reflect.getMetadata('custom:inject:tokens', target) || {};
    tokens[parameterIndex] = identifier;
    Reflect.defineMetadata('custom:inject:tokens', tokens, target);
  };
}

/**
 * Main Dependency Injection Container
 */
export class DIContainer {
  private services = new Map<ServiceIdentifier<any>, ServiceDescriptor<any>>();
  private requestScoped = new Map<ServiceIdentifier<any>, any>();

  /**
   * Register a service
   */
  register<T>(
    identifier: ServiceIdentifier<T>,
    implementation: Constructor<T> | Factory<T> | T,
    options: {
      scope?: ServiceScope;
      dependencies?: ServiceIdentifier<any>[];
      factory?: boolean;
    } = {}
  ): void {
    const descriptor: ServiceDescriptor<T> = {
      identifier,
      implementation,
      scope: options.scope || ServiceScope.SINGLETON,
      dependencies: options.dependencies,
      factory: options.factory || typeof implementation === 'function' && !implementation.prototype,
    };

    this.services.set(identifier, descriptor);
  }

  /**
   * Register a singleton service
   */
  registerSingleton<T>(
    identifier: ServiceIdentifier<T>,
    implementation: Constructor<T> | Factory<T> | T
  ): void {
    this.register(identifier, implementation, { scope: ServiceScope.SINGLETON });
  }

  /**
   * Register a transient service
   */
  registerTransient<T>(
    identifier: ServiceIdentifier<T>,
    implementation: Constructor<T>
  ): void {
    this.register(identifier, implementation, { scope: ServiceScope.TRANSIENT });
  }

  /**
   * Register a request-scoped service
   */
  registerRequest<T>(
    identifier: ServiceIdentifier<T>,
    implementation: Constructor<T>
  ): void {
    this.register(identifier, implementation, { scope: ServiceScope.REQUEST });
  }

  /**
   * Register a factory function
   */
  registerFactory<T>(
    identifier: ServiceIdentifier<T>,
    factory: Factory<T>,
    scope: ServiceScope = ServiceScope.SINGLETON
  ): void {
    this.register(identifier, factory, { scope, factory: true });
  }

  /**
   * Resolve a service
   */
  async resolve<T>(identifier: ServiceIdentifier<T>): Promise<T> {
    const descriptor = this.services.get(identifier);

    if (!descriptor) {
      throw new Error(`Service not found: ${this.getIdentifierName(identifier)}`);
    }

    // Handle different scopes
    switch (descriptor.scope) {
      case ServiceScope.SINGLETON:
        return this.resolveSingleton(descriptor);
      case ServiceScope.TRANSIENT:
        return this.resolveTransient(descriptor);
      case ServiceScope.REQUEST:
        return this.resolveRequest(descriptor);
      default:
        throw new Error(`Unknown scope: ${descriptor.scope}`);
    }
  }

  /**
   * Resolve a service synchronously (throws if async)
   */
  resolveSync<T>(identifier: ServiceIdentifier<T>): T {
    const descriptor = this.services.get(identifier);

    if (!descriptor) {
      throw new Error(`Service not found: ${this.getIdentifierName(identifier)}`);
    }

    // For pre-registered instances
    if (descriptor.instance) {
      return descriptor.instance;
    }

    // For non-factory implementations
    if (!descriptor.factory && typeof descriptor.implementation === 'object') {
      return descriptor.implementation as T;
    }

    throw new Error(
      `Service ${this.getIdentifierName(identifier)} requires async resolution. Use resolve() instead.`
    );
  }

  /**
   * Check if a service is registered
   */
  has(identifier: ServiceIdentifier<any>): boolean {
    return this.services.has(identifier);
  }

  /**
   * Clear request-scoped services
   */
  clearRequestScope(): void {
    this.requestScoped.clear();
  }

  /**
   * Reset the container
   */
  reset(): void {
    this.services.clear();
    this.requestScoped.clear();
  }

  /**
   * Create a child container
   */
  createChild(): DIContainer {
    const child = new DIContainer();

    // Copy all service descriptors to child
    for (const [identifier, descriptor] of this.services) {
      child.services.set(identifier, { ...descriptor });
    }

    return child;
  }

  private async resolveSingleton<T>(descriptor: ServiceDescriptor<T>): Promise<T> {
    // Return existing instance if available
    if (descriptor.instance) {
      return descriptor.instance;
    }

    // Create new instance
    const instance = await this.createInstance(descriptor);
    descriptor.instance = instance;

    return instance;
  }

  private async resolveTransient<T>(descriptor: ServiceDescriptor<T>): Promise<T> {
    return this.createInstance(descriptor);
  }

  private async resolveRequest<T>(descriptor: ServiceDescriptor<T>): Promise<T> {
    // Check if already created for this request
    if (this.requestScoped.has(descriptor.identifier)) {
      return this.requestScoped.get(descriptor.identifier);
    }

    // Create new instance for this request
    const instance = await this.createInstance(descriptor);
    this.requestScoped.set(descriptor.identifier, instance);

    return instance;
  }

  private async createInstance<T>(descriptor: ServiceDescriptor<T>): Promise<T> {
    // Handle pre-registered instances
    if (typeof descriptor.implementation === 'object' && !descriptor.factory) {
      return descriptor.implementation as T;
    }

    // Handle factory functions
    if (descriptor.factory) {
      const factory = descriptor.implementation as Factory<T>;
      return factory();
    }

    // Handle constructor functions
    const Constructor = descriptor.implementation as Constructor<T>;

    // Resolve dependencies
    const dependencies = await this.resolveDependencies(Constructor, descriptor.dependencies);

    // Create instance with dependencies
    return new Constructor(...dependencies);
  }

  private async resolveDependencies(
    Constructor: Constructor<any>,
    explicitDependencies?: ServiceIdentifier<any>[]
  ): Promise<any[]> {
    // Use explicit dependencies if provided
    if (explicitDependencies) {
      return Promise.all(explicitDependencies.map(dep => this.resolve(dep)));
    }

    // Try to get dependencies from metadata
    const paramTypes = Reflect.getMetadata('design:paramtypes', Constructor) || [];
    const customTokens = Reflect.getMetadata('custom:inject:tokens', Constructor) || {};

    const dependencies = [];
    for (let i = 0; i < paramTypes.length; i++) {
      const token = customTokens[i] || paramTypes[i];

      if (token) {
        dependencies.push(await this.resolve(token));
      } else {
        dependencies.push(undefined);
      }
    }

    return dependencies;
  }

  private getIdentifierName(identifier: ServiceIdentifier<any>): string {
    if (typeof identifier === 'string') {
      return identifier;
    }
    if (typeof identifier === 'symbol') {
      return identifier.toString();
    }
    if (typeof identifier === 'function') {
      return identifier.name;
    }
    return String(identifier);
  }
}

/**
 * Global container instance
 */
export const container = new DIContainer();

/**
 * Service identifiers
 */
export const ServiceIdentifiers = {
  // Core services
  Logger: Symbol('Logger'),
  Config: Symbol('Config'),
  EventBus: Symbol('EventBus'),

  // API services
  ApiClient: Symbol('ApiClient'),
  AuthService: Symbol('AuthService'),
  TokenManager: Symbol('TokenManager'),

  // Repository services
  ApplicationRepository: Symbol('ApplicationRepository'),
  WorkflowRepository: Symbol('WorkflowRepository'),
  UserRepository: Symbol('UserRepository'),

  // Feature services
  DashboardService: Symbol('DashboardService'),
  WorkflowService: Symbol('WorkflowService'),
  FormService: Symbol('FormService'),

  // Infrastructure services
  CacheService: Symbol('CacheService'),
  StorageService: Symbol('StorageService'),
  NotificationService: Symbol('NotificationService'),
} as const;

/**
 * Configure the DI container with all services
 */
export async function configureContainer(): Promise<void> {
  // This will be called during app initialization
  // to register all services
}

/**
 * Helper function to get a service from the container
 */
export async function getService<T>(identifier: ServiceIdentifier<T>): Promise<T> {
  return container.resolve(identifier);
}

/**
 * Helper function to get a service synchronously
 */
export function getServiceSync<T>(identifier: ServiceIdentifier<T>): T {
  return container.resolveSync(identifier);
}