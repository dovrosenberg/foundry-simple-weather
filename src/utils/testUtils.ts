
export function gameMock(): Game {
  return {
    settings: {
      register: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
    },
    i18n: {
      localize: jest.fn(),
    },
    user: {
      isGM: true,
    }
  } as any;
}

export function mockClass<T>(spiedClass: Type<T>): T {
  const methods = getMethodsFromPrototype(spiedClass.prototype);

  return createMockFromClassMethods<T>(methods);
}

function getMethodsFromPrototype(object) {
  const methodSet = new Set();

  if(object) {
    const properties = Object.getOwnPropertyNames(object);

    properties.map(name => [name, Object.getOwnPropertyDescriptor(object, name)])
      .filter(([name, descriptor]) => {
        return (descriptor as PropertyDescriptor).value instanceof Function;
      })
      .forEach(method => {
        methodSet.add(method[0]);
      });

    getMethodsFromPrototype(Object.getPrototypeOf(object));
  }

  return methodSet;
}

function createMockFromClassMethods<T>(methods: Set<any>): T {
  const mock = {};

  methods.forEach(item => {
    mock[item] = jest.fn();
  });

  return mock as T;
}

declare interface Type<T> extends Function {
  new (...args: any[]): T;
}
