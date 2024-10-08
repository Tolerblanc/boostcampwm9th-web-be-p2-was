import "reflect-metadata";
import { MiddlewareFunction } from "@/core/util/middleware";

function Controller(prefix: string = ""): ClassDecorator {
  return function (constructor: Function) {
    Reflect.defineMetadata("prefix", prefix, constructor);
  };
}

function Get(path: string): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    registerRoute("GET", path, target, propertyKey);
    return descriptor;
  };
}

function Post(path: string): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    registerRoute("POST", path, target, propertyKey);
    return descriptor;
  };
}

function Put(path: string): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    registerRoute("PUT", path, target, propertyKey);
    return descriptor;
  };
}

function Patch(path: string): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    registerRoute("PATCH", path, target, propertyKey);
    return descriptor;
  };
}

function Delete(path: string): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    registerRoute("DELETE", path, target, propertyKey);
    return descriptor;
  };
}

function UseMiddleware(...middlewares: MiddlewareFunction[]): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const existingMiddlewares =
      Reflect.getMetadata("middlewares", target, propertyKey) || [];
    Reflect.defineMetadata(
      "middlewares",
      [...existingMiddlewares, ...middlewares],
      target,
      propertyKey
    );
    return descriptor;
  };
}

interface RouteDefinition {
  method: string;
  path: string;
  handlerName: string | symbol;
}

function registerRoute(
  method: string,
  path: string,
  target: any,
  propertyKey: string | symbol
) {
  const constructor = target.constructor;
  const routes: RouteDefinition[] =
    Reflect.getMetadata("routes", constructor) || [];
  routes.push({ method, path, handlerName: propertyKey });
  Reflect.defineMetadata("routes", routes, constructor);
}

export {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  UseMiddleware,
  RouteDefinition,
};
