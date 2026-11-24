"use strict";
(() => {
  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/fluent-design-system.js
  var FluentDesignSystem = Object.freeze({
    prefix: "fluent",
    shadowRootMode: "open",
    registry: globalThis.customElements
  });

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/button/button.options.js
  var ButtonType = {
    submit: "submit",
    reset: "reset",
    button: "button"
  };
  var tagName = `${FluentDesignSystem.prefix}-button`;

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/binding/binding.js
  var Binding = class {
    /**
     * Creates a binding.
     * @param evaluate - Evaluates the binding.
     * @param policy - The security policy to associate with this binding.
     * @param isVolatile - Indicates whether the binding is volatile.
     */
    constructor(evaluate, policy, isVolatile = false) {
      this.evaluate = evaluate;
      this.policy = policy;
      this.isVolatile = isVolatile;
    }
  };

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/interfaces.js
  var Message;
  (function(Message2) {
    Message2[Message2["needsArrayObservation"] = 1101] = "needsArrayObservation";
    Message2[Message2["onlySetDOMPolicyOnce"] = 1201] = "onlySetDOMPolicyOnce";
    Message2[Message2["bindingInnerHTMLRequiresTrustedTypes"] = 1202] = "bindingInnerHTMLRequiresTrustedTypes";
    Message2[Message2["twoWayBindingRequiresObservables"] = 1203] = "twoWayBindingRequiresObservables";
    Message2[Message2["hostBindingWithoutHost"] = 1204] = "hostBindingWithoutHost";
    Message2[Message2["unsupportedBindingBehavior"] = 1205] = "unsupportedBindingBehavior";
    Message2[Message2["directCallToHTMLTagNotAllowed"] = 1206] = "directCallToHTMLTagNotAllowed";
    Message2[Message2["onlySetTemplatePolicyOnce"] = 1207] = "onlySetTemplatePolicyOnce";
    Message2[Message2["cannotSetTemplatePolicyAfterCompilation"] = 1208] = "cannotSetTemplatePolicyAfterCompilation";
    Message2[Message2["blockedByDOMPolicy"] = 1209] = "blockedByDOMPolicy";
    Message2[Message2["invalidHydrationAttributeMarker"] = 1210] = "invalidHydrationAttributeMarker";
    Message2[Message2["duplicateRenderInstruction"] = 1211] = "duplicateRenderInstruction";
    Message2[Message2["missingElementDefinition"] = 1401] = "missingElementDefinition";
    Message2[Message2["noRegistrationForContext"] = 1501] = "noRegistrationForContext";
    Message2[Message2["noFactoryForResolver"] = 1502] = "noFactoryForResolver";
    Message2[Message2["invalidResolverStrategy"] = 1503] = "invalidResolverStrategy";
    Message2[Message2["cannotAutoregisterDependency"] = 1504] = "cannotAutoregisterDependency";
    Message2[Message2["cannotResolveKey"] = 1505] = "cannotResolveKey";
    Message2[Message2["cannotConstructNativeFunction"] = 1506] = "cannotConstructNativeFunction";
    Message2[Message2["cannotJITRegisterNonConstructor"] = 1507] = "cannotJITRegisterNonConstructor";
    Message2[Message2["cannotJITRegisterIntrinsic"] = 1508] = "cannotJITRegisterIntrinsic";
    Message2[Message2["cannotJITRegisterInterface"] = 1509] = "cannotJITRegisterInterface";
    Message2[Message2["invalidResolver"] = 1510] = "invalidResolver";
    Message2[Message2["invalidKey"] = 1511] = "invalidKey";
    Message2[Message2["noDefaultResolver"] = 1512] = "noDefaultResolver";
    Message2[Message2["cyclicDependency"] = 1513] = "cyclicDependency";
    Message2[Message2["connectUpdateRequiresController"] = 1514] = "connectUpdateRequiresController";
  })(Message || (Message = {}));
  var isFunction = (object) => typeof object === "function";
  var isString = (object) => typeof object === "string";
  var noop = () => void 0;

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/platform.js
  var debugMessages = /* @__PURE__ */ Object.create(null);
  var FAST = {
    /**
     * Sends a warning to the developer.
     * @param code - The warning code to send.
     * @param values - Values relevant for the warning message.
     */
    warn(_code, _values) {
    },
    /**
     * Creates an error from a code.
     * @param code - The error code.
     * @param values - Values relevant for the error message.
     */
    error(code, _values) {
      return new Error(`Error ${code}`);
    },
    /**
     * Adds debug messages for errors and warnings.
     * @param messages - The message dictionary to add.
     */
    addMessages(messages) {
      Object.assign(debugMessages, messages);
    }
  };
  var emptyArray = Object.freeze([]);
  function createTypeRegistry() {
    const typeToDefinition = /* @__PURE__ */ new Map();
    return Object.freeze({
      register(definition6) {
        if (typeToDefinition.has(definition6.type)) {
          return false;
        }
        typeToDefinition.set(definition6.type, definition6);
        return true;
      },
      getByType(key) {
        return typeToDefinition.get(key);
      },
      getForInstance(object) {
        if (object === null || object === void 0) {
          return void 0;
        }
        return typeToDefinition.get(object.constructor);
      }
    });
  }
  function createMetadataLocator() {
    const metadataLookup = /* @__PURE__ */ new WeakMap();
    return function(target) {
      let metadata = metadataLookup.get(target);
      if (metadata === void 0) {
        let currentTarget = Reflect.getPrototypeOf(target);
        while (metadata === void 0 && currentTarget !== null) {
          metadata = metadataLookup.get(currentTarget);
          currentTarget = Reflect.getPrototypeOf(currentTarget);
        }
        metadata = metadata === void 0 ? [] : metadata.slice(0);
        metadataLookup.set(target, metadata);
      }
      return metadata;
    };
  }
  function makeSerializationNoop(type) {
    type.prototype.toJSON = noop;
  }

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/binding/one-time.js
  var OneTimeBinding = class extends Binding {
    createObserver() {
      return this;
    }
    bind(controller) {
      return this.evaluate(controller.source, controller.context);
    }
  };
  makeSerializationNoop(OneTimeBinding);
  function oneTime(expression, policy) {
    return new OneTimeBinding(expression, policy);
  }

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/observation/notifier.js
  var SubscriberSet = class {
    /**
     * Creates an instance of SubscriberSet for the specified subject.
     * @param subject - The subject that subscribers will receive notifications from.
     * @param initialSubscriber - An initial subscriber to changes.
     */
    constructor(subject, initialSubscriber) {
      this.sub1 = void 0;
      this.sub2 = void 0;
      this.spillover = void 0;
      this.subject = subject;
      this.sub1 = initialSubscriber;
    }
    /**
     * Checks whether the provided subscriber has been added to this set.
     * @param subscriber - The subscriber to test for inclusion in this set.
     */
    has(subscriber) {
      return this.spillover === void 0 ? this.sub1 === subscriber || this.sub2 === subscriber : this.spillover.indexOf(subscriber) !== -1;
    }
    /**
     * Subscribes to notification of changes in an object's state.
     * @param subscriber - The object that is subscribing for change notification.
     */
    subscribe(subscriber) {
      const spillover = this.spillover;
      if (spillover === void 0) {
        if (this.has(subscriber)) {
          return;
        }
        if (this.sub1 === void 0) {
          this.sub1 = subscriber;
          return;
        }
        if (this.sub2 === void 0) {
          this.sub2 = subscriber;
          return;
        }
        this.spillover = [this.sub1, this.sub2, subscriber];
        this.sub1 = void 0;
        this.sub2 = void 0;
      } else {
        const index = spillover.indexOf(subscriber);
        if (index === -1) {
          spillover.push(subscriber);
        }
      }
    }
    /**
     * Unsubscribes from notification of changes in an object's state.
     * @param subscriber - The object that is unsubscribing from change notification.
     */
    unsubscribe(subscriber) {
      const spillover = this.spillover;
      if (spillover === void 0) {
        if (this.sub1 === subscriber) {
          this.sub1 = void 0;
        } else if (this.sub2 === subscriber) {
          this.sub2 = void 0;
        }
      } else {
        const index = spillover.indexOf(subscriber);
        if (index !== -1) {
          spillover.splice(index, 1);
        }
      }
    }
    /**
     * Notifies all subscribers.
     * @param args - Data passed along to subscribers during notification.
     */
    notify(args) {
      const spillover = this.spillover;
      const subject = this.subject;
      if (spillover === void 0) {
        const sub1 = this.sub1;
        const sub2 = this.sub2;
        if (sub1 !== void 0) {
          sub1.handleChange(subject, args);
        }
        if (sub2 !== void 0) {
          sub2.handleChange(subject, args);
        }
      } else {
        for (let i = 0, ii = spillover.length; i < ii; ++i) {
          spillover[i].handleChange(subject, args);
        }
      }
    }
  };
  var PropertyChangeNotifier = class {
    /**
     * Creates an instance of PropertyChangeNotifier for the specified subject.
     * @param subject - The object that subscribers will receive notifications for.
     */
    constructor(subject) {
      this.subscribers = {};
      this.subjectSubscribers = null;
      this.subject = subject;
    }
    /**
     * Notifies all subscribers, based on the specified property.
     * @param propertyName - The property name, passed along to subscribers during notification.
     */
    notify(propertyName) {
      var _a3, _b2;
      (_a3 = this.subscribers[propertyName]) === null || _a3 === void 0 ? void 0 : _a3.notify(propertyName);
      (_b2 = this.subjectSubscribers) === null || _b2 === void 0 ? void 0 : _b2.notify(propertyName);
    }
    /**
     * Subscribes to notification of changes in an object's state.
     * @param subscriber - The object that is subscribing for change notification.
     * @param propertyToWatch - The name of the property that the subscriber is interested in watching for changes.
     */
    subscribe(subscriber, propertyToWatch) {
      var _a3, _b2;
      let subscribers;
      if (propertyToWatch) {
        subscribers = (_a3 = this.subscribers[propertyToWatch]) !== null && _a3 !== void 0 ? _a3 : this.subscribers[propertyToWatch] = new SubscriberSet(this.subject);
      } else {
        subscribers = (_b2 = this.subjectSubscribers) !== null && _b2 !== void 0 ? _b2 : this.subjectSubscribers = new SubscriberSet(this.subject);
      }
      subscribers.subscribe(subscriber);
    }
    /**
     * Unsubscribes from notification of changes in an object's state.
     * @param subscriber - The object that is unsubscribing from change notification.
     * @param propertyToUnwatch - The name of the property that the subscriber is no longer interested in watching.
     */
    unsubscribe(subscriber, propertyToUnwatch) {
      var _a3, _b2;
      if (propertyToUnwatch) {
        (_a3 = this.subscribers[propertyToUnwatch]) === null || _a3 === void 0 ? void 0 : _a3.unsubscribe(subscriber);
      } else {
        (_b2 = this.subjectSubscribers) === null || _b2 === void 0 ? void 0 : _b2.unsubscribe(subscriber);
      }
    }
  };

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/observation/update-queue.js
  var tasks = [];
  var pendingErrors = [];
  var rAF = globalThis.requestAnimationFrame;
  var updateAsync = true;
  function throwFirstError() {
    if (pendingErrors.length) {
      throw pendingErrors.shift();
    }
  }
  function tryRunTask(task) {
    try {
      task.call();
    } catch (error) {
      if (updateAsync) {
        pendingErrors.push(error);
        setTimeout(throwFirstError, 0);
      } else {
        tasks.length = 0;
        throw error;
      }
    }
  }
  function process() {
    const capacity = 1024;
    let index = 0;
    while (index < tasks.length) {
      tryRunTask(tasks[index]);
      index++;
      if (index > capacity) {
        for (let scan = 0, newLength = tasks.length - index; scan < newLength; scan++) {
          tasks[scan] = tasks[scan + index];
        }
        tasks.length -= index;
        index = 0;
      }
    }
    tasks.length = 0;
  }
  function enqueue(callable) {
    tasks.push(callable);
    if (tasks.length < 2) {
      updateAsync ? rAF(process) : process();
    }
  }
  var Updates = Object.freeze({
    enqueue,
    next: () => new Promise(enqueue),
    process,
    setMode: (isAsync) => updateAsync = isAsync
  });

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/observation/observable.js
  var SourceLifetime = Object.freeze({
    /**
     * The source to controller lifetime relationship is unknown.
     */
    unknown: void 0,
    /**
     * The source and controller lifetimes are coupled to one another.
     * They can/will be GC'd together.
     */
    coupled: 1
  });
  var Observable = (() => {
    const queueUpdate = Updates.enqueue;
    const volatileRegex = /(:|&&|\|\||if|\?\.)/;
    const notifierLookup = /* @__PURE__ */ new WeakMap();
    let watcher = void 0;
    let createArrayObserver = (array) => {
      throw FAST.error(Message.needsArrayObservation);
    };
    function getNotifier(source) {
      var _a3;
      let found = (_a3 = source.$fastController) !== null && _a3 !== void 0 ? _a3 : notifierLookup.get(source);
      if (found === void 0) {
        Array.isArray(source) ? found = createArrayObserver(source) : notifierLookup.set(source, found = new PropertyChangeNotifier(source));
      }
      return found;
    }
    const getAccessors = createMetadataLocator();
    class DefaultObservableAccessor {
      constructor(name) {
        this.name = name;
        this.field = `_${name}`;
        this.callback = `${name}Changed`;
      }
      getValue(source) {
        if (watcher !== void 0) {
          watcher.watch(source, this.name);
        }
        return source[this.field];
      }
      setValue(source, newValue) {
        const field = this.field;
        const oldValue = source[field];
        if (oldValue !== newValue) {
          source[field] = newValue;
          const callback = source[this.callback];
          if (isFunction(callback)) {
            callback.call(source, oldValue, newValue);
          }
          getNotifier(source).notify(this.name);
        }
      }
    }
    class ExpressionNotifierImplementation extends SubscriberSet {
      constructor(expression, initialSubscriber, isVolatileBinding = false) {
        super(expression, initialSubscriber);
        this.expression = expression;
        this.isVolatileBinding = isVolatileBinding;
        this.needsRefresh = true;
        this.needsQueue = true;
        this.isAsync = true;
        this.first = this;
        this.last = null;
        this.propertySource = void 0;
        this.propertyName = void 0;
        this.notifier = void 0;
        this.next = void 0;
      }
      setMode(isAsync) {
        this.isAsync = this.needsQueue = isAsync;
      }
      bind(controller) {
        const value = this.observe(controller.source, controller.context);
        if (!controller.isBound && this.requiresUnbind(controller)) {
          controller.onUnbind(this);
        }
        return value;
      }
      requiresUnbind(controller) {
        return controller.sourceLifetime !== SourceLifetime.coupled || this.first !== this.last || this.first.propertySource !== controller.source;
      }
      unbind(controller) {
        this.dispose();
      }
      observe(source, context) {
        if (this.needsRefresh && this.last !== null) {
          this.dispose();
        }
        const previousWatcher = watcher;
        watcher = this.needsRefresh ? this : void 0;
        this.needsRefresh = this.isVolatileBinding;
        let result;
        try {
          result = this.expression(source, context);
        } finally {
          watcher = previousWatcher;
        }
        return result;
      }
      // backwards compat with v1 kernel
      disconnect() {
        this.dispose();
      }
      dispose() {
        if (this.last !== null) {
          let current = this.first;
          while (current !== void 0) {
            current.notifier.unsubscribe(this, current.propertyName);
            current = current.next;
          }
          this.last = null;
          this.needsRefresh = this.needsQueue = this.isAsync;
        }
      }
      watch(propertySource, propertyName) {
        const prev = this.last;
        const notifier = getNotifier(propertySource);
        const current = prev === null ? this.first : {};
        current.propertySource = propertySource;
        current.propertyName = propertyName;
        current.notifier = notifier;
        notifier.subscribe(this, propertyName);
        if (prev !== null) {
          if (!this.needsRefresh) {
            let prevValue;
            watcher = void 0;
            prevValue = prev.propertySource[prev.propertyName];
            watcher = this;
            if (propertySource === prevValue) {
              this.needsRefresh = true;
            }
          }
          prev.next = current;
        }
        this.last = current;
      }
      handleChange() {
        if (this.needsQueue) {
          this.needsQueue = false;
          queueUpdate(this);
        } else if (!this.isAsync) {
          this.call();
        }
      }
      call() {
        if (this.last !== null) {
          this.needsQueue = this.isAsync;
          this.notify(this);
        }
      }
      *records() {
        let next2 = this.first;
        while (next2 !== void 0) {
          yield next2;
          next2 = next2.next;
        }
      }
    }
    makeSerializationNoop(ExpressionNotifierImplementation);
    return Object.freeze({
      /**
       * @internal
       * @param factory - The factory used to create array observers.
       */
      setArrayObserverFactory(factory) {
        createArrayObserver = factory;
      },
      /**
       * Gets a notifier for an object or Array.
       * @param source - The object or Array to get the notifier for.
       */
      getNotifier,
      /**
       * Records a property change for a source object.
       * @param source - The object to record the change against.
       * @param propertyName - The property to track as changed.
       */
      track(source, propertyName) {
        watcher && watcher.watch(source, propertyName);
      },
      /**
       * Notifies watchers that the currently executing property getter or function is volatile
       * with respect to its observable dependencies.
       */
      trackVolatile() {
        watcher && (watcher.needsRefresh = true);
      },
      /**
       * Notifies subscribers of a source object of changes.
       * @param source - the object to notify of changes.
       * @param args - The change args to pass to subscribers.
       */
      notify(source, args) {
        getNotifier(source).notify(args);
      },
      /**
       * Defines an observable property on an object or prototype.
       * @param target - The target object to define the observable on.
       * @param nameOrAccessor - The name of the property to define as observable;
       * or a custom accessor that specifies the property name and accessor implementation.
       */
      defineProperty(target, nameOrAccessor) {
        if (isString(nameOrAccessor)) {
          nameOrAccessor = new DefaultObservableAccessor(nameOrAccessor);
        }
        getAccessors(target).push(nameOrAccessor);
        Reflect.defineProperty(target, nameOrAccessor.name, {
          enumerable: true,
          get() {
            return nameOrAccessor.getValue(this);
          },
          set(newValue) {
            nameOrAccessor.setValue(this, newValue);
          }
        });
      },
      /**
       * Finds all the observable accessors defined on the target,
       * including its prototype chain.
       * @param target - The target object to search for accessor on.
       */
      getAccessors,
      /**
       * Creates a {@link ExpressionNotifier} that can watch the
       * provided {@link Expression} for changes.
       * @param expression - The binding to observe.
       * @param initialSubscriber - An initial subscriber to changes in the binding value.
       * @param isVolatileBinding - Indicates whether the binding's dependency list must be re-evaluated on every value evaluation.
       */
      binding(expression, initialSubscriber, isVolatileBinding = this.isVolatileBinding(expression)) {
        return new ExpressionNotifierImplementation(expression, initialSubscriber, isVolatileBinding);
      },
      /**
       * Determines whether a binding expression is volatile and needs to have its dependency list re-evaluated
       * on every evaluation of the value.
       * @param expression - The binding to inspect.
       */
      isVolatileBinding(expression) {
        return volatileRegex.test(expression.toString());
      }
    });
  })();
  function observable(target, nameOrAccessor) {
    Observable.defineProperty(target, nameOrAccessor);
  }
  var contextEvent = /* @__PURE__ */ (() => {
    let current = null;
    return {
      get() {
        return current;
      },
      set(event) {
        current = event;
      }
    };
  })();
  var ExecutionContext = Object.freeze({
    /**
     * A default execution context.
     */
    default: {
      index: 0,
      length: 0,
      get event() {
        return ExecutionContext.getEvent();
      },
      eventDetail() {
        return this.event.detail;
      },
      eventTarget() {
        return this.event.target;
      }
    },
    /**
     * Gets the current event.
     * @returns An event object.
     */
    getEvent() {
      return contextEvent.get();
    },
    /**
     * Sets the current event.
     * @param event - An event object.
     */
    setEvent(event) {
      contextEvent.set(event);
    }
  });

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/binding/one-way.js
  var OneWayBinding = class extends Binding {
    createObserver(subscriber) {
      return Observable.binding(this.evaluate, subscriber, this.isVolatile);
    }
  };
  function oneWay(expression, policy, isVolatile = Observable.isVolatileBinding(expression)) {
    return new OneWayBinding(expression, policy, isVolatile);
  }

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/dom-aspect.js
  var DOMAspect = Object.freeze({
    /**
     * Not aspected.
     */
    none: 0,
    /**
     * An attribute.
     */
    attribute: 1,
    /**
     * A boolean attribute.
     */
    booleanAttribute: 2,
    /**
     * A property.
     */
    property: 3,
    /**
     * Content
     */
    content: 4,
    /**
     * A token list.
     */
    tokenList: 5,
    /**
     * An event.
     */
    event: 6
  });

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/dom-policy-defaults.js
  var surroundingWhitespaceAndControlChars = /^[\u0000-\u0020\u007F]+|[\u0000-\u0020\u007F]+$/g;
  var whitespaceAndControlChars = /[\u0000-\u0020\u007F]+/g;
  var unsafeURLProtocol = /^(?:javascript|vbscript|data):/;
  function trimURL(value) {
    return value.replace(surroundingWhitespaceAndControlChars, "");
  }
  function decodeURL(value) {
    try {
      return decodeURIComponent(value);
    } catch (_a3) {
      return value;
    }
  }
  function hasUnsafeURLProtocol(value) {
    let normalized = trimURL(value);
    for (let i = 0; i < 3; ++i) {
      const decoded = decodeURL(normalized);
      if (decoded === normalized) {
        break;
      }
      normalized = trimURL(decoded);
    }
    normalized = normalized.replace(whitespaceAndControlChars, "").toLowerCase();
    return unsafeURLProtocol.test(normalized);
  }
  function sanitizeURL(value) {
    const trimmed = trimURL(value);
    return hasUnsafeURLProtocol(trimmed) ? "" : trimmed;
  }
  function safeURL(tagName6, aspect, aspectName, sink) {
    return (target, name, value, ...rest) => {
      if (value !== null && value !== void 0) {
        value = sanitizeURL(`${value}`);
      }
      sink(target, name, value, ...rest);
    };
  }
  function block(tagName6, aspect, aspectName, sink) {
    throw FAST.error(Message.blockedByDOMPolicy, {
      aspectName,
      tagName: tagName6 !== null && tagName6 !== void 0 ? tagName6 : "text"
    });
  }
  var sharedElementGuards = {
    "a.href": safeURL,
    "area.href": safeURL,
    "embed.src": block,
    "form.action": safeURL,
    "frame.src": safeURL,
    "iframe.src": safeURL,
    "iframe.srcdoc": block,
    "link.href": block,
    "object.data": block,
    "script.src": block,
    "script.text": block
  };
  var attributeElementGuards = {
    "button.formaction": safeURL,
    "input.formaction": safeURL,
    "object.codebase": block
  };
  var propertyElementGuards = {
    "button.formAction": safeURL,
    "input.formAction": safeURL,
    "object.codeBase": block,
    "script.innerText": block,
    "script.textContent": block,
    "style.innerText": block,
    "style.textContent": block
  };
  function getDefaultElementGuard(tagName6, aspect, aspectName) {
    var _a3;
    const guards = aspect === DOMAspect.attribute ? attributeElementGuards : aspect === DOMAspect.property ? propertyElementGuards : void 0;
    if (guards) {
      const key = `${tagName6}.${aspectName}`;
      return (_a3 = guards[key]) !== null && _a3 !== void 0 ? _a3 : sharedElementGuards[key];
    }
  }
  var blockedEvents = {
    onabort: block,
    onauxclick: block,
    onbeforeinput: block,
    onbeforematch: block,
    onblur: block,
    oncancel: block,
    oncanplay: block,
    oncanplaythrough: block,
    onchange: block,
    onclick: block,
    onclose: block,
    oncontextlost: block,
    oncontextmenu: block,
    oncontextrestored: block,
    oncopy: block,
    oncuechange: block,
    oncut: block,
    ondblclick: block,
    ondrag: block,
    ondragend: block,
    ondragenter: block,
    ondragleave: block,
    ondragover: block,
    ondragstart: block,
    ondrop: block,
    ondurationchange: block,
    onemptied: block,
    onended: block,
    onerror: block,
    onfocus: block,
    onformdata: block,
    oninput: block,
    oninvalid: block,
    onkeydown: block,
    onkeypress: block,
    onkeyup: block,
    onload: block,
    onloadeddata: block,
    onloadedmetadata: block,
    onloadstart: block,
    onmousedown: block,
    onmouseenter: block,
    onmouseleave: block,
    onmousemove: block,
    onmouseout: block,
    onmouseover: block,
    onmouseup: block,
    onpaste: block,
    onpause: block,
    onplay: block,
    onplaying: block,
    onprogress: block,
    onratechange: block,
    onreset: block,
    onresize: block,
    onscroll: block,
    onsecuritypolicyviolation: block,
    onseeked: block,
    onseeking: block,
    onselect: block,
    onslotchange: block,
    onstalled: block,
    onsubmit: block,
    onsuspend: block,
    ontimeupdate: block,
    ontoggle: block,
    onvolumechange: block,
    onwaiting: block,
    onwebkitanimationend: block,
    onwebkitanimationiteration: block,
    onwebkitanimationstart: block,
    onwebkittransitionend: block,
    onwheel: block
  };
  function getDefaultAspectGuard(aspect, aspectName) {
    if (aspect === DOMAspect.property && aspectName === "innerHTML") {
      return block;
    }
    if (aspect === DOMAspect.attribute || aspect === DOMAspect.property || aspect === DOMAspect.event) {
      return blockedEvents[aspectName];
    }
  }
  function protectDOMSink(tagName6, aspect, aspectName, sink) {
    var _a3;
    const guard = (_a3 = getDefaultElementGuard((tagName6 !== null && tagName6 !== void 0 ? tagName6 : "").toLowerCase(), aspect, aspectName)) !== null && _a3 !== void 0 ? _a3 : getDefaultAspectGuard(aspect, aspectName);
    return guard ? guard(tagName6, aspect, aspectName, sink) : sink;
  }

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/dom.js
  var createHTML = (html2) => html2;
  var fastTrustedType = globalThis.trustedTypes ? globalThis.trustedTypes.createPolicy("fast-html", { createHTML }) : { createHTML };
  var fastPolicy = Object.freeze({
    createHTML(value) {
      return fastTrustedType.createHTML(value);
    },
    protect: protectDOMSink
  });
  var defaultPolicy = fastPolicy;
  var DOM = Object.freeze({
    /**
     * Gets the dom policy used by the templating system.
     */
    get policy() {
      return defaultPolicy;
    },
    /**
     * Sets the dom policy used by the templating system.
     * @param policy - The policy to set.
     * @remarks
     * This API can only be called once, for security reasons. It should be
     * called by the application developer at the start of their program.
     */
    setPolicy(value) {
      if (defaultPolicy !== fastPolicy) {
        throw FAST.error(Message.onlySetDOMPolicyOnce);
      }
      defaultPolicy = value;
    },
    /**
     * Sets an attribute value on an element.
     * @param element - The element to set the attribute value on.
     * @param attributeName - The attribute name to set.
     * @param value - The value of the attribute to set.
     * @remarks
     * If the value is `null` or `undefined`, the attribute is removed, otherwise
     * it is set to the provided value using the standard `setAttribute` API.
     */
    setAttribute(element, attributeName, value) {
      value === null || value === void 0 ? element.removeAttribute(attributeName) : element.setAttribute(attributeName, value);
    },
    /**
     * Sets a boolean attribute value.
     * @param element - The element to set the boolean attribute value on.
     * @param attributeName - The attribute name to set.
     * @param value - The value of the attribute to set.
     * @remarks
     * If the value is true, the attribute is added; otherwise it is removed.
     */
    setBooleanAttribute(element, attributeName, value) {
      value ? element.setAttribute(attributeName, "") : element.removeAttribute(attributeName);
    }
  });

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/components/attributes.js
  var booleanMode = "boolean";
  var reflectMode = "reflect";
  var AttributeConfiguration = Object.freeze({
    /**
     * Locates all attribute configurations associated with a type.
     */
    locate: createMetadataLocator()
  });
  var booleanConverter = {
    toView(value) {
      return value ? "" : null;
    },
    fromView(value) {
      return !!value;
    }
  };
  var AttributeDefinition = class _AttributeDefinition {
    /**
     * Creates an instance of AttributeDefinition.
     * @param Owner - The class constructor that owns this attribute.
     * @param name - The name of the property associated with the attribute.
     * @param attribute - The name of the attribute in HTML.
     * @param mode - The {@link AttributeMode} that describes the behavior of this attribute.
     * @param converter - A {@link ValueConverter} that integrates with the property getter/setter
     * to convert values to and from a DOM string.
     */
    constructor(Owner, name, attribute = name.toLowerCase(), mode = reflectMode, converter) {
      this.guards = /* @__PURE__ */ new Set();
      this.Owner = Owner;
      this.name = name;
      this.attribute = attribute;
      this.mode = mode;
      this.converter = converter;
      this.fieldName = `_${name}`;
      this.callbackName = `${name}Changed`;
      this.hasCallback = this.callbackName in Owner.prototype;
      if (mode === booleanMode && converter === void 0) {
        this.converter = booleanConverter;
      }
    }
    /**
     * Sets the value of the attribute/property on the source element.
     * @param source - The source element to access.
     * @param newValue - The value to set the attribute/property to.
     */
    setValue(source, newValue) {
      const oldValue = source[this.fieldName];
      const converter = this.converter;
      if (converter !== void 0) {
        newValue = converter.fromView(newValue);
      }
      if (oldValue !== newValue) {
        source[this.fieldName] = newValue;
        this.tryReflectToAttribute(source);
        if (this.hasCallback) {
          source[this.callbackName](oldValue, newValue);
        }
        source.$fastController.notify(this.name);
      }
    }
    /**
     * Gets the value of the attribute/property on the source element.
     * @param source - The source element to access.
     */
    getValue(source) {
      Observable.track(source, this.name);
      return source[this.fieldName];
    }
    /** @internal */
    onAttributeChangedCallback(element, value) {
      if (this.guards.has(element)) {
        return;
      }
      this.guards.add(element);
      if (this.mode === booleanMode) {
        this.setValue(element, value !== null);
      } else {
        this.setValue(element, value);
      }
      this.guards.delete(element);
    }
    tryReflectToAttribute(element) {
      const mode = this.mode;
      const guards = this.guards;
      if (guards.has(element) || mode === "fromView") {
        return;
      }
      Updates.enqueue(() => {
        guards.add(element);
        const latestValue = element[this.fieldName];
        switch (mode) {
          case reflectMode: {
            const converter = this.converter;
            DOM.setAttribute(element, this.attribute, converter !== void 0 ? converter.toView(latestValue) : latestValue);
            break;
          }
          case booleanMode:
            DOM.setBooleanAttribute(element, this.attribute, latestValue);
            break;
        }
        guards.delete(element);
      });
    }
    /**
     * Collects all attribute definitions associated with the owner.
     * @param Owner - The class constructor to collect attribute for.
     * @param attributeLists - Any existing attributes to collect and merge with those associated with the owner.
     * @internal
     */
    static collect(Owner, ...attributeLists) {
      const attributes = [];
      attributeLists.push(AttributeConfiguration.locate(Owner));
      for (let i = 0, ii = attributeLists.length; i < ii; ++i) {
        const list = attributeLists[i];
        if (list === void 0) {
          continue;
        }
        for (let j = 0, jj = list.length; j < jj; ++j) {
          const config = list[j];
          if (isString(config)) {
            attributes.push(new _AttributeDefinition(Owner, config));
          } else {
            attributes.push(new _AttributeDefinition(Owner, config.property, config.attribute, config.mode, config.converter));
          }
        }
      }
      return attributes;
    }
  };
  function attr(configOrTarget, prop) {
    let config;
    function decorator($target, $prop) {
      if (arguments.length > 1) {
        config.property = $prop;
      }
      AttributeConfiguration.locate($target.constructor).push(config);
    }
    if (arguments.length > 1) {
      config = {};
      decorator(configOrTarget, prop);
      return;
    }
    config = configOrTarget === void 0 ? {} : configOrTarget;
    return decorator;
  }

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/styles/element-styles.js
  var DefaultStyleStrategy;
  function reduceStyles(styles6) {
    return styles6.reduce((reduced, current) => {
      if (current instanceof ElementStyles) {
        reduced.push(...reduceStyles(current.styles));
      } else {
        reduced.push(current);
      }
      return reduced;
    }, []);
  }
  var ElementStyles = class _ElementStyles {
    /**
     * Gets the StyleStrategy associated with these element styles.
     */
    get strategy() {
      if (this._strategy === null) {
        if (!DefaultStyleStrategy) {
          _ElementStyles.setDefaultStrategy(_ElementStyles.supportsAdoptedStyleSheets ? createAdoptedSheetsStrategy() : createStyleElementStrategy());
        }
        this.withStrategy(DefaultStyleStrategy);
      }
      return this._strategy;
    }
    /**
     * Creates an instance of ElementStyles.
     * @param styles - The styles that will be associated with elements.
     */
    constructor(styles6) {
      this.styles = styles6;
      this.targets = /* @__PURE__ */ new WeakSet();
      this._strategy = null;
    }
    /** @internal */
    addStylesTo(target) {
      this.strategy.addStylesTo(target);
      this.targets.add(target);
    }
    /** @internal */
    removeStylesFrom(target) {
      this.strategy.removeStylesFrom(target);
      this.targets.delete(target);
    }
    /** @internal */
    isAttachedTo(target) {
      return this.targets.has(target);
    }
    /**
     * Sets the strategy that handles adding/removing these styles for an element.
     * @param strategy - The strategy to use.
     */
    withStrategy(Strategy) {
      this._strategy = new Strategy(reduceStyles(this.styles));
      return this;
    }
    /**
     * Sets the default strategy type to use when creating style strategies.
     * @param Strategy - The strategy type to construct.
     */
    static setDefaultStrategy(Strategy) {
      DefaultStyleStrategy = Strategy;
    }
    /**
     * Normalizes a set of composable style options.
     * @param styles - The style options to normalize.
     * @returns A singular ElementStyles instance or undefined.
     */
    static normalize(styles6) {
      return styles6 === void 0 ? void 0 : Array.isArray(styles6) ? new _ElementStyles(styles6) : styles6 instanceof _ElementStyles ? styles6 : new _ElementStyles([styles6]);
    }
  };
  ElementStyles.supportsAdoptedStyleSheets = Array.isArray(document.adoptedStyleSheets) && "replace" in CSSStyleSheet.prototype;
  function createAdoptedSheetsStrategy() {
    const cache = /* @__PURE__ */ new Map();
    return class FallbackAdoptedSheetsStrategy {
      constructor(styles6) {
        this.sheets = styles6.map((x) => {
          if (x instanceof CSSStyleSheet) {
            return x;
          }
          let sheet = cache.get(x);
          if (sheet === void 0) {
            sheet = new CSSStyleSheet();
            sheet.replaceSync(x);
            cache.set(x, sheet);
          }
          return sheet;
        });
      }
      addStylesTo(target) {
        const t = target;
        t.adoptedStyleSheets = [...t.adoptedStyleSheets, ...this.sheets];
      }
      removeStylesFrom(target) {
        const t = target;
        t.adoptedStyleSheets = t.adoptedStyleSheets.filter((x) => this.sheets.indexOf(x) === -1);
      }
    };
  }
  var fallbackStyleId = 0;
  function createStyleElementStrategy() {
    return class FallbackStyleElementStrategy {
      constructor(styles6) {
        this.styles = styles6;
        this.styleClass = `fast-${++fallbackStyleId}`;
      }
      addStylesTo(target) {
        const t = target === document ? document.body : target;
        for (let i = 0; i < this.styles.length; i++) {
          const element = document.createElement("style");
          element.innerHTML = this.styles[i];
          element.className = this.styleClass;
          t.append(element);
        }
      }
      removeStylesFrom(target) {
        const t = target === document ? document.body : target;
        const styles6 = t.querySelectorAll(`.${this.styleClass}`);
        for (let i = 0, ii = styles6.length; i < ii; ++i) {
          t.removeChild(styles6[i]);
        }
      }
    };
  }

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/components/element-registration.js
  var ElementRegistration = {
    define(name, type, options, registry3, wasDefined) {
      registry3.define(name, type, options);
    }
  };

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/components/fast-element-registry.js
  var globalRegisteredTypes = {};
  var registeredTypesByRegistry = /* @__PURE__ */ new WeakMap();
  var typeRegistry = createTypeRegistry();
  var definitionInstances = /* @__PURE__ */ new WeakMap();
  var instanceRefs = /* @__PURE__ */ new WeakMap();
  var fastElementRegistry = Object.freeze({
    register(definition6) {
      if (!typeRegistry.register(definition6)) {
        return false;
      }
      const registeredTypes = getRegisteredTypes(definition6.registry);
      if (!Object.prototype.hasOwnProperty.call(registeredTypes, definition6.name)) {
        Observable.defineProperty(registeredTypes, definition6.name);
      }
      registeredTypes[definition6.name] = definition6.type;
      return true;
    },
    getByType: typeRegistry.getByType,
    getForInstance: typeRegistry.getForInstance,
    whenRegistered
  });
  function getRegisteredTypes(registry3 = customElements) {
    if (registry3 === customElements) {
      return globalRegisteredTypes;
    }
    let registeredTypes = registeredTypesByRegistry.get(registry3);
    if (!registeredTypes) {
      registeredTypes = {};
      registeredTypesByRegistry.set(registry3, registeredTypes);
    }
    return registeredTypes;
  }
  function getDefinitionForType(type) {
    return type === void 0 ? void 0 : fastElementRegistry.getByType(type);
  }
  function whenRegistered(name, registry3 = customElements) {
    const registeredTypes = getRegisteredTypes(registry3);
    if (!Object.prototype.hasOwnProperty.call(registeredTypes, name)) {
      Observable.defineProperty(registeredTypes, name);
    }
    const definition6 = getDefinitionForType(registeredTypes[name]);
    if (definition6 !== void 0) {
      return Promise.resolve(definition6);
    }
    return new Promise((resolve) => {
      const notifier = Observable.getNotifier(registeredTypes);
      const subscriber = {
        handleChange: () => {
          const definition7 = getDefinitionForType(registeredTypes[name]);
          if (definition7 === void 0) {
            return;
          }
          notifier.unsubscribe(subscriber, name);
          resolve(definition7);
        }
      };
      notifier.subscribe(subscriber, name);
    });
  }
  function trackFASTElementInstance(definition6, instance) {
    if (instanceRefs.has(instance)) {
      return false;
    }
    let instances = definitionInstances.get(definition6);
    const isFirstInstance = instances === void 0;
    if (instances === void 0) {
      instances = /* @__PURE__ */ new Set();
      definitionInstances.set(definition6, instances);
    }
    const ref2 = new WeakRef(instance);
    instances.add(ref2);
    instanceRefs.set(instance, ref2);
    return isFirstInstance;
  }
  function trackedFASTElementInstances(definition6, callback) {
    const instances = definitionInstances.get(definition6);
    if (instances === void 0) {
      return;
    }
    definitionInstances.delete(definition6);
    for (const ref2 of instances) {
      const instance = ref2.deref();
      if (instance !== void 0) {
        callback(instance);
      }
    }
  }

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/components/fast-definitions.js
  var defaultShadowOptions = { mode: "open" };
  var defaultElementOptions = {};
  var fastElementBaseTypes = /* @__PURE__ */ new Set();
  var templateResolvers = /* @__PURE__ */ new WeakMap();
  var pendingTemplateResolutions = /* @__PURE__ */ new WeakMap();
  var templateResolutionErrors = /* @__PURE__ */ new WeakMap();
  var extensionRegistries = /* @__PURE__ */ new WeakMap();
  var lateAttributeLookups = /* @__PURE__ */ new WeakMap();
  function isFASTElementTemplateResolver(value) {
    return isFunction(value);
  }
  function isPromiseLike(value) {
    return typeof (value === null || value === void 0 ? void 0 : value.then) === "function";
  }
  function finalizeResolvedTemplate(definition6, template6) {
    pendingTemplateResolutions.delete(definition6);
    if (definition6.template === void 0 && template6 !== void 0) {
      definition6.template = template6;
    }
    if (definition6.template !== void 0) {
      templateResolutionErrors.delete(definition6);
      templateResolvers.delete(definition6);
      return definition6.template;
    }
    return void 0;
  }
  function applyFASTElementExtensions(definition6, registry3 = definition6.registry, extensions) {
    if (!(extensions === null || extensions === void 0 ? void 0 : extensions.length)) {
      return;
    }
    const typedDefinition = definition6;
    let registries = extensionRegistries.get(typedDefinition);
    if (registries === null || registries === void 0 ? void 0 : registries.has(registry3)) {
      return;
    }
    if (registries === void 0) {
      registries = /* @__PURE__ */ new WeakSet();
      extensionRegistries.set(typedDefinition, registries);
    }
    registries.add(registry3);
    for (const extension of extensions) {
      extension(definition6);
    }
  }
  function getLateAttributeLookup(definition6) {
    var _a3;
    return (_a3 = lateAttributeLookups.get(definition6)) !== null && _a3 !== void 0 ? _a3 : null;
  }
  function resolveFASTElementTemplate(definition6) {
    if (definition6.template !== void 0) {
      templateResolutionErrors.delete(definition6);
      return definition6.template;
    }
    const pendingResolution = pendingTemplateResolutions.get(definition6);
    if (pendingResolution) {
      return pendingResolution;
    }
    const templateResolver = templateResolvers.get(definition6);
    if (!templateResolver) {
      return void 0;
    }
    templateResolutionErrors.delete(definition6);
    let template6;
    try {
      template6 = templateResolver(definition6);
    } catch (error) {
      templateResolutionErrors.set(definition6, error);
      throw error;
    }
    if (isPromiseLike(template6)) {
      const resolution = Promise.resolve(template6).then((resolvedTemplate) => finalizeResolvedTemplate(definition6, resolvedTemplate)).catch((error) => {
        pendingTemplateResolutions.delete(definition6);
        templateResolutionErrors.set(definition6, error);
        throw error;
      });
      pendingTemplateResolutions.set(definition6, resolution);
      return resolution;
    }
    return finalizeResolvedTemplate(definition6, template6);
  }
  function setFASTElementTemplateError(definition6, error) {
    const typedDefinition = definition6;
    if (error === void 0) {
      templateResolutionErrors.delete(typedDefinition);
      return;
    }
    templateResolutionErrors.set(typedDefinition, error);
  }
  var FASTElementDefinition = class _FASTElementDefinition {
    /**
     * Indicates if this element has been defined in at least one registry.
     */
    get isDefined() {
      return this.platformDefined;
    }
    constructor(type, nameOrConfig = type.definition) {
      var _a3;
      this.platformDefined = false;
      if (isString(nameOrConfig)) {
        nameOrConfig = { name: nameOrConfig };
      }
      this.type = type;
      this.name = nameOrConfig.name;
      this.registry = (_a3 = nameOrConfig.registry) !== null && _a3 !== void 0 ? _a3 : customElements;
      if (isFASTElementTemplateResolver(nameOrConfig.template)) {
        templateResolvers.set(this, nameOrConfig.template);
      } else {
        this.template = nameOrConfig.template;
      }
      const proto = type.prototype;
      const attributes = AttributeDefinition.collect(type, nameOrConfig.attributes);
      const observedAttributes = new Array(attributes.length);
      const propertyLookup = {};
      const attributeLookup = {};
      for (let i = 0, ii = attributes.length; i < ii; ++i) {
        const current = attributes[i];
        observedAttributes[i] = current.attribute;
        propertyLookup[current.name] = current;
        attributeLookup[current.attribute] = current;
        Observable.defineProperty(proto, current);
      }
      Reflect.defineProperty(type, "observedAttributes", {
        value: observedAttributes,
        enumerable: true
      });
      this.attributes = attributes;
      this.propertyLookup = propertyLookup;
      this.attributeLookup = attributeLookup;
      this.shadowOptions = nameOrConfig.shadowOptions === void 0 ? defaultShadowOptions : nameOrConfig.shadowOptions === null ? void 0 : Object.assign(Object.assign({}, defaultShadowOptions), nameOrConfig.shadowOptions);
      this.elementOptions = nameOrConfig.elementOptions === void 0 ? defaultElementOptions : Object.assign(Object.assign({}, defaultElementOptions), nameOrConfig.elementOptions);
      this.styles = ElementStyles.normalize(nameOrConfig.styles);
      this.schema = nameOrConfig.schema;
      fastElementRegistry.register(this);
    }
    /**
     * Defines a custom element based on this definition.
     * @param registry - The element registry to define the element in.
     * @param extensions - An optional array of extension callbacks to invoke
     * with this definition before platform registration.
     * @remarks
     * This operation is idempotent per registry.
     */
    define(registry3 = this.registry, extensions) {
      const type = this.type;
      if (!registry3.get(this.name)) {
        applyFASTElementExtensions(this, registry3, extensions);
        if (this.template === void 0 && templateResolvers.has(this)) {
          void Promise.resolve().then(() => resolveFASTElementTemplate(this)).then((template6) => {
            if (template6 !== void 0 && !registry3.get(this.name)) {
              const wasDefined2 = this.platformDefined;
              this.platformDefined = true;
              ElementRegistration.define(this.name, type, this.elementOptions, registry3, wasDefined2);
            }
          }).catch((error) => {
            setFASTElementTemplateError(this, error);
            Observable.notify(this, "template");
          });
          return this;
        }
        const wasDefined = this.platformDefined;
        this.platformDefined = true;
        ElementRegistration.define(this.name, type, this.elementOptions, registry3, wasDefined);
      }
      return this;
    }
    /**
     * Creates an instance of FASTElementDefinition.
     * @param type - The type this definition is being created for.
     * @param nameOrDef - The name of the element to define or a config object
     * that describes the element to define.
     */
    static compose(type, nameOrDef) {
      const definition6 = fastElementBaseTypes.has(type) || fastElementRegistry.getByType(type) ? new _FASTElementDefinition(class extends type {
      }, nameOrDef) : new _FASTElementDefinition(type, nameOrDef);
      return Promise.resolve(definition6);
    }
    /**
     * Registers a FASTElement base type.
     * @param type - The type to register as a base type.
     * @internal
     */
    static registerBaseType(type) {
      fastElementBaseTypes.add(type);
    }
  };
  FASTElementDefinition.getByType = fastElementRegistry.getByType;
  FASTElementDefinition.getForInstance = fastElementRegistry.getForInstance;
  Observable.defineProperty(FASTElementDefinition.prototype, "template");

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/components/element-controller.js
  var defaultEventOptions = {
    bubbles: true,
    composed: true,
    cancelable: true
  };
  var isConnectedPropertyName = "isConnected";
  var shadowRoots = /* @__PURE__ */ new WeakMap();
  var lateAttributeObserver = /* @__PURE__ */ Symbol("fast-late-attribute-observer");
  function getShadowRoot(element) {
    var _a3, _b2;
    return (_b2 = (_a3 = element.shadowRoot) !== null && _a3 !== void 0 ? _a3 : shadowRoots.get(element)) !== null && _b2 !== void 0 ? _b2 : null;
  }
  var elementControllerStrategy;
  var Stages;
  (function(Stages2) {
    Stages2[Stages2["connecting"] = 0] = "connecting";
    Stages2[Stages2["connected"] = 1] = "connected";
    Stages2[Stages2["disconnecting"] = 2] = "disconnecting";
    Stages2[Stages2["disconnected"] = 3] = "disconnected";
  })(Stages || (Stages = {}));
  var ElementController = class _ElementController {
    /**
     * Indicates whether or not the custom element has been
     * connected to the document.
     */
    get isConnected() {
      Observable.track(this, isConnectedPropertyName);
      return this.stage === Stages.connected;
    }
    /**
     * The context the expression is evaluated against.
     */
    get context() {
      var _a3;
      var _b2;
      return (_b2 = (_a3 = this.view) === null || _a3 === void 0 ? void 0 : _a3.context) !== null && _b2 !== void 0 ? _b2 : ExecutionContext.default;
    }
    /**
     * Indicates whether the controller is bound.
     */
    get isBound() {
      var _a3;
      var _b2;
      return (_b2 = (_a3 = this.view) === null || _a3 === void 0 ? void 0 : _a3.isBound) !== null && _b2 !== void 0 ? _b2 : false;
    }
    /**
     * Indicates how the source's lifetime relates to the controller's lifetime.
     */
    get sourceLifetime() {
      var _a3;
      return (_a3 = this.view) === null || _a3 === void 0 ? void 0 : _a3.sourceLifetime;
    }
    /**
     * Gets/sets the template used to render the component.
     * @remarks
     * This value can only be accurately read after connect but can be set at any time.
     */
    get template() {
      var _a3;
      if (this._template === null) {
        const definition6 = this.definition;
        if (this.source.resolveTemplate) {
          this._template = this.source.resolveTemplate();
        } else if (definition6.template) {
          this._template = (_a3 = definition6.template) !== null && _a3 !== void 0 ? _a3 : null;
        }
      }
      return this._template;
    }
    set template(value) {
      if (this._template === value) {
        return;
      }
      this._template = value;
      if (!this.needsInitialization) {
        this.renderTemplate(value);
      }
    }
    /**
     * The shadow root options for the component.
     */
    get shadowOptions() {
      return this._shadowRootOptions;
    }
    set shadowOptions(value) {
      if (this._shadowRootOptions === void 0 && value !== void 0) {
        this._shadowRootOptions = value;
        let shadowRoot = this.source.shadowRoot;
        if (shadowRoot) {
          this.hasExistingShadowRoot = true;
        } else {
          shadowRoot = this.source.attachShadow(value);
          if (value.mode === "closed") {
            shadowRoots.set(this.source, shadowRoot);
          }
        }
      }
    }
    /**
     * The main set of styles used for the component, independent
     * of any dynamically added styles.
     */
    get mainStyles() {
      var _a3;
      if (this._mainStyles === null) {
        const definition6 = this.definition;
        if (this.source.resolveStyles) {
          this._mainStyles = this.source.resolveStyles();
        } else if (definition6.styles) {
          this._mainStyles = (_a3 = definition6.styles) !== null && _a3 !== void 0 ? _a3 : null;
        }
      }
      return this._mainStyles;
    }
    set mainStyles(value) {
      if (this._mainStyles === value) {
        return;
      }
      if (this._mainStyles !== null) {
        this.removeStyles(this._mainStyles);
      }
      this._mainStyles = value;
      if (!this.needsInitialization) {
        this.addStyles(value);
      }
    }
    /**
     * Creates a Controller to control the specified element.
     * @param element - The element to be controlled by this controller.
     * @param definition - The element definition metadata that instructs this
     * controller in how to handle rendering and other platform integrations.
     * @internal
     */
    constructor(element, definition6) {
      this.boundObservables = null;
      this.needsInitialization = true;
      this.hasExistingShadowRoot = false;
      this.isPrerendered = new Promise((resolve) => {
        this._resolvePrerendered = resolve;
      });
      this.isHydrated = new Promise((resolve) => {
        this._resolveHydrated = resolve;
      });
      this._template = null;
      this.stage = Stages.disconnected;
      this.guardBehaviorConnection = false;
      this.behaviors = null;
      this.behaviorsConnected = false;
      this._mainStyles = null;
      this.$fastController = this;
      this.view = null;
      this._notifier = new PropertyChangeNotifier(element);
      this.source = element;
      this.definition = definition6;
      this.shadowOptions = definition6.shadowOptions;
      const prototype = Reflect.getPrototypeOf(element);
      const accessors = prototype === null ? [] : Observable.getAccessors(prototype);
      if (accessors.length > 0) {
        const boundObservables = this.boundObservables = /* @__PURE__ */ Object.create(null);
        for (let i = 0, ii = accessors.length; i < ii; ++i) {
          const propertyName = accessors[i].name;
          const value = element[propertyName];
          if (value !== void 0) {
            delete element[propertyName];
            boundObservables[propertyName] = value;
          }
        }
        if (Object.keys(boundObservables).length === 0) {
          this.boundObservables = null;
        }
      }
      this.captureBoundObservables();
    }
    /**
     * The subject that subscribers will receive notifications for.
     */
    get subject() {
      return this._notifier.subject;
    }
    /**
     * Notifies all subscribers of a property change.
     * @param args - The property name that changed.
     */
    notify(args) {
      this._notifier.notify(args);
    }
    /**
     * Subscribes to notification of changes in the element's state.
     * @param subscriber - The object that is subscribing for change notification.
     * @param propertyToWatch - The name of the property to watch for changes.
     */
    subscribe(subscriber, propertyToWatch) {
      this._notifier.subscribe(subscriber, propertyToWatch);
    }
    /**
     * Unsubscribes from notification of changes in the element's state.
     * @param subscriber - The object that is unsubscribing from change notification.
     * @param propertyToUnwatch - The name of the property to unsubscribe from.
     */
    unsubscribe(subscriber, propertyToUnwatch) {
      this._notifier.unsubscribe(subscriber, propertyToUnwatch);
    }
    /**
     * Registers an unbind handler with the controller.
     * @param behavior - An object to call when the controller unbinds.
     */
    onUnbind(behavior) {
      var _a3;
      (_a3 = this.view) === null || _a3 === void 0 ? void 0 : _a3.onUnbind(behavior);
    }
    /**
     * Adds the behavior to the component.
     * @param behavior - The behavior to add.
     */
    addBehavior(behavior) {
      var _a3, _b2;
      const targetBehaviors = (_a3 = this.behaviors) !== null && _a3 !== void 0 ? _a3 : this.behaviors = /* @__PURE__ */ new Map();
      const count = (_b2 = targetBehaviors.get(behavior)) !== null && _b2 !== void 0 ? _b2 : 0;
      if (count === 0) {
        targetBehaviors.set(behavior, 1);
        behavior.addedCallback && behavior.addedCallback(this);
        if (behavior.connectedCallback && !this.guardBehaviorConnection && (this.stage === Stages.connected || this.stage === Stages.connecting)) {
          behavior.connectedCallback(this);
        }
      } else {
        targetBehaviors.set(behavior, count + 1);
      }
    }
    /**
     * Removes the behavior from the component.
     * @param behavior - The behavior to remove.
     * @param force - Forces removal even if this behavior was added more than once.
     */
    removeBehavior(behavior, force = false) {
      const targetBehaviors = this.behaviors;
      if (targetBehaviors === null) {
        return;
      }
      const count = targetBehaviors.get(behavior);
      if (count === void 0) {
        return;
      }
      if (count === 1 || force) {
        targetBehaviors.delete(behavior);
        if (behavior.disconnectedCallback && this.stage !== Stages.disconnected) {
          behavior.disconnectedCallback(this);
        }
        behavior.removedCallback && behavior.removedCallback(this);
      } else {
        targetBehaviors.set(behavior, count - 1);
      }
    }
    /**
     * Adds styles to this element. Providing an HTMLStyleElement will attach the element instance to the shadowRoot.
     * @param styles - The styles to add.
     */
    addStyles(styles6) {
      var _a3;
      if (!styles6) {
        return;
      }
      const source = this.source;
      if (styles6 instanceof HTMLElement) {
        const target = (_a3 = getShadowRoot(source)) !== null && _a3 !== void 0 ? _a3 : this.source;
        target.append(styles6);
      } else if (!styles6.isAttachedTo(source)) {
        styles6.addStylesTo(source);
      }
    }
    /**
     * Removes styles from this element. Providing an HTMLStyleElement will detach the element instance from the shadowRoot.
     * @param styles - the styles to remove.
     */
    removeStyles(styles6) {
      var _a3;
      if (!styles6) {
        return;
      }
      const source = this.source;
      if (styles6 instanceof HTMLElement) {
        const target = (_a3 = getShadowRoot(source)) !== null && _a3 !== void 0 ? _a3 : source;
        target.removeChild(styles6);
      } else if (styles6.isAttachedTo(source)) {
        styles6.removeStylesFrom(source);
      }
    }
    /**
     * Runs connected lifecycle behavior on the associated element.
     */
    connect() {
      if (this.stage !== Stages.disconnected) {
        return;
      }
      this.stage = Stages.connecting;
      this.captureBoundObservables();
      this.syncLateAttributes();
      this.observeLateAttributes();
      this.bindObservables();
      this.connectBehaviors();
      if (this.needsInitialization) {
        this.renderTemplate(this.template);
        this.addStyles(this.mainStyles);
        this.needsInitialization = false;
      } else if (this.view !== null) {
        this.view.bind(this.source);
      }
      this.stage = Stages.connected;
      Observable.notify(this, isConnectedPropertyName);
    }
    /**
     * Binds any observables that were set before upgrade.
     */
    bindObservables() {
      if (this.boundObservables !== null) {
        const element = this.source;
        const boundObservables = this.boundObservables;
        const propertyNames = Object.keys(boundObservables);
        for (let i = 0, ii = propertyNames.length; i < ii; ++i) {
          const propertyName = propertyNames[i];
          element[propertyName] = boundObservables[propertyName];
        }
        this.boundObservables = null;
      }
    }
    /**
     * Captures public own-properties that shadow observable accessors on the
     * prototype so they can be rebound through the accessor before rendering.
     */
    captureBoundObservables() {
      const element = this.source;
      const propertyNames = Object.getOwnPropertyNames(element);
      const hasPrototypeAccessor = (propertyName) => {
        let currentTarget = Reflect.getPrototypeOf(element);
        while (currentTarget !== null) {
          const descriptor = Reflect.getOwnPropertyDescriptor(currentTarget, propertyName);
          if ((descriptor === null || descriptor === void 0 ? void 0 : descriptor.get) || (descriptor === null || descriptor === void 0 ? void 0 : descriptor.set)) {
            return true;
          }
          currentTarget = Reflect.getPrototypeOf(currentTarget);
        }
        return false;
      };
      let boundObservables = this.boundObservables;
      for (let i = 0, ii = propertyNames.length; i < ii; ++i) {
        const ownPropertyName = propertyNames[i];
        const propertyName = ownPropertyName;
        if (!hasPrototypeAccessor(propertyName)) {
          continue;
        }
        const value = element[propertyName];
        if (value === void 0) {
          delete element[propertyName];
          continue;
        }
        delete element[propertyName];
        (boundObservables !== null && boundObservables !== void 0 ? boundObservables : boundObservables = this.boundObservables = /* @__PURE__ */ Object.create(null))[propertyName] = value;
      }
    }
    /**
     * Synchronizes late-defined attribute-map attributes from the live DOM to the
     * associated property values before the initial render occurs.
     */
    syncLateAttributes() {
      const lateAttributes = getLateAttributeLookup(this.definition);
      if (lateAttributes === null) {
        return;
      }
      for (const attributeName of Object.keys(lateAttributes)) {
        if (!this.source.hasAttribute(attributeName)) {
          continue;
        }
        this.onAttributeChangedCallback(attributeName, null, this.source.getAttribute(attributeName));
      }
    }
    /**
     * Observes late-defined attribute-map attributes that the platform does not
     * surface through attributeChangedCallback because they were added after
     * customElements.define() completed.
     */
    observeLateAttributes() {
      const lateAttributes = getLateAttributeLookup(this.definition);
      if (lateAttributes === null) {
        return;
      }
      const element = this.source;
      if (element[lateAttributeObserver] !== void 0) {
        return;
      }
      element[lateAttributeObserver] = new MutationObserver((records) => {
        const controller = element.$fastController;
        const lateAttributes2 = getLateAttributeLookup(controller.definition);
        if (lateAttributes2 === null) {
          return;
        }
        for (let i = 0, ii = records.length; i < ii; ++i) {
          const attributeName = records[i].attributeName;
          if (attributeName === null || lateAttributes2[attributeName] === void 0) {
            continue;
          }
          controller.onAttributeChangedCallback(attributeName, null, element.getAttribute(attributeName));
        }
      });
      element[lateAttributeObserver].observe(element, {
        attributes: true,
        attributeFilter: Object.keys(lateAttributes)
      });
    }
    /**
     * Connects any existing behaviors on the associated element.
     */
    connectBehaviors() {
      if (this.behaviorsConnected === false) {
        const behaviors = this.behaviors;
        if (behaviors !== null) {
          this.guardBehaviorConnection = true;
          for (const key of behaviors.keys()) {
            key.connectedCallback && key.connectedCallback(this);
          }
          this.guardBehaviorConnection = false;
        }
        this.behaviorsConnected = true;
      }
    }
    /**
     * Disconnects any behaviors on the associated element.
     */
    disconnectBehaviors() {
      if (this.behaviorsConnected === true) {
        const behaviors = this.behaviors;
        if (behaviors !== null) {
          for (const key of behaviors.keys()) {
            key.disconnectedCallback && key.disconnectedCallback(this);
          }
        }
        this.behaviorsConnected = false;
      }
    }
    /**
     * Runs disconnected lifecycle behavior on the associated element.
     */
    disconnect() {
      if (this.stage !== Stages.connected) {
        return;
      }
      this.stage = Stages.disconnecting;
      Observable.notify(this, isConnectedPropertyName);
      if (this.view !== null) {
        this.view.unbind();
      }
      this.disconnectBehaviors();
      this.stage = Stages.disconnected;
    }
    /**
     * Runs the attribute changed callback for the associated element.
     * @param name - The name of the attribute that changed.
     * @param oldValue - The previous value of the attribute.
     * @param newValue - The new value of the attribute.
     */
    onAttributeChangedCallback(name, oldValue, newValue) {
      const attrDef = this.definition.attributeLookup[name];
      if (attrDef !== void 0) {
        attrDef.onAttributeChangedCallback(this.source, newValue);
      }
    }
    /**
     * Emits a custom HTML event.
     * @param type - The type name of the event.
     * @param detail - The event detail object to send with the event.
     * @param options - The event options. By default bubbles and composed.
     * @remarks
     * Only emits events if connected.
     */
    emit(type, detail, options) {
      if (this.stage === Stages.connected) {
        return this.source.dispatchEvent(new CustomEvent(type, Object.assign(Object.assign({ detail }, defaultEventOptions), options)));
      }
      return false;
    }
    /**
     * Renders the provided template to the element.
     *
     * @param template - The template to render.
     * @remarks
     * If `null` is provided, any existing view will be removed.
     */
    renderTemplate(template6) {
      var _a3;
      const element = this.source;
      const host = (_a3 = getShadowRoot(element)) !== null && _a3 !== void 0 ? _a3 : element;
      if (this.view !== null) {
        this.view.dispose();
        this.view = null;
      } else if (!this.needsInitialization || this.hasExistingShadowRoot) {
        if (!this.hasExistingShadowRoot || !this.needsInitialization) {
          for (let child = host.firstChild; child !== null; child = host.firstChild) {
            host.removeChild(child);
          }
        }
      }
      if (template6) {
        const hasPrerenderedContent = this.hasExistingShadowRoot && this.needsInitialization;
        let didHydrate = false;
        if (hasPrerenderedContent && _ElementController.hydrationHook) {
          didHydrate = _ElementController.hydrationHook(this, template6, element, host);
        }
        if (!didHydrate) {
          this.renderClientSide(template6, element, host);
        }
        this._resolvePrerendered(hasPrerenderedContent);
        this._resolveHydrated(didHydrate);
      } else if (this.needsInitialization) {
        this._resolvePrerendered(false);
        this._resolveHydrated(false);
      }
    }
    /**
     * Standard client-side render: clears any stale content, clones the
     * compiled fragment, binds, and appends to the host.
     */
    renderClientSide(template6, element, host) {
      if (this.hasExistingShadowRoot) {
        for (let child = host.firstChild; child !== null; child = host.firstChild) {
          host.removeChild(child);
        }
        this.hasExistingShadowRoot = false;
      }
      this.view = template6.render(element, host, element);
      this.view.sourceLifetime = SourceLifetime.coupled;
    }
    /**
     * Locates or creates a controller for the specified element.
     * @param element - The element to return the controller for.
     * @param override - Reset the controller even if one has been defined.
     * @remarks
     * The specified element must have a {@link FASTElementDefinition}
     * registered either through the use of the {@link customElement}
     * decorator or a call to `FASTElement.define`.
     */
    static forCustomElement(element, override = false) {
      const controller = element.$fastController;
      if (controller !== void 0 && !override) {
        return controller;
      }
      const definition6 = FASTElementDefinition.getForInstance(element);
      if (definition6 === void 0) {
        throw FAST.error(Message.missingElementDefinition);
      }
      if (definition6.template === void 0 && trackFASTElementInstance(definition6, element)) {
        const notifier = Observable.getNotifier(definition6);
        const subscriber = {
          handleChange: () => {
            notifier.unsubscribe(subscriber, "template");
            trackedFASTElementInstances(definition6, (tracked) => {
              const trackedElement = tracked;
              _ElementController.forCustomElement(trackedElement, true);
              if (trackedElement.isConnected) {
                trackedElement.$fastController.connect();
              }
            });
          }
        };
        notifier.subscribe(subscriber, "template");
      }
      return element.$fastController = new elementControllerStrategy(element, definition6);
    }
    /**
     * Sets the strategy that ElementController.forCustomElement uses to construct
     * ElementController instances for an element.
     * @param strategy - The strategy to use.
     */
    static setStrategy(strategy) {
      elementControllerStrategy = strategy;
    }
    /**
     * Installs the hydration hook. Called by enableHydration().
     * @internal
     */
    static installHydrationHook(hook) {
      _ElementController.hydrationHook = hook;
    }
  };
  ElementController.hydrationHook = null;
  makeSerializationNoop(ElementController);
  ElementController.setStrategy(ElementController);
  function normalizeStyleTarget(target) {
    var _a3;
    if ("adoptedStyleSheets" in target) {
      return target;
    } else {
      return (_a3 = getShadowRoot(target)) !== null && _a3 !== void 0 ? _a3 : target.getRootNode();
    }
  }
  var AdoptedStyleSheetsStrategy = class _AdoptedStyleSheetsStrategy {
    constructor(styles6) {
      const styleSheetCache = _AdoptedStyleSheetsStrategy.styleSheetCache;
      this.sheets = styles6.map((x) => {
        if (x instanceof CSSStyleSheet) {
          return x;
        }
        let sheet = styleSheetCache.get(x);
        if (sheet === void 0) {
          sheet = new CSSStyleSheet();
          sheet.replaceSync(x);
          styleSheetCache.set(x, sheet);
        }
        return sheet;
      });
    }
    addStylesTo(target) {
      addAdoptedStyleSheets(normalizeStyleTarget(target), this.sheets);
    }
    removeStylesFrom(target) {
      removeAdoptedStyleSheets(normalizeStyleTarget(target), this.sheets);
    }
  };
  AdoptedStyleSheetsStrategy.styleSheetCache = /* @__PURE__ */ new Map();
  var id = 0;
  var nextStyleId = () => `fast-${++id}`;
  function usableStyleTarget(target) {
    return target === document ? document.body : target;
  }
  var StyleElementStrategy = class {
    constructor(styles6) {
      this.styles = styles6;
      this.styleClass = nextStyleId();
    }
    addStylesTo(target) {
      target = usableStyleTarget(normalizeStyleTarget(target));
      const styles6 = this.styles;
      const styleClass = this.styleClass;
      for (let i = 0; i < styles6.length; i++) {
        const element = document.createElement("style");
        element.innerHTML = styles6[i];
        element.className = styleClass;
        target.append(element);
      }
    }
    removeStylesFrom(target) {
      target = usableStyleTarget(normalizeStyleTarget(target));
      const styles6 = target.querySelectorAll(`.${this.styleClass}`);
      for (let i = 0, ii = styles6.length; i < ii; ++i) {
        target.removeChild(styles6[i]);
      }
    }
  };
  var addAdoptedStyleSheets = (target, sheets) => {
    target.adoptedStyleSheets = [...target.adoptedStyleSheets, ...sheets];
  };
  var removeAdoptedStyleSheets = (target, sheets) => {
    target.adoptedStyleSheets = target.adoptedStyleSheets.filter((x) => sheets.indexOf(x) === -1);
  };
  if (ElementStyles.supportsAdoptedStyleSheets) {
    try {
      document.adoptedStyleSheets.push();
      document.adoptedStyleSheets.splice();
      addAdoptedStyleSheets = (target, sheets) => {
        target.adoptedStyleSheets.push(...sheets);
      };
      removeAdoptedStyleSheets = (target, sheets) => {
        for (const sheet of sheets) {
          const index = target.adoptedStyleSheets.indexOf(sheet);
          if (index !== -1) {
            target.adoptedStyleSheets.splice(index, 1);
          }
        }
      };
    } catch (_e) {
    }
    ElementStyles.setDefaultStrategy(AdoptedStyleSheetsStrategy);
  } else {
    ElementStyles.setDefaultStrategy(StyleElementStrategy);
  }

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/components/fast-element.js
  function createFASTElement(BaseType) {
    const type = class extends BaseType {
      constructor() {
        super();
        ElementController.forCustomElement(this);
      }
      $emit(type2, detail, options) {
        return this.$fastController.emit(type2, detail, options);
      }
      connectedCallback() {
        this.$fastController.connect();
      }
      disconnectedCallback() {
        this.$fastController.disconnect();
      }
      attributeChangedCallback(name, oldValue, newValue) {
        this.$fastController.onAttributeChangedCallback(name, oldValue, newValue);
      }
    };
    FASTElementDefinition.registerBaseType(type);
    return type;
  }
  function isPromiseLike2(value) {
    return typeof (value === null || value === void 0 ? void 0 : value.then) === "function";
  }
  function define(type, nameOrDef, extensions) {
    if (Array.isArray(nameOrDef)) {
      extensions = nameOrDef;
      nameOrDef = void 0;
    }
    const composePromise = isFunction(type) ? FASTElementDefinition.compose(type, nameOrDef) : FASTElementDefinition.compose(this, type);
    return composePromise.then((def) => {
      applyFASTElementExtensions(def, def.registry, extensions);
      const template6 = resolveFASTElementTemplate(def);
      if (isPromiseLike2(template6)) {
        return template6.then(() => def.define().type);
      }
      return def.define().type;
    });
  }
  function from(BaseType) {
    return createFASTElement(BaseType);
  }
  var FASTElement = Object.assign(createFASTElement(HTMLElement), {
    /**
     * Creates a new FASTElement base class inherited from the
     * provided base type.
     * @param BaseType - The base element type to inherit from.
     */
    from,
    /**
     * Defines a platform custom element based on the provided type and definition.
     * @param type - The custom element type to define.
     * @param nameOrDef - The name of the element to define or a definition object
     * that describes the element to define.
     */
    define
  });

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/styles/css-directive.js
  var registry = createTypeRegistry();
  var CSSDirective = Object.freeze({
    /**
     * Gets the directive definition associated with the instance.
     * @param instance - The directive instance to retrieve the definition for.
     */
    getForInstance: registry.getForInstance,
    /**
     * Gets the directive definition associated with the specified type.
     * @param type - The directive type to retrieve the definition for.
     */
    getByType: registry.getByType,
    /**
     * Defines a CSSDirective.
     * @param type - The type to define as a directive.
     */
    define(type) {
      registry.register({ type });
      return type;
    }
  });

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/styles/css.js
  function collectStyles(strings, values) {
    const styles6 = [];
    let cssString = "";
    for (let i = 0, ii = strings.length - 1; i < ii; ++i) {
      cssString += strings[i];
      let value = values[i];
      if (CSSDirective.getForInstance(value) !== void 0) {
        value = value.createCSS();
      }
      if (value instanceof ElementStyles || value instanceof CSSStyleSheet) {
        if (cssString.trim() !== "") {
          styles6.push(cssString);
          cssString = "";
        }
        styles6.push(value);
      } else {
        cssString += value;
      }
    }
    cssString += strings[strings.length - 1];
    if (cssString.trim() !== "") {
      styles6.push(cssString);
    }
    return styles6;
  }
  var css = ((strings, ...values) => {
    return new ElementStyles(collectStyles(strings, values));
  });
  var CSSPartial = class {
    constructor(styles6) {
      this.value = styles6.length === 0 ? "" : styles6.length === 1 ? styles6[0] : new ElementStyles(styles6);
    }
    createCSS() {
      return this.value;
    }
  };
  CSSDirective.define(CSSPartial);
  css.partial = (strings, ...values) => {
    return new CSSPartial(collectStyles(strings, values));
  };

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/templating/markup.js
  var marker = `fast-${Math.random().toString(36).substring(2, 8)}`;
  var interpolationStart = `${marker}{`;
  var interpolationEnd = `}${marker}`;
  var interpolationEndLength = interpolationEnd.length;
  var id2 = 0;
  var nextId = () => `${marker}-${++id2}`;
  var Markup = Object.freeze({
    /**
     * Creates a placeholder string suitable for marking out a location *within*
     * an attribute value or HTML content.
     * @param index - The directive index to create the placeholder for.
     * @remarks
     * Used internally by binding directives.
     */
    interpolation: (id3) => `${interpolationStart}${id3}${interpolationEnd}`,
    /**
     * Creates a placeholder that manifests itself as an attribute on an
     * element.
     * @param attributeName - The name of the custom attribute.
     * @param index - The directive index to create the placeholder for.
     * @remarks
     * Used internally by attribute directives such as `ref`, `slotted`, and `children`.
     */
    attribute: (id3) => `${nextId()}="${interpolationStart}${id3}${interpolationEnd}"`,
    /**
     * Creates a placeholder that manifests itself as a marker within the DOM structure.
     * @param index - The directive index to create the placeholder for.
     * @remarks
     * Used internally by structural directives such as `repeat`.
     */
    comment: (id3) => `<!--${interpolationStart}${id3}${interpolationEnd}-->`
  });
  var Parser = Object.freeze({
    /**
     * Parses text content or HTML attribute content, separating out the static strings
     * from the directives.
     * @param value - The content or attribute string to parse.
     * @param factories - A list of directives to search for in the string.
     * @returns A heterogeneous array of static strings interspersed with
     * directives or null if no directives are found in the string.
     */
    parse(value, factories) {
      const parts = value.split(interpolationStart);
      if (parts.length === 1) {
        return null;
      }
      const result = [];
      for (let i = 0, ii = parts.length; i < ii; ++i) {
        const current = parts[i];
        const index = current.indexOf(interpolationEnd);
        let literal;
        if (index === -1) {
          literal = current;
        } else {
          const factoryId = current.substring(0, index);
          result.push(factories[factoryId]);
          literal = current.substring(index + interpolationEndLength);
        }
        if (literal !== "") {
          result.push(literal);
        }
      }
      return result;
    }
  });

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/templating/html-directive.js
  var registry2 = createTypeRegistry();
  var HTMLDirective = Object.freeze({
    /**
     * Gets the directive definition associated with the instance.
     * @param instance - The directive instance to retrieve the definition for.
     */
    getForInstance: registry2.getForInstance,
    /**
     * Gets the directive definition associated with the specified type.
     * @param type - The directive type to retrieve the definition for.
     */
    getByType: registry2.getByType,
    /**
     * Defines an HTMLDirective based on the options.
     * @param type - The type to define as a directive.
     * @param options - Options that specify the directive's application.
     */
    define(type, options) {
      options = options || {};
      options.type = type;
      registry2.register(options);
      return type;
    },
    /**
     * Determines the DOM aspect type for a directive based on attribute name prefix.
     * The prefix convention maps to aspect types as follows:
     *   - No prefix (e.g. "class")  → DOMAspect.attribute
     *   - ":" prefix (e.g. ":value") → DOMAspect.property (":classList" → DOMAspect.tokenList)
     *   - "?" prefix (e.g. "?disabled") → DOMAspect.booleanAttribute
     *   - `@` prefix (e.g. `@click`) → DOMAspect.event
     *   - Falsy or absent value → DOMAspect.content (see remarks)
     * @param directive - The directive to assign the aspect to.
     * @param value - The value to base the aspect determination on.
     * @remarks
     * If a falsy value is provided, then the content aspect will be assigned.
     */
    assignAspect(directive, value) {
      if (!value) {
        directive.aspectType = DOMAspect.content;
        return;
      }
      directive.sourceAspect = value;
      switch (value[0]) {
        case ":":
          directive.targetAspect = value.substring(1);
          directive.aspectType = directive.targetAspect === "classList" ? DOMAspect.tokenList : DOMAspect.property;
          break;
        case "?":
          directive.targetAspect = value.substring(1);
          directive.aspectType = DOMAspect.booleanAttribute;
          break;
        case "@":
          directive.targetAspect = value.substring(1);
          directive.aspectType = DOMAspect.event;
          break;
        default:
          directive.targetAspect = value;
          directive.aspectType = DOMAspect.attribute;
          break;
      }
    }
  });
  var StatelessAttachedAttributeDirective = class {
    /**
     * Creates an instance of RefDirective.
     * @param options - The options to use in configuring the directive.
     */
    constructor(options) {
      this.options = options;
    }
    /**
     * Creates a placeholder string based on the directive's index within the template.
     * @param index - The index of the directive within the template.
     * @remarks
     * Creates a custom attribute placeholder.
     */
    createHTML(add) {
      return Markup.attribute(add(this));
    }
    /**
     * Creates a behavior.
     * @param targets - The targets available for behaviors to be attached to.
     */
    createBehavior() {
      return this;
    }
  };
  makeSerializationNoop(StatelessAttachedAttributeDirective);

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/templating/node-observation.js
  var NodeObservationDirective = class extends StatelessAttachedAttributeDirective {
    /**
     * The unique id of the factory.
     */
    get id() {
      return this._id;
    }
    set id(value) {
      this._id = value;
      this._controllerProperty = `${value}-c`;
    }
    /**
     * Bind this behavior to the source.
     * @param source - The source to bind to.
     * @param context - The execution context that the binding is operating within.
     * @param targets - The targets that behaviors in a view can attach to.
     */
    bind(controller) {
      const target = controller.targets[this.targetNodeId];
      target[this._controllerProperty] = controller;
      this.updateTarget(controller.source, this.computeNodes(target));
      this.observe(target);
      controller.onUnbind(this);
    }
    /**
     * Unbinds this behavior from the source.
     * @param source - The source to unbind from.
     * @param context - The execution context that the binding is operating within.
     * @param targets - The targets that behaviors in a view can attach to.
     */
    unbind(controller) {
      const target = controller.targets[this.targetNodeId];
      this.updateTarget(controller.source, emptyArray);
      this.disconnect(target);
      target[this._controllerProperty] = null;
    }
    /**
     * Gets the data source for the target.
     * @param target - The target to get the source for.
     * @returns The source.
     */
    getSource(target) {
      return target[this._controllerProperty].source;
    }
    /**
     * Updates the source property with the computed nodes.
     * @param source - The source object to assign the nodes property to.
     * @param value - The nodes to assign to the source object property.
     */
    updateTarget(source, value) {
      source[this.options.property] = value;
    }
    /**
     * Computes the set of nodes that should be assigned to the source property.
     * @param target - The target to compute the nodes for.
     * @returns The computed nodes.
     * @remarks
     * Applies filters if provided.
     */
    computeNodes(target) {
      let nodes = this.getNodes(target);
      if ("filter" in this.options) {
        nodes = nodes.filter(this.options.filter);
      }
      return nodes;
    }
  };

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/hydration/markers.js
  var hydrationMarkersBrand = /* @__PURE__ */ Symbol();
  var markerStrategies = /* @__PURE__ */ new WeakMap();
  function createHydrationMarkers(implementation) {
    const markers = Object.freeze(Object.assign(Object.assign({}, implementation), { [hydrationMarkersBrand]: true }));
    markerStrategies.set(markers, markers);
    return markers;
  }
  function isComment(node) {
    return node.nodeType === Node.COMMENT_NODE;
  }
  function parseAttributeBindingCount(node) {
    const attr2 = node.getAttribute("data-fe");
    if (attr2 === null) {
      return null;
    }
    const trimmed = attr2.trim();
    if (!/^\d+$/.test(trimmed)) {
      throw FAST.error(Message.invalidHydrationAttributeMarker, {
        value: attr2
      });
    }
    const count = parseInt(trimmed, 10);
    if (count < 1) {
      throw FAST.error(Message.invalidHydrationAttributeMarker, {
        value: attr2
      });
    }
    return count;
  }
  var HydrationMarkup = createHydrationMarkers({
    attributeMarkerName: "data-fe",
    contentBindingStartMarker() {
      return "fe:b";
    },
    contentBindingEndMarker() {
      return "fe:/b";
    },
    repeatStartMarker() {
      return "fe:r";
    },
    repeatEndMarker() {
      return "fe:/r";
    },
    elementBoundaryStartMarker() {
      return "fe:e";
    },
    elementBoundaryEndMarker() {
      return "fe:/e";
    },
    parseAttributeBindingCount,
    resolveAttributeBindings(node, factoryPointer, hydrationIndexOffset) {
      const count = parseAttributeBindingCount(node);
      if (count !== null) {
        const factoryIndices = Array.from({ length: count }, (_, index) => factoryPointer + index);
        return {
          factoryIndices,
          nextFactoryPointer: factoryPointer + count,
          cleanup: () => node.removeAttribute("data-fe")
        };
      }
      return null;
    },
    resolveContentBinding(data, factoryPointer, hydrationIndexOffset) {
      if (data === "fe:b") {
        return {
          factoryIndices: [factoryPointer],
          nextFactoryPointer: factoryPointer + 1
        };
      }
      return null;
    },
    isContentBindingStartMarker(data) {
      return data === "fe:b";
    },
    isContentBindingEndMarker(data) {
      return data === "fe:/b";
    },
    isRepeatViewStartMarker(data) {
      return data === "fe:r";
    },
    isRepeatViewEndMarker(data) {
      return data === "fe:/r";
    },
    isElementBoundaryStartMarker(node) {
      return isComment(node) && node.data === "fe:e";
    },
    isElementBoundaryEndMarker(node) {
      return isComment(node) && node.data === "fe:/e";
    }
  });
  var activeHydrationMarkers = markerStrategies.get(HydrationMarkup);
  function getHydrationMarkers() {
    return activeHydrationMarkers;
  }

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/components/hydration.js
  var Hydratable = /* @__PURE__ */ Symbol.for("fe-hydration");
  function isHydratable(value) {
    return value[Hydratable] === Hydratable;
  }

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/hydration/messages.js
  var unknownHostName = "unknown";
  var expectedContentAfterStartMarker = "content following `<!--fe:b-->` content binding marker";
  var expectedContentEndMarker = "matching `<!--fe:/b-->` content binding close marker";
  var expectedElementBoundaryEndMarker = "matching `<!--fe:/e-->` element boundary close marker";
  function formatDefaultMismatchMessage(hostName, detail) {
    const suffix = detail ? `: ${detail}` : "";
    return `Hydration mismatch in <${hostName}>${suffix}. Install hydrationDebugger() from "@microsoft/fast-element/hydration.js" and pass it as enableHydration({ debugger: hydrationDebugger() }) for an "Expected / Received" report including the SSR HTML snippet.`;
  }
  function formatNoMoreAttributeBindings(factoryCount) {
    return `no more attribute bindings (template defines ${factoryCount})`;
  }
  function formatNoMoreContentBindings(factoryCount) {
    return `no more content bindings (template defines ${factoryCount})`;
  }

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/hydration/diagnostics.js
  function formatMinimalMessage(hostName, detail) {
    const host = (hostName !== null && hostName !== void 0 ? hostName : unknownHostName).toLowerCase();
    return formatDefaultMismatchMessage(host, detail);
  }
  var defaultDiagnostic = {
    formatBindingMismatch(_factory, _firstChild, _lastChild, hostName) {
      return {
        message: formatMinimalMessage(hostName, void 0)
      };
    },
    formatStructuralError(_node, hostName, expectedDescription) {
      return {
        message: formatMinimalMessage(hostName, expectedDescription)
      };
    }
  };
  var activeDiagnostic = defaultDiagnostic;
  function getHydrationDiagnostic() {
    return activeDiagnostic;
  }
  function getHostName(node) {
    var _a3;
    if (!node) {
      return void 0;
    }
    const root = node.getRootNode();
    return (_a3 = root.host) === null || _a3 === void 0 ? void 0 : _a3.nodeName;
  }

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/hydration/attribute-observation.js
  var _a;
  var _b;
  var define2 = (_a = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(customElements), "define")) === null || _a === void 0 ? void 0 : _a.value;
  var arrayIterator = (_b = Object.getOwnPropertyDescriptor(Array.prototype, Symbol.iterator)) === null || _b === void 0 ? void 0 : _b.value;
  var unobservedMarkers = /* @__PURE__ */ new WeakMap();
  function isHydrationMarkerUnobserved(element) {
    return unobservedMarkers.get(Object.getPrototypeOf(element)) === true;
  }

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/hydration/traversal.js
  function isComment2(node) {
    return node.nodeType === 8;
  }
  function isText(node) {
    return node.nodeType === 3;
  }
  function getNodeLength(node) {
    return isComment2(node) || isText(node) ? node.data.length : node.childNodes.length;
  }
  var hydrationNodeMask = 133;
  function createRangeForNodes(first, last) {
    const range = document.createRange();
    range.setStart(first, 0);
    range.setEnd(last, getNodeLength(last));
    return range;
  }
  function createRangeHydrationTraversal(firstNode, lastNode, currentNode = firstNode) {
    const range = createRangeForNodes(firstNode, lastNode);
    let walker = range.startContainer === firstNode ? document.createTreeWalker(range.commonAncestorContainer, hydrationNodeMask) : null;
    let hasReachedLastNode = lastNode.contains(currentNode);
    let mutationMode = false;
    if (walker !== null) {
      walker.currentNode = currentNode;
    }
    function move(sibling) {
      if (walker === null || !mutationMode && sibling && walker.currentNode.contains(lastNode)) {
        return null;
      }
      const current = walker.currentNode;
      const candidate = sibling ? walker.nextSibling() : walker.nextNode();
      if (mutationMode || !hasReachedLastNode || lastNode.contains(candidate)) {
        if (candidate === lastNode) {
          hasReachedLastNode = true;
        }
        return candidate;
      }
      walker.currentNode = current;
      return null;
    }
    return [
      move,
      () => {
        if (walker !== null && !mutationMode && (range.startContainer !== firstNode || range.endContainer !== lastNode || range.endOffset !== getNodeLength(lastNode) || walker.currentNode !== firstNode && walker.currentNode !== lastNode && !range.intersectsNode(walker.currentNode))) {
          const current = walker.currentNode;
          walker = document.createTreeWalker(walker.root, walker.whatToShow, {
            acceptNode: (node) => range.comparePoint(node, 0) === 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
          });
          walker.currentNode = current;
          mutationMode = true;
        }
      }
    ];
  }
  function createHydrationTraversal(firstNode, lastNode) {
    const parent = firstNode.parentNode;
    if (parent === null || parent !== lastNode.parentNode || firstNode !== lastNode && !(firstNode.compareDocumentPosition(lastNode) & Node.DOCUMENT_POSITION_FOLLOWING)) {
      const [move2, update] = createRangeHydrationTraversal(firstNode, lastNode);
      return [move2, update, () => {
      }];
    }
    let current = firstNode;
    let rangeTraversal = null;
    function move(sibling = false) {
      if (rangeTraversal !== null) {
        return rangeTraversal[0](sibling);
      }
      if (sibling && current === lastNode) {
        return null;
      }
      let candidate = current;
      do {
        if (sibling) {
          if (candidate === lastNode) {
            return null;
          }
          candidate = candidate.nextSibling;
        } else {
          let ancestor = candidate;
          candidate = candidate.firstChild;
          while (candidate === null) {
            if (ancestor === lastNode) {
              return null;
            }
            candidate = ancestor.nextSibling;
            ancestor = ancestor.parentNode;
            if (ancestor === parent || ancestor === null) {
              break;
            }
          }
        }
      } while (candidate !== null && !(hydrationNodeMask & 1 << candidate.nodeType - 1));
      if (candidate !== null) {
        current = candidate;
      }
      return candidate;
    }
    return [
      move,
      () => rangeTraversal === null || rangeTraversal === void 0 ? void 0 : rangeTraversal[1](),
      () => {
        rangeTraversal !== null && rangeTraversal !== void 0 ? rangeTraversal : rangeTraversal = createRangeHydrationTraversal(firstNode, lastNode, current);
      }
    ];
  }

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/hydration/target-builder.js
  var HydrationTargetElementError = class extends Error {
    constructor(message, factories, node, expected, received) {
      super(message);
      this.factories = factories;
      this.node = node;
      this.expected = expected;
      this.received = received;
    }
  };
  var removeAttribute = Element.prototype.removeAttribute;
  var getAttribute = Element.prototype.getAttribute;
  var hasAttribute = Element.prototype.hasAttribute;
  function hasNativeAttributeMethod(element, name, method) {
    let current = element;
    while (current !== null) {
      const descriptor = Object.getOwnPropertyDescriptor(current, name);
      if (descriptor !== void 0)
        return descriptor.value === method;
      current = Object.getPrototypeOf(current);
    }
    return false;
  }
  function canMutateOnAttributeRemoval(element, unobserved) {
    if (unobserved) {
      return hasAttribute.call(element, "is") || !hasNativeAttributeMethod(element, "removeAttribute", removeAttribute);
    }
    return element.localName.includes("-") || element.hasAttribute("is") || "attributeChangedCallback" in element || element.removeAttribute !== removeAttribute;
  }
  function throwHydrationError(node, factories, expected) {
    const result = getHydrationDiagnostic().formatStructuralError(node, getHostName(node), expected);
    throw new HydrationTargetElementError(result.message, factories, node, result.expected, result.received);
  }
  function buildViewBindingTargets(firstNode, lastNode, factories) {
    var _a3;
    const [move, update, prepareForMutation] = createHydrationTraversal(firstNode, lastNode);
    const targets = {};
    const boundaries = {};
    const markers = getHydrationMarkers();
    const nativeMarkers = markers === HydrationMarkup;
    if (markers !== HydrationMarkup) {
      prepareForMutation();
    }
    const hydrationIndexOffset = getHydrationIndexOffset(factories);
    let factoryPointer = hydrationIndexOffset;
    let node = firstNode;
    while (node !== null) {
      switch (node.nodeType) {
        case Node.ELEMENT_NODE: {
          const element = node;
          const nativeCustomElement = nativeMarkers && element.localName.includes("-");
          const unobserved = nativeCustomElement && isHydrationMarkerUnobserved(element);
          if (nativeCustomElement ? !hasNativeAttributeMethod(element, "getAttribute", getAttribute) : element.getAttribute !== getAttribute) {
            prepareForMutation();
          }
          if (nativeMarkers) {
            const count = HydrationMarkup.parseAttributeBindingCount(element);
            if (count !== null) {
              if (count > 4294967295) {
                HydrationMarkup.resolveAttributeBindings(element, factoryPointer, hydrationIndexOffset);
              }
              for (let i = 0; i < count; i++) {
                const factory = factories[factoryPointer++];
                if (!factory) {
                  throwHydrationError(node, factories, formatNoMoreAttributeBindings(factories.length));
                }
                targetFactory(factory, node, targets);
              }
              if (canMutateOnAttributeRemoval(element, unobserved)) {
                prepareForMutation();
              }
              element.removeAttribute("data-fe");
              update();
            }
            break;
          }
          const resolution = markers.resolveAttributeBindings(element, factoryPointer, hydrationIndexOffset);
          if (resolution !== null) {
            factoryPointer = resolution.nextFactoryPointer;
            for (const factoryIndex of resolution.factoryIndices) {
              const factory = factories[factoryIndex];
              if (!factory) {
                throwHydrationError(node, factories, formatNoMoreAttributeBindings(factories.length));
              }
              targetFactory(factory, node, targets);
            }
            if (canMutateOnAttributeRemoval(element, false)) {
              prepareForMutation();
            }
            (_a3 = resolution.cleanup) === null || _a3 === void 0 ? void 0 : _a3.call(resolution);
            update();
          }
          break;
        }
        case 8: {
          const data = node.data;
          if (nativeMarkers ? data === "fe:e" : markers.isElementBoundaryStartMarker(node)) {
            node.data = "";
            skipToElementBoundaryEnd(move, factories, node, markers, nativeMarkers);
          } else {
            let factoryIndex;
            if (nativeMarkers) {
              if (data !== "fe:b") {
                break;
              }
              factoryIndex = factoryPointer++;
            } else {
              const resolution = markers.resolveContentBinding(data, factoryPointer, hydrationIndexOffset);
              if (resolution === null) {
                break;
              }
              factoryPointer = resolution.nextFactoryPointer;
              factoryIndex = resolution.factoryIndices[0];
            }
            const factory = factories[factoryIndex];
            if (!factory) {
              throwHydrationError(node, factories, formatNoMoreContentBindings(factories.length));
            }
            targetContentBinding(node, move, factory, factories, targets, boundaries, markers, nativeMarkers);
          }
          break;
        }
      }
      node = move();
    }
    return { targets, boundaries };
  }
  function targetContentBinding(node, move, factory, factories, targets, boundaries, markers, nativeMarkers) {
    let current = move(true);
    node.data = "";
    if (current === null) {
      throwHydrationError(node, factories, expectedContentAfterStartMarker);
    }
    const first = current;
    let depth = 0;
    while (current !== null) {
      if (isComment2(current)) {
        if (nativeMarkers ? current.data === "fe:b" : markers.isContentBindingStartMarker(current.data)) {
          depth++;
        } else if (nativeMarkers ? current.data === "fe:/b" : markers.isContentBindingEndMarker(current.data)) {
          if (depth === 0)
            break;
          depth--;
        }
      }
      current = move(true);
    }
    if (current === null) {
      throwHydrationError(node, factories, expectedContentEndMarker);
    }
    current.data = "";
    if (current !== first && current.previousSibling !== null) {
      boundaries[factory.targetNodeId] = {
        first,
        last: current.previousSibling
      };
    }
    targetFactory(factory, current, targets);
  }
  function skipToElementBoundaryEnd(move, factories, startNode, markers, nativeMarkers) {
    let depth = 0;
    let current = move(true);
    while (current !== null) {
      if (isComment2(current)) {
        if (nativeMarkers ? current.data === "fe:e" : markers.isElementBoundaryStartMarker(current)) {
          current.data = "";
          depth++;
        } else if (nativeMarkers ? current.data === "fe:/e" : markers.isElementBoundaryEndMarker(current)) {
          current.data = "";
          if (depth-- === 0) {
            return;
          }
        }
      }
      current = move(true);
    }
    throwHydrationError(startNode, factories, expectedElementBoundaryEndMarker);
  }
  function getHydrationIndexOffset(factories) {
    let offset = 0;
    while (offset < factories.length && factories[offset].targetNodeId === "h") {
      offset++;
    }
    return offset;
  }
  function targetFactory(factory, node, targets) {
    const id3 = factory.targetNodeId;
    if (id3 === void 0) {
      throw new Error("Factory could not be target to the node");
    }
    targets[id3] = node;
  }

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/templating/view.js
  function removeNodeSequence(firstNode, lastNode) {
    const parent = firstNode.parentNode;
    let current = firstNode;
    let next2;
    while (current !== lastNode) {
      next2 = current.nextSibling;
      if (!next2) {
        throw new Error(`Unmatched first/last child inside "${lastNode.getRootNode().host.nodeName}".`);
      }
      parent.removeChild(current);
      current = next2;
    }
    parent.removeChild(lastNode);
  }
  var DefaultExecutionContext = class {
    constructor() {
      this.index = 0;
      this.length = 0;
    }
    /**
     * The current event within an event handler.
     */
    get event() {
      return ExecutionContext.getEvent();
    }
    /**
     * Indicates whether the current item within a repeat context
     * has an even index.
     */
    get isEven() {
      return this.index % 2 === 0;
    }
    /**
     * Indicates whether the current item within a repeat context
     * has an odd index.
     */
    get isOdd() {
      return this.index % 2 !== 0;
    }
    /**
     * Indicates whether the current item within a repeat context
     * is the first item in the collection.
     */
    get isFirst() {
      return this.index === 0;
    }
    /**
     * Indicates whether the current item within a repeat context
     * is somewhere in the middle of the collection.
     */
    get isInMiddle() {
      return !this.isFirst && !this.isLast;
    }
    /**
     * Indicates whether the current item within a repeat context
     * is the last item in the collection.
     */
    get isLast() {
      return this.index === this.length - 1;
    }
    /**
     * Returns the typed event detail of a custom event.
     */
    eventDetail() {
      return this.event.detail;
    }
    /**
     * Returns the typed event target of the event.
     */
    eventTarget() {
      return this.event.target;
    }
  };
  var HTMLView = class extends DefaultExecutionContext {
    /**
     * Constructs an instance of HTMLView.
     * @param fragment - The html fragment that contains the nodes for this view.
     * @param behaviors - The behaviors to be applied to this view.
     */
    constructor(fragment, factories, targets) {
      super();
      this.fragment = fragment;
      this.factories = factories;
      this.targets = targets;
      this.behaviors = null;
      this.unbindables = [];
      this.source = null;
      this.isBound = false;
      this.sourceLifetime = SourceLifetime.unknown;
      this._skipAttrUpdates = false;
      this.isPrerendered = Promise.resolve(false);
      this.isHydrated = Promise.resolve(false);
      this.context = this;
      this.firstChild = fragment.firstChild;
      this.lastChild = fragment.lastChild;
    }
    /**
     * Appends the view's DOM nodes to the referenced node.
     * @param node - The parent node to append the view's DOM nodes to.
     */
    appendTo(node) {
      node.appendChild(this.fragment);
    }
    /**
     * Inserts the view's DOM nodes before the referenced node.
     * @param node - The node to insert the view's DOM before.
     */
    insertBefore(node) {
      if (this.fragment.hasChildNodes()) {
        node.parentNode.insertBefore(this.fragment, node);
      } else {
        const end = this.lastChild;
        if (node.previousSibling === end)
          return;
        const parentNode = node.parentNode;
        let current = this.firstChild;
        let next2;
        while (current !== end) {
          next2 = current.nextSibling;
          parentNode.insertBefore(current, node);
          current = next2;
        }
        parentNode.insertBefore(end, node);
      }
    }
    /**
     * Removes the view's DOM nodes.
     * The nodes are not disposed and the view can later be re-inserted.
     */
    remove() {
      const fragment = this.fragment;
      const end = this.lastChild;
      let current = this.firstChild;
      let next2;
      while (current !== end) {
        next2 = current.nextSibling;
        fragment.appendChild(current);
        current = next2;
      }
      fragment.appendChild(end);
    }
    /**
     * Removes the view and unbinds its behaviors, disposing of DOM nodes afterward.
     * Once a view has been disposed, it cannot be inserted or bound again.
     */
    dispose() {
      removeNodeSequence(this.firstChild, this.lastChild);
      this.unbind();
    }
    onUnbind(behavior) {
      this.unbindables.push(behavior);
    }
    /**
     * Binds a view's behaviors to its binding source.
     *
     * On the first call, this iterates through all compiled factories, calling
     * createBehavior() on each to produce a ViewBehavior instance (e.g., an
     * HTMLBindingDirective), and then immediately binds it. This is where event
     * listeners are registered, expression observers are created, and initial
     * DOM values are set.
     *
     * On subsequent calls with a new source, existing behaviors are re-bound
     * to the new data source, which re-evaluates all binding expressions and
     * updates the DOM accordingly.
     *
     * @param source - The binding source for the view's binding behaviors.
     * @param context - The execution context to run the behaviors within.
     */
    bind(source, context = this) {
      if (this.source === source && this.context === context) {
        return;
      }
      let behaviors = this.behaviors;
      if (behaviors === null) {
        this.source = source;
        this.context = context;
        this.behaviors = behaviors = new Array(this.factories.length);
        const factories = this.factories;
        for (let i = 0, ii = factories.length; i < ii; ++i) {
          const behavior = factories[i].createBehavior();
          behavior.bind(this);
          behaviors[i] = behavior;
        }
      } else {
        if (this.source !== null) {
          this.evaluateUnbindables();
        }
        this.isBound = false;
        this.source = source;
        this.context = context;
        for (let i = 0, ii = behaviors.length; i < ii; ++i) {
          behaviors[i].bind(this);
        }
      }
      this.isBound = true;
    }
    /**
     * Unbinds a view's behaviors from its binding source.
     */
    unbind() {
      if (!this.isBound || this.source === null) {
        return;
      }
      this.evaluateUnbindables();
      this.source = null;
      this.context = this;
      this.isBound = false;
    }
    evaluateUnbindables() {
      const unbindables = this.unbindables;
      for (let i = 0, ii = unbindables.length; i < ii; ++i) {
        unbindables[i].unbind(this);
      }
      unbindables.length = 0;
    }
    /**
     * Efficiently disposes of a contiguous range of synthetic view instances.
     * @param views - A contiguous range of views to be disposed.
     */
    static disposeContiguousBatch(views) {
      if (views.length === 0) {
        return;
      }
      removeNodeSequence(views[0].firstChild, views[views.length - 1].lastChild);
      for (let i = 0, ii = views.length; i < ii; ++i) {
        views[i].unbind();
      }
    }
  };
  makeSerializationNoop(HTMLView);
  Observable.defineProperty(HTMLView.prototype, "index");
  Observable.defineProperty(HTMLView.prototype, "length");

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/templating/hydration-view.js
  var _a2;
  var HydrationStage = {
    unhydrated: "unhydrated",
    hydrating: "hydrating",
    hydrated: "hydrated"
  };
  var HydrationBindingError = class extends Error {
    constructor(message, factory, fragment, templateString, expected, received) {
      super(message);
      this.factory = factory;
      this.fragment = fragment;
      this.templateString = templateString;
      this.expected = expected;
      this.received = received;
    }
  };
  var HydrationView = class extends DefaultExecutionContext {
    get hydrationStage() {
      return this._hydrationStage;
    }
    get targets() {
      return this._targets;
    }
    get bindingViewBoundaries() {
      return this._bindingViewBoundaries;
    }
    constructor(firstChild, lastChild, sourceTemplate, hostBindingTarget) {
      super();
      this.firstChild = firstChild;
      this.lastChild = lastChild;
      this.sourceTemplate = sourceTemplate;
      this.hostBindingTarget = hostBindingTarget;
      this[_a2] = Hydratable;
      this.context = this;
      this.source = null;
      this.isBound = false;
      this.sourceLifetime = SourceLifetime.unknown;
      this.unbindables = [];
      this.fragment = null;
      this.behaviors = null;
      this._hydrationStage = HydrationStage.unhydrated;
      this._bindingViewBoundaries = {};
      this._targets = {};
      this.factories = sourceTemplate.compile().factories;
    }
    /**
     * no-op. Hydrated views are don't need to be moved from a documentFragment
     * to the target node.
     */
    insertBefore(node) {
      if (this.fragment === null) {
        return;
      }
      if (this.fragment.hasChildNodes()) {
        node.parentNode.insertBefore(this.fragment, node);
      } else {
        const end = this.lastChild;
        if (node.previousSibling === end)
          return;
        const parentNode = node.parentNode;
        let current = this.firstChild;
        let next2;
        while (current !== end) {
          next2 = current.nextSibling;
          parentNode.insertBefore(current, node);
          current = next2;
        }
        parentNode.insertBefore(end, node);
      }
    }
    /**
     * Appends the view to a node. In cases where this is called before the
     * view has been removed, the method will no-op.
     * @param node - the node to append the view to.
     */
    appendTo(node) {
      if (this.fragment !== null) {
        node.appendChild(this.fragment);
      }
    }
    remove() {
      const fragment = this.fragment || (this.fragment = document.createDocumentFragment());
      const end = this.lastChild;
      let current = this.firstChild;
      let next2;
      while (current !== end) {
        next2 = current.nextSibling;
        if (!next2) {
          throw new Error(`Unmatched first/last child inside "${end.getRootNode().host.nodeName}".`);
        }
        fragment.appendChild(current);
        current = next2;
      }
      fragment.appendChild(end);
    }
    bind(source, context = this) {
      if (this.source === source && this.context === context) {
        return;
      }
      if (this.hydrationStage !== HydrationStage.hydrated) {
        this._hydrationStage = HydrationStage.hydrating;
      }
      let behaviors = this.behaviors;
      if (behaviors === null) {
        this.source = source;
        this.context = context;
        try {
          const { targets, boundaries } = buildViewBindingTargets(this.firstChild, this.lastChild, this.factories);
          this._targets = targets;
          this._bindingViewBoundaries = boundaries;
        } catch (error) {
          if (error instanceof HydrationTargetElementError) {
            let templateString = this.sourceTemplate.html;
            if (typeof templateString !== "string") {
              templateString = templateString.innerHTML;
            }
            error.templateString = templateString;
          }
          throw error;
        }
        this.behaviors = behaviors = new Array(this.factories.length);
        const factories = this.factories;
        for (let i = 0, ii = factories.length; i < ii; ++i) {
          const factory = factories[i];
          if (factory.targetNodeId === "h" && this.hostBindingTarget) {
            targetFactory(factory, this.hostBindingTarget, this._targets);
          }
          if (factory.targetNodeId in this.targets) {
            const behavior = factory.createBehavior();
            behavior.bind(this);
            behaviors[i] = behavior;
          } else {
            let templateString = this.sourceTemplate.html;
            if (typeof templateString !== "string") {
              templateString = templateString.innerHTML;
            }
            const fragment = createRangeForNodes(this.firstChild, this.lastChild).cloneContents();
            const result = getHydrationDiagnostic().formatBindingMismatch(factory, this.firstChild, this.lastChild, getHostName(this.firstChild));
            throw new HydrationBindingError(result.message, factory, fragment, templateString, result.expected, result.received);
          }
        }
      } else {
        if (this.source !== null) {
          this.evaluateUnbindables();
        }
        this.isBound = false;
        this.source = source;
        this.context = context;
        for (let i = 0, ii = behaviors.length; i < ii; ++i) {
          behaviors[i].bind(this);
        }
      }
      this.isBound = true;
      this._hydrationStage = HydrationStage.hydrated;
    }
    unbind() {
      if (!this.isBound || this.source === null) {
        return;
      }
      this.evaluateUnbindables();
      this.source = null;
      this.context = this;
      this.isBound = false;
    }
    /**
     * Removes the view and unbinds its behaviors, disposing of DOM nodes afterward.
     * Once a view has been disposed, it cannot be inserted or bound again.
     */
    dispose() {
      removeNodeSequence(this.firstChild, this.lastChild);
      this.unbind();
    }
    onUnbind(behavior) {
      this.unbindables.push(behavior);
    }
    evaluateUnbindables() {
      const unbindables = this.unbindables;
      for (let i = 0, ii = unbindables.length; i < ii; ++i) {
        unbindables[i].unbind(this);
      }
      unbindables.length = 0;
    }
  };
  _a2 = Hydratable;
  makeSerializationNoop(HydrationView);

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/templating/html-binding-directive.js
  function isContentTemplate(value) {
    return value.create !== void 0;
  }
  function updateContentText(target, value) {
    if (target.nodeType !== 8) {
      target.textContent = value;
      return;
    }
    let text = target.$fastText;
    if (text !== void 0) {
      text.textContent = value;
    }
    if (value === "") {
      text === null || text === void 0 ? void 0 : text.remove();
    } else {
      if (text === void 0) {
        target.$fastText = text = document.createTextNode(value);
      }
      if (text.parentNode !== target.parentNode) {
        target.parentNode.insertBefore(text, target);
      }
    }
  }
  function updateContent(target, aspect, value, controller) {
    if (value === null || value === void 0) {
      value = "";
    }
    if (isContentTemplate(value)) {
      updateContentText(target, "");
      let view = target.$fastView;
      if (view === void 0) {
        if (isHydratable(controller) && isHydratable(value) && controller.bindingViewBoundaries[this.targetNodeId] !== void 0 && controller.hydrationStage !== HydrationStage.hydrated) {
          const viewNodes = controller.bindingViewBoundaries[this.targetNodeId];
          view = value.hydrate(viewNodes.first, viewNodes.last);
        } else {
          view = value.create();
        }
      } else {
        if (target.$fastTemplate !== value) {
          if (view.isComposed) {
            view.remove();
            view.unbind();
          }
          view = value.create();
        }
      }
      if (!view.isComposed) {
        view.isComposed = true;
        view.bind(controller.source, controller.context);
        view.insertBefore(target);
        target.$fastView = view;
        target.$fastTemplate = value;
      } else if (view.needsBindOnly) {
        view.needsBindOnly = false;
        view.bind(controller.source, controller.context);
      }
    } else {
      const view = target.$fastView;
      if (view !== void 0 && view.isComposed) {
        view.isComposed = false;
        view.remove();
        if (view.needsBindOnly) {
          view.needsBindOnly = false;
        } else {
          view.unbind();
        }
      }
      if (view === void 0 && isHydratable(controller) && controller.hydrationStage !== HydrationStage.hydrated) {
        const viewNodes = controller.bindingViewBoundaries[this.targetNodeId];
        if (viewNodes !== void 0) {
          if (target.nodeType === 8 && viewNodes.first === viewNodes.last && viewNodes.first.nodeType === 3) {
            target.$fastText = viewNodes.first;
          } else {
            removeNodeSequence(viewNodes.first, viewNodes.last);
          }
          delete controller.bindingViewBoundaries[this.targetNodeId];
        }
      }
      updateContentText(target, value);
    }
  }
  function updateTokenList(target, aspect, value) {
    var _a3;
    const lookup = `${this.id}-t`;
    const state = (_a3 = target[lookup]) !== null && _a3 !== void 0 ? _a3 : target[lookup] = { v: 0, cv: /* @__PURE__ */ Object.create(null) };
    const classVersions = state.cv;
    let version = state.v;
    const tokenList = target[aspect];
    if (value !== null && value !== void 0 && value.length) {
      const names = value.split(/\s+/);
      for (let i = 0, ii = names.length; i < ii; ++i) {
        const currentName = names[i];
        if (currentName === "") {
          continue;
        }
        classVersions[currentName] = version;
        tokenList.add(currentName);
      }
    }
    state.v = version + 1;
    if (version === 0) {
      return;
    }
    version -= 1;
    for (const name in classVersions) {
      if (classVersions[name] === version) {
        tokenList.remove(name);
      }
    }
  }
  var sinkLookup = {
    [DOMAspect.attribute]: DOM.setAttribute,
    [DOMAspect.booleanAttribute]: DOM.setBooleanAttribute,
    [DOMAspect.property]: (t, a, v) => t[a] = v,
    [DOMAspect.content]: updateContent,
    [DOMAspect.tokenList]: updateTokenList,
    [DOMAspect.event]: () => void 0
  };
  var HTMLBindingDirective = class {
    /**
     * Creates an instance of HTMLBindingDirective.
     * @param dataBinding - The binding configuration to apply.
     */
    constructor(dataBinding) {
      this.updateTarget = null;
      this.aspectType = DOMAspect.content;
      this.dataBinding = dataBinding;
    }
    /**
     * Creates HTML to be used within a template.
     * @param add - Can be used to add  behavior factories to a template.
     */
    createHTML(add) {
      return Markup.interpolation(add(this));
    }
    /**
     * Creates a behavior.
     */
    createBehavior() {
      var _a3;
      if (this.updateTarget === null) {
        const sink = sinkLookup[this.aspectType];
        const policy = (_a3 = this.dataBinding.policy) !== null && _a3 !== void 0 ? _a3 : this.policy;
        if (!sink) {
          throw FAST.error(Message.unsupportedBindingBehavior);
        }
        this.data = `${this.id}-d`;
        this.updateTarget = policy.protect(this.targetTagName, this.aspectType, this.targetAspect, sink);
      }
      return this;
    }
    /**
     * Attaches this binding to its target DOM node.
     * - For events: stores the controller reference on the target element and registers
     *   this directive as the EventListener via addEventListener. The directive's
     *   handleEvent() method will be called when the event fires.
     * - For content bindings: registers an unbind handler, then falls through to the
     *   default path.
     * - For all non-event bindings: creates (or reuses) an ExpressionObserver, evaluates
     *   the binding expression, and applies the result to the DOM via the updateTarget
     *   sink function. The observer will call handleChange() on future data changes.
     * @internal
     */
    bind(controller) {
      var _a3;
      const target = controller.targets[this.targetNodeId];
      switch (this.aspectType) {
        case DOMAspect.event:
          target[this.data] = controller;
          target.addEventListener(this.targetAspect, this, this.dataBinding.options);
          break;
        case DOMAspect.content:
          controller.onUnbind(this);
        // intentional fall through
        default: {
          const observer = (_a3 = target[this.data]) !== null && _a3 !== void 0 ? _a3 : target[this.data] = this.dataBinding.createObserver(this, this);
          observer.target = target;
          observer.controller = controller;
          const value = observer.bind(controller);
          if (controller._skipAttrUpdates && (this.aspectType === DOMAspect.attribute || this.aspectType === DOMAspect.booleanAttribute)) {
            break;
          }
          this.updateTarget(target, this.targetAspect, value, controller);
          break;
        }
      }
    }
    /** @internal */
    unbind(controller) {
      const target = controller.targets[this.targetNodeId];
      const view = target.$fastView;
      if (view !== void 0 && view.isComposed) {
        view.unbind();
        view.needsBindOnly = true;
      }
    }
    /**
     * Implements the EventListener interface. When a DOM event fires on the target
     * element, this method retrieves the ViewController stored on the element,
     * sets the event on the ExecutionContext so `c.event` is available to the
     * binding expression, and evaluates the expression. If the expression returns
     * anything other than `true`, the event's default action is prevented.
     * @internal
     */
    handleEvent(event) {
      const controller = event.currentTarget[this.data];
      if (controller.isBound) {
        ExecutionContext.setEvent(event);
        const result = this.dataBinding.evaluate(controller.source, controller.context);
        ExecutionContext.setEvent(null);
        if (result !== true) {
          event.preventDefault();
        }
      }
    }
    /**
     * Called by the ExpressionObserver when a tracked dependency changes.
     * Re-evaluates the binding expression via observer.bind() and pushes
     * the new value to the DOM through the updateTarget sink function.
     * This is the reactive update path that keeps the DOM in sync with data.
     *
     * Guards against stale notifications: when a view is unbound (e.g., after
     * a parent `when` directive tears down a child element), coupled-lifetime
     * observers may still hold active subscriptions. If a property change fires
     * on the source element while the view is inactive, this guard prevents
     * the binding expression from evaluating with a null source.
     * @internal
     */
    handleChange(binding, observer) {
      const controller = observer.controller;
      if (!controller.isBound) {
        return;
      }
      const target = observer.target;
      this.updateTarget(target, this.targetAspect, observer.bind(controller), controller);
    }
  };
  HTMLDirective.define(HTMLBindingDirective, { aspected: true });

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/templating/compiler.js
  var targetIdFrom = (parentId, nodeIndex) => `${parentId}.${nodeIndex}`;
  var descriptorCache = {};
  var next = {
    index: 0,
    node: null
  };
  function tryWarn(name) {
    if (!name.startsWith("fast-")) {
      FAST.warn(Message.hostBindingWithoutHost, { name });
    }
  }
  var warningHost = new Proxy(document.createElement("div"), {
    get(target, property) {
      tryWarn(property);
      const value = Reflect.get(target, property);
      return isFunction(value) ? value.bind(target) : value;
    },
    set(target, property, value) {
      tryWarn(property);
      return Reflect.set(target, property, value);
    }
  });
  var CompilationContext = class {
    constructor(fragment, directives, policy) {
      this.fragment = fragment;
      this.directives = directives;
      this.policy = policy;
      this.proto = null;
      this.nodeIds = /* @__PURE__ */ new Set();
      this.descriptors = {};
      this.factories = [];
    }
    addFactory(factory, parentId, nodeId, targetIndex, tagName6) {
      var _a3, _b2;
      if (!this.nodeIds.has(nodeId)) {
        this.nodeIds.add(nodeId);
        this.addTargetDescriptor(parentId, nodeId, targetIndex);
      }
      factory.id = (_a3 = factory.id) !== null && _a3 !== void 0 ? _a3 : nextId();
      factory.targetNodeId = nodeId;
      factory.targetTagName = tagName6;
      factory.policy = (_b2 = factory.policy) !== null && _b2 !== void 0 ? _b2 : this.policy;
      this.factories.push(factory);
    }
    freeze() {
      this.proto = Object.create(null, this.descriptors);
      return this;
    }
    /**
     * Registers a lazy getter on the targets prototype that resolves a DOM node
     * by navigating from its parent's childNodes at the given index. Getters are
     * chained: accessing targets["r.0.2"] first resolves targets["r.0"] (which
     * resolves targets["r"]), then returns childNodes[2]. Results are cached so
     * each node is resolved at most once per view instance.
     */
    addTargetDescriptor(parentId, targetId, targetIndex) {
      const descriptors = this.descriptors;
      if (targetId === "r" || // root
      targetId === "h" || // host
      descriptors[targetId]) {
        return;
      }
      if (!descriptors[parentId]) {
        const index = parentId.lastIndexOf(".");
        const grandparentId = parentId.substring(0, index);
        const childIndex = parseInt(parentId.substring(index + 1), 10);
        this.addTargetDescriptor(grandparentId, parentId, childIndex);
      }
      let descriptor = descriptorCache[targetId];
      if (!descriptor) {
        const field = `_${targetId}`;
        descriptorCache[targetId] = descriptor = {
          get() {
            var _a3;
            return (_a3 = this[field]) !== null && _a3 !== void 0 ? _a3 : this[field] = this[parentId].childNodes[targetIndex];
          }
        };
      }
      descriptors[targetId] = descriptor;
    }
    /**
     * Creates a new HTMLView by cloning the compiled DocumentFragment and building
     * a targets object. The targets prototype contains lazy getters that resolve
     * each binding's target DOM node via childNodes traversal. Accessing every
     * registered nodeId eagerly triggers the getter chain so all nodes are resolved
     * before behaviors are bound.
     */
    createView(hostBindingTarget) {
      const fragment = this.fragment.cloneNode(true);
      const targets = Object.create(this.proto);
      targets.r = fragment;
      targets.h = hostBindingTarget !== null && hostBindingTarget !== void 0 ? hostBindingTarget : warningHost;
      for (const id3 of this.nodeIds) {
        Reflect.get(targets, id3);
      }
      return new HTMLView(fragment, this.factories, targets);
    }
  };
  function compileAttributes(context, parentId, node, nodeId, nodeIndex, includeBasicValues = false) {
    const attributes = node.attributes;
    const directives = context.directives;
    for (let i = 0, ii = attributes.length; i < ii; ++i) {
      const attr2 = attributes[i];
      const attrValue = attr2.value;
      const parseResult = Parser.parse(attrValue, directives);
      let result = null;
      if (parseResult === null) {
        if (includeBasicValues) {
          result = new HTMLBindingDirective(oneTime(() => attrValue, context.policy));
          HTMLDirective.assignAspect(result, attr2.name);
        }
      } else {
        result = Compiler.aggregate(parseResult, context.policy);
      }
      if (result !== null) {
        node.removeAttributeNode(attr2);
        i--;
        ii--;
        context.addFactory(result, parentId, nodeId, nodeIndex, node.tagName);
      }
    }
  }
  function compileContent(context, node, parentId, nodeId, nodeIndex) {
    const parseResult = Parser.parse(node.textContent, context.directives);
    if (parseResult === null) {
      next.node = node.nextSibling;
      next.index = nodeIndex + 1;
      return next;
    }
    let currentNode;
    let lastNode = currentNode = node;
    for (let i = 0, ii = parseResult.length; i < ii; ++i) {
      const currentPart = parseResult[i];
      if (i !== 0) {
        nodeIndex++;
        nodeId = targetIdFrom(parentId, nodeIndex);
        currentNode = lastNode.parentNode.insertBefore(document.createTextNode(""), lastNode.nextSibling);
      }
      if (isString(currentPart)) {
        currentNode.textContent = currentPart;
      } else {
        HTMLDirective.assignAspect(currentPart);
        if (currentPart instanceof HTMLBindingDirective) {
          const anchor = document.createComment("");
          currentNode.parentNode.replaceChild(anchor, currentNode);
          currentNode = anchor;
        } else {
          currentNode.textContent = " ";
        }
        context.addFactory(currentPart, parentId, nodeId, nodeIndex, null);
      }
      lastNode = currentNode;
    }
    next.index = nodeIndex + 1;
    next.node = lastNode.nextSibling;
    return next;
  }
  function compileChildren(context, parent, parentId) {
    let nodeIndex = 0;
    let childNode = parent.firstChild;
    while (childNode) {
      const result = compileNode(context, parentId, childNode, nodeIndex);
      childNode = result.node;
      nodeIndex = result.index;
    }
  }
  function compileNode(context, parentId, node, nodeIndex) {
    const nodeId = targetIdFrom(parentId, nodeIndex);
    switch (node.nodeType) {
      case 1:
        compileAttributes(context, parentId, node, nodeId, nodeIndex);
        compileChildren(context, node, nodeId);
        break;
      case 3:
        return compileContent(context, node, parentId, nodeId, nodeIndex);
      case 8: {
        const parts = Parser.parse(node.data, context.directives);
        if (parts !== null) {
          context.addFactory(Compiler.aggregate(parts), parentId, nodeId, nodeIndex, null);
        }
        break;
      }
    }
    next.index = nodeIndex + 1;
    next.node = node.nextSibling;
    return next;
  }
  function isMarker(node, directives) {
    if (!node || node.nodeType !== 8 && node.nodeType !== 3) {
      return false;
    }
    const parts = Parser.parse(node.data, directives);
    return parts !== null && (node.nodeType === 8 || !isString(parts[0]));
  }
  var templateTag = "TEMPLATE";
  var Compiler = {
    /**
     * Compiles a template and associated directives into a compilation
     * result which can be used to create views.
     * @param html - The html string or template element to compile.
     * @param factories - The behavior factories referenced by the template.
     * @param policy - The security policy to compile the html with.
     * @remarks
     * The template that is provided for compilation is altered in-place
     * and cannot be compiled again. If the original template must be preserved,
     * it is recommended that you clone the original and pass the clone to this API.
     * @public
     */
    compile(html2, factories, policy = DOM.policy) {
      let template6;
      if (isString(html2)) {
        template6 = document.createElement(templateTag);
        template6.innerHTML = policy.createHTML(html2);
        const fec = template6.content.firstElementChild;
        if (fec !== null && fec.tagName === templateTag) {
          template6 = fec;
        }
      } else {
        template6 = html2;
      }
      if (!template6.content.firstChild && !template6.content.lastChild) {
        template6.content.appendChild(document.createComment(""));
      }
      const fragment = document.adoptNode(template6.content);
      const context = new CompilationContext(fragment, factories, policy);
      compileAttributes(
        context,
        "",
        template6,
        /* host */
        "h",
        0,
        true
      );
      if (
        // If the first node in a fragment is a marker, that means it's an unstable first node,
        // because something like a when, repeat, etc. could add nodes before the marker.
        // To mitigate this, we insert a stable first node. However, if we insert a node,
        // that will alter the result of the TreeWalker. So, we also need to offset the target index.
        isMarker(fragment.firstChild, factories) || // Or if there is only one node and a directive, it means the template's content
        // is *only* the directive. In that case, HTMLView.dispose() misses any nodes inserted by
        // the directive. Inserting a new node ensures proper disposal of nodes added by the directive.
        fragment.childNodes.length === 1 && Object.keys(factories).length > 0
      ) {
        fragment.insertBefore(document.createComment(""), fragment.firstChild);
      }
      compileChildren(
        context,
        fragment,
        /* root */
        "r"
      );
      next.node = null;
      return context.freeze();
    },
    /**
     * Sets the default compilation strategy that will be used by the ViewTemplate whenever
     * it needs to compile a view preprocessed with the html template function.
     * @param strategy - The compilation strategy to use when compiling templates.
     */
    setDefaultStrategy(strategy) {
      this.compile = strategy;
    },
    /**
     * Aggregates an array of strings and directives into a single directive.
     * @param parts - A heterogeneous array of static strings interspersed with
     * directives.
     * @param policy - The security policy to use with the aggregated bindings.
     * @returns A single inline directive that aggregates the behavior of all the parts.
     */
    aggregate(parts, policy = DOM.policy) {
      if (parts.length === 1) {
        return parts[0];
      }
      let sourceAspect;
      let isVolatile = false;
      let bindingPolicy = void 0;
      const partCount = parts.length;
      const finalParts = parts.map((x) => {
        if (isString(x)) {
          return () => x;
        }
        sourceAspect = x.sourceAspect || sourceAspect;
        isVolatile = isVolatile || x.dataBinding.isVolatile;
        bindingPolicy = bindingPolicy || x.dataBinding.policy;
        return x.dataBinding.evaluate;
      });
      const expression = (scope, context) => {
        let output = "";
        for (let i = 0; i < partCount; ++i) {
          output += finalParts[i](scope, context);
        }
        return output;
      };
      const directive = new HTMLBindingDirective(oneWay(expression, bindingPolicy !== null && bindingPolicy !== void 0 ? bindingPolicy : policy, isVolatile));
      HTMLDirective.assignAspect(directive, sourceAspect);
      return directive;
    }
  };

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/templating/ref.js
  var RefDirective = class extends StatelessAttachedAttributeDirective {
    /**
     * Bind this behavior.
     * @param controller - The view controller that manages the lifecycle of this behavior.
     */
    bind(controller) {
      controller.source[this.options] = controller.targets[this.targetNodeId];
    }
  };
  HTMLDirective.define(RefDirective);
  var ref = (propertyName) => new RefDirective(propertyName);

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/templating/template.js
  var lastAttributeNameRegex = (
    /* eslint-disable-next-line no-control-regex, max-len */
    /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/
  );
  var noFactories = /* @__PURE__ */ Object.create(null);
  var InlineTemplateDirective = class {
    /**
     * Creates an instance of InlineTemplateDirective.
     * @param template - The template to inline.
     */
    constructor(html2, factories = noFactories) {
      this.html = html2;
      this.factories = factories;
    }
    /**
     * Creates HTML to be used within a template.
     * @param add - Can be used to add  behavior factories to a template.
     */
    createHTML(add) {
      const factories = this.factories;
      for (const key in factories) {
        add(factories[key]);
      }
      return this.html;
    }
  };
  InlineTemplateDirective.empty = new InlineTemplateDirective("");
  HTMLDirective.define(InlineTemplateDirective);
  function createHTML2(value, prevString, add, definition6 = HTMLDirective.getForInstance(value)) {
    if (definition6.aspected) {
      const match = lastAttributeNameRegex.exec(prevString);
      if (match !== null) {
        HTMLDirective.assignAspect(value, match[2]);
      }
    }
    return value.createHTML(add);
  }
  var ViewTemplate = class _ViewTemplate {
    /**
     * Creates an instance of ViewTemplate.
     * @param html - The html representing what this template will instantiate, including placeholders for directives.
     * @param factories - The directives that will be connected to placeholders in the html.
     * @param policy - The security policy to use when compiling this template.
     */
    constructor(html2, factories = {}, policy) {
      this.policy = policy;
      this.result = null;
      this.html = html2;
      this.factories = factories;
    }
    /**
     * @internal
     */
    compile() {
      if (this.result === null) {
        this.result = Compiler.compile(this.html, this.factories, this.policy);
      }
      return this.result;
    }
    /**
     * Returns a directive that can inline the template.
     */
    inline() {
      return new InlineTemplateDirective(isString(this.html) ? this.html : this.html.innerHTML, this.factories);
    }
    /**
     * Sets the DOMPolicy for this template.
     * @param policy - The policy to associated with this template.
     * @returns The modified template instance.
     * @remarks
     * The DOMPolicy can only be set once for a template and cannot be
     * set after the template is compiled.
     */
    withPolicy(policy) {
      if (this.result) {
        throw FAST.error(Message.cannotSetTemplatePolicyAfterCompilation);
      }
      if (this.policy) {
        throw FAST.error(Message.onlySetTemplatePolicyOnce);
      }
      this.policy = policy;
      return this;
    }
    /**
     * Creates an HTMLView from this template, binds it to the source, and then appends it to the host.
     * @param source - The data source to bind the template to.
     * @param host - The Element where the template will be rendered.
     * @param hostBindingTarget - An HTML element to target the host bindings at if different from the
     * host that the template is being attached to.
     */
    render(source, host, hostBindingTarget) {
      const view = this.create(hostBindingTarget);
      view.bind(source);
      view.appendTo(host);
      return view;
    }
    /**
     * Creates an HTMLView instance based on this template definition.
     * @param hostBindingTarget - The element that host behaviors will be bound to.
     */
    create(hostBindingTarget) {
      return this.compile().createView(hostBindingTarget);
    }
    /**
     * Processes the tagged template literal's static strings and interpolated values and
     * creates a ViewTemplate.
     *
     * For each interpolated value:
     * 1. Functions (binding expressions, e.g., `x => x.name`) → wrapped in a one-way HTMLBindingDirective
     * 2. Binding instances → wrapped in an HTMLBindingDirective
     * 3. HTMLDirective instances → used as-is
     * 4. Static values (strings, numbers) → wrapped in a one-time HTMLBindingDirective
     *
     * Each directive's createHTML() is called with an `add` callback that registers
     * the factory in the factories record under a unique ID and returns that ID.
     * The directive inserts a placeholder marker (e.g., `fast-abc123{0}fast-abc123`) into
     * the HTML string so the compiler can later find and associate it with the factory.
     *
     * Aspect detection happens here too: the `lastAttributeNameRegex` checks whether
     * the placeholder appears inside an attribute value, and if so, assignAspect()
     * sets the correct DOMAspect (attribute, property, event, etc.) based on the
     * attribute name prefix.
     *
     * @param strings - The static strings to create the template with.
     * @param values - The dynamic values to create the template with.
     * @param policy - The DOMPolicy to associated with the template.
     * @returns A ViewTemplate.
     * @remarks
     * This API should not be used directly under normal circumstances because constructing
     * a template in this way, if not done properly, can open up the application to XSS
     * attacks. When using this API, provide a strong DOMPolicy that can properly sanitize
     * and also be sure to manually sanitize all static strings particularly if they can
     * come from user input.
     */
    static create(strings, values, policy) {
      let html2 = "";
      const factories = /* @__PURE__ */ Object.create(null);
      const add = (factory) => {
        var _a3;
        const id3 = (_a3 = factory.id) !== null && _a3 !== void 0 ? _a3 : factory.id = nextId();
        factories[id3] = factory;
        return id3;
      };
      for (let i = 0, ii = strings.length - 1; i < ii; ++i) {
        const currentString = strings[i];
        let currentValue = values[i];
        let definition6;
        html2 += currentString;
        if (isFunction(currentValue)) {
          currentValue = new HTMLBindingDirective(oneWay(currentValue));
        } else if (currentValue instanceof Binding) {
          currentValue = new HTMLBindingDirective(currentValue);
        } else if (!(definition6 = HTMLDirective.getForInstance(currentValue))) {
          const staticValue = currentValue;
          currentValue = new HTMLBindingDirective(oneTime(() => staticValue));
        }
        html2 += createHTML2(currentValue, currentString, add, definition6);
      }
      return new _ViewTemplate(html2 + strings[strings.length - 1], factories, policy);
    }
  };
  makeSerializationNoop(ViewTemplate);
  var html = ((strings, ...values) => {
    if (Array.isArray(strings) && Array.isArray(strings.raw)) {
      return ViewTemplate.create(strings, values);
    }
    throw FAST.error(Message.directCallToHTMLTagNotAllowed);
  });
  html.partial = (html2) => {
    return new InlineTemplateDirective(html2);
  };

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@microsoft/fast-element/dist/esm/templating/slotted.js
  var slotEvent = "slotchange";
  var SlottedDirective = class extends NodeObservationDirective {
    /**
     * Begins observation of the nodes.
     * @param target - The target to observe.
     */
    observe(target) {
      target.addEventListener(slotEvent, this);
    }
    /**
     * Disconnects observation of the nodes.
     * @param target - The target to unobserve.
     */
    disconnect(target) {
      target.removeEventListener(slotEvent, this);
    }
    /**
     * Retrieves the raw nodes that should be assigned to the source property.
     * @param target - The target to get the node to.
     */
    getNodes(target) {
      return target.assignedNodes(this.options);
    }
    /** @internal */
    handleEvent(event) {
      const target = event.currentTarget;
      this.updateTarget(this.getSource(target), this.computeNodes(target));
    }
  };
  HTMLDirective.define(SlottedDirective);
  function slotted(propertyOrOptions) {
    if (isString(propertyOrOptions)) {
      propertyOrOptions = { property: propertyOrOptions };
    }
    return new SlottedDirective(propertyOrOptions);
  }

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/utils/display.js
  var hidden = `:host([hidden]){display:none}`;
  function display(displayValue) {
    return `${hidden}:host{display:${displayValue}}`;
  }

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/theme/design-tokens.js
  var colorNeutralForeground1 = "var(--colorNeutralForeground1)";
  var colorNeutralForeground1Hover = "var(--colorNeutralForeground1Hover)";
  var colorNeutralForeground1Pressed = "var(--colorNeutralForeground1Pressed)";
  var colorNeutralForeground2 = "var(--colorNeutralForeground2)";
  var colorNeutralForeground2Hover = "var(--colorNeutralForeground2Hover)";
  var colorNeutralForeground2Pressed = "var(--colorNeutralForeground2Pressed)";
  var colorNeutralForeground2BrandHover = "var(--colorNeutralForeground2BrandHover)";
  var colorNeutralForeground2BrandPressed = "var(--colorNeutralForeground2BrandPressed)";
  var colorNeutralForeground3 = "var(--colorNeutralForeground3)";
  var colorNeutralForegroundDisabled = "var(--colorNeutralForegroundDisabled)";
  var colorNeutralForegroundOnBrand = "var(--colorNeutralForegroundOnBrand)";
  var colorNeutralForegroundInverted = "var(--colorNeutralForegroundInverted)";
  var colorNeutralForegroundStaticInverted = "var(--colorNeutralForegroundStaticInverted)";
  var colorBrandForeground1 = "var(--colorBrandForeground1)";
  var colorBrandForeground2 = "var(--colorBrandForeground2)";
  var colorNeutralForeground1Static = "var(--colorNeutralForeground1Static)";
  var colorNeutralBackground1 = "var(--colorNeutralBackground1)";
  var colorNeutralBackground1Hover = "var(--colorNeutralBackground1Hover)";
  var colorNeutralBackground1Pressed = "var(--colorNeutralBackground1Pressed)";
  var colorNeutralBackground3 = "var(--colorNeutralBackground3)";
  var colorNeutralBackground4 = "var(--colorNeutralBackground4)";
  var colorNeutralBackground5 = "var(--colorNeutralBackground5)";
  var colorSubtleBackground = "var(--colorSubtleBackground)";
  var colorSubtleBackgroundHover = "var(--colorSubtleBackgroundHover)";
  var colorSubtleBackgroundPressed = "var(--colorSubtleBackgroundPressed)";
  var colorTransparentBackground = "var(--colorTransparentBackground)";
  var colorTransparentBackgroundHover = "var(--colorTransparentBackgroundHover)";
  var colorTransparentBackgroundPressed = "var(--colorTransparentBackgroundPressed)";
  var colorNeutralBackgroundDisabled = "var(--colorNeutralBackgroundDisabled)";
  var colorBrandBackground = "var(--colorBrandBackground)";
  var colorBrandBackgroundHover = "var(--colorBrandBackgroundHover)";
  var colorBrandBackgroundPressed = "var(--colorBrandBackgroundPressed)";
  var colorBrandBackground2 = "var(--colorBrandBackground2)";
  var colorNeutralStrokeAccessible = "var(--colorNeutralStrokeAccessible)";
  var colorNeutralStroke1 = "var(--colorNeutralStroke1)";
  var colorNeutralStroke1Hover = "var(--colorNeutralStroke1Hover)";
  var colorNeutralStroke1Pressed = "var(--colorNeutralStroke1Pressed)";
  var colorNeutralStroke2 = "var(--colorNeutralStroke2)";
  var colorNeutralStroke3 = "var(--colorNeutralStroke3)";
  var colorBrandStroke1 = "var(--colorBrandStroke1)";
  var colorBrandStroke2 = "var(--colorBrandStroke2)";
  var colorNeutralStrokeDisabled = "var(--colorNeutralStrokeDisabled)";
  var colorTransparentStroke = "var(--colorTransparentStroke)";
  var colorStrokeFocus2 = "var(--colorStrokeFocus2)";
  var colorPaletteRedBackground1 = "var(--colorPaletteRedBackground1)";
  var colorPaletteRedBackground3 = "var(--colorPaletteRedBackground3)";
  var colorPaletteRedBorder1 = "var(--colorPaletteRedBorder1)";
  var colorPaletteRedForeground1 = "var(--colorPaletteRedForeground1)";
  var colorPaletteRedForeground3 = "var(--colorPaletteRedForeground3)";
  var colorPaletteGreenBackground1 = "var(--colorPaletteGreenBackground1)";
  var colorPaletteGreenBackground3 = "var(--colorPaletteGreenBackground3)";
  var colorPaletteGreenBorder1 = "var(--colorPaletteGreenBorder1)";
  var colorPaletteGreenBorder2 = "var(--colorPaletteGreenBorder2)";
  var colorPaletteGreenForeground1 = "var(--colorPaletteGreenForeground1)";
  var colorPaletteGreenForeground2 = "var(--colorPaletteGreenForeground2)";
  var colorPaletteGreenForeground3 = "var(--colorPaletteGreenForeground3)";
  var colorPaletteDarkOrangeBackground1 = "var(--colorPaletteDarkOrangeBackground1)";
  var colorPaletteDarkOrangeBackground3 = "var(--colorPaletteDarkOrangeBackground3)";
  var colorPaletteDarkOrangeBorder1 = "var(--colorPaletteDarkOrangeBorder1)";
  var colorPaletteDarkOrangeForeground1 = "var(--colorPaletteDarkOrangeForeground1)";
  var colorPaletteDarkOrangeForeground3 = "var(--colorPaletteDarkOrangeForeground3)";
  var colorPaletteYellowBackground1 = "var(--colorPaletteYellowBackground1)";
  var colorPaletteYellowBackground3 = "var(--colorPaletteYellowBackground3)";
  var colorPaletteYellowBorder1 = "var(--colorPaletteYellowBorder1)";
  var colorPaletteYellowForeground2 = "var(--colorPaletteYellowForeground2)";
  var borderRadiusNone = "var(--borderRadiusNone)";
  var borderRadiusSmall = "var(--borderRadiusSmall)";
  var borderRadiusMedium = "var(--borderRadiusMedium)";
  var borderRadiusLarge = "var(--borderRadiusLarge)";
  var borderRadiusCircular = "var(--borderRadiusCircular)";
  var fontFamilyBase = "var(--fontFamilyBase)";
  var fontSizeBase100 = "var(--fontSizeBase100)";
  var fontSizeBase200 = "var(--fontSizeBase200)";
  var fontSizeBase300 = "var(--fontSizeBase300)";
  var fontSizeBase400 = "var(--fontSizeBase400)";
  var fontWeightRegular = "var(--fontWeightRegular)";
  var fontWeightSemibold = "var(--fontWeightSemibold)";
  var lineHeightBase100 = "var(--lineHeightBase100)";
  var lineHeightBase200 = "var(--lineHeightBase200)";
  var lineHeightBase300 = "var(--lineHeightBase300)";
  var lineHeightBase400 = "var(--lineHeightBase400)";
  var shadow2 = "var(--shadow2)";
  var shadow4 = "var(--shadow4)";
  var strokeWidthThin = "var(--strokeWidthThin)";
  var strokeWidthThick = "var(--strokeWidthThick)";
  var spacingHorizontalXXS = "var(--spacingHorizontalXXS)";
  var spacingHorizontalXS = "var(--spacingHorizontalXS)";
  var spacingHorizontalSNudge = "var(--spacingHorizontalSNudge)";
  var spacingHorizontalS = "var(--spacingHorizontalS)";
  var spacingHorizontalM = "var(--spacingHorizontalM)";
  var spacingHorizontalL = "var(--spacingHorizontalL)";
  var spacingVerticalMNudge = "var(--spacingVerticalMNudge)";
  var durationFaster = "var(--durationFaster)";
  var curveEasyEase = "var(--curveEasyEase)";

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/button/button.styles.js
  var baseButtonStyles = css`
  ${display("inline-flex")}

  :host {
    --icon-spacing: ${spacingHorizontalSNudge};
    position: relative;
    contain: layout style;
    vertical-align: middle;
    align-items: center;
    box-sizing: border-box;
    justify-content: center;
    text-align: center;
    text-decoration-line: none;
    margin: 0;
    min-height: 32px;
    outline-style: none;
    background-color: ${colorNeutralBackground1};
    color: ${colorNeutralForeground1};
    border: ${strokeWidthThin} solid ${colorNeutralStroke1};
    padding: 0 ${spacingHorizontalM};
    min-width: 96px;
    border-radius: ${borderRadiusMedium};
    font-size: ${fontSizeBase300};
    font-family: ${fontFamilyBase};
    font-weight: ${fontWeightSemibold};
    line-height: ${lineHeightBase300};
    transition-duration: ${durationFaster};
    transition-property: background, border, color;
    transition-timing-function: ${curveEasyEase};
    cursor: pointer;
    user-select: none;
  }

  .content {
    display: inherit;
  }

  :host(:hover) {
    background-color: ${colorNeutralBackground1Hover};
    color: ${colorNeutralForeground1Hover};
    border-color: ${colorNeutralStroke1Hover};
  }

  :host(:hover:active) {
    background-color: ${colorNeutralBackground1Pressed};
    border-color: ${colorNeutralStroke1Pressed};
    color: ${colorNeutralForeground1Pressed};
    outline-style: none;
  }

  :host(:focus-visible) {
    border-color: ${colorTransparentStroke};
    outline: ${strokeWidthThick} solid ${colorTransparentStroke};
    box-shadow: ${shadow4}, 0 0 0 2px ${colorStrokeFocus2};
  }

  @media screen and (prefers-reduced-motion: reduce) {
    :host {
      transition-duration: 0.01ms;
    }
  }

  ::slotted(svg) {
    font-size: 20px;
    height: 20px;
    width: 20px;
    fill: currentColor;
  }

  ::slotted([slot='start']) {
    margin-inline-end: var(--icon-spacing);
  }

  ::slotted([slot='end']),
  [slot='end'] {
    flex-shrink: 0;
    margin-inline-start: var(--icon-spacing);
  }

  :host([icon-only]) {
    min-width: 32px;
    max-width: 32px;
  }

  :host([size='small']) {
    --icon-spacing: ${spacingHorizontalXS};
    min-height: 24px;
    min-width: 64px;
    padding: 0 ${spacingHorizontalS};
    border-radius: ${borderRadiusSmall};
    font-size: ${fontSizeBase200};
    line-height: ${lineHeightBase200};
    font-weight: ${fontWeightRegular};
  }

  :host([size='small'][icon-only]) {
    min-width: 24px;
    max-width: 24px;
  }

  :host([size='large']) {
    min-height: 40px;
    border-radius: ${borderRadiusLarge};
    padding: 0 ${spacingHorizontalL};
    font-size: ${fontSizeBase400};
    line-height: ${lineHeightBase400};
  }

  :host([size='large'][icon-only]) {
    min-width: 40px;
    max-width: 40px;
  }

  :host([size='large']) ::slotted(svg) {
    font-size: 24px;
    height: 24px;
    width: 24px;
  }

  :host(:is([shape='circular'], [shape='circular']:focus-visible)) {
    border-radius: ${borderRadiusCircular};
  }

  :host(:is([shape='square'], [shape='square']:focus-visible)) {
    border-radius: ${borderRadiusNone};
  }

  :host([appearance='primary']) {
    background-color: ${colorBrandBackground};
    color: ${colorNeutralForegroundOnBrand};
    border-color: transparent;
  }

  :host([appearance='primary']:hover) {
    background-color: ${colorBrandBackgroundHover};
  }

  :host([appearance='primary']:is(:hover, :hover:active):not(:focus-visible)) {
    border-color: transparent;
  }

  :host([appearance='primary']:is(:hover, :hover:active)) {
    color: ${colorNeutralForegroundOnBrand};
  }

  :host([appearance='primary']:hover:active) {
    background-color: ${colorBrandBackgroundPressed};
  }

  :host([appearance='primary']:focus-visible) {
    border-color: ${colorNeutralForegroundOnBrand};
    box-shadow: ${shadow2}, 0 0 0 2px ${colorStrokeFocus2};
  }

  :host([appearance='outline']) {
    background-color: ${colorTransparentBackground};
  }

  :host([appearance='outline']:hover) {
    background-color: ${colorTransparentBackgroundHover};
  }

  :host([appearance='outline']:hover:active) {
    background-color: ${colorTransparentBackgroundPressed};
  }

  :host([appearance='subtle']) {
    background-color: ${colorSubtleBackground};
    color: ${colorNeutralForeground2};
    border-color: transparent;
  }

  :host([appearance='subtle']:hover) {
    background-color: ${colorSubtleBackgroundHover};
    color: ${colorNeutralForeground2Hover};
    border-color: transparent;
  }

  :host([appearance='subtle']:hover:active) {
    background-color: ${colorSubtleBackgroundPressed};
    color: ${colorNeutralForeground2Pressed};
    border-color: transparent;
  }

  :host([appearance='subtle']:hover) ::slotted(svg) {
    fill: ${colorNeutralForeground2BrandHover};
  }

  :host([appearance='subtle']:hover:active) ::slotted(svg) {
    fill: ${colorNeutralForeground2BrandPressed};
  }

  :host([appearance='transparent']) {
    background-color: ${colorTransparentBackground};
    color: ${colorNeutralForeground2};
  }

  :host([appearance='transparent']:hover) {
    background-color: ${colorTransparentBackgroundHover};
    color: ${colorNeutralForeground2BrandHover};
  }

  :host([appearance='transparent']:hover:active) {
    background-color: ${colorTransparentBackgroundPressed};
    color: ${colorNeutralForeground2BrandPressed};
  }

  :host(:is([appearance='transparent'], [appearance='transparent']:is(:hover, :active))) {
    border-color: transparent;
  }
`;
  var styles = css`
  ${baseButtonStyles}

  :host(:is(:disabled, [disabled], [disabled-focusable], [appearance]:disabled, [appearance][disabled], [appearance][disabled-focusable])),
  :host(:is(:disabled, [disabled], [disabled-focusable], [appearance]:disabled, [appearance][disabled], [appearance][disabled-focusable]):hover),
  :host(:is(:disabled, [disabled], [disabled-focusable], [appearance]:disabled, [appearance][disabled], [appearance][disabled-focusable]):hover:active) {
    background-color: ${colorNeutralBackgroundDisabled};
    border-color: ${colorNeutralStrokeDisabled};
    color: ${colorNeutralForegroundDisabled};
    cursor: not-allowed;
  }

  :host([appearance='primary']:is(:disabled, [disabled], [disabled-focusable])),
  :host([appearance='primary']:is(:disabled, [disabled], [disabled-focusable]):is(:hover, :hover:active)) {
    border-color: transparent;
  }

  :host([appearance='outline']:is(:disabled, [disabled], [disabled-focusable])),
  :host([appearance='outline']:is(:disabled, [disabled], [disabled-focusable]):is(:hover, :hover:active)) {
    background-color: ${colorTransparentBackground};
  }

  :host([appearance='subtle']:is(:disabled, [disabled], [disabled-focusable])),
  :host([appearance='subtle']:is(:disabled, [disabled], [disabled-focusable]):is(:hover, :hover:active)) {
    background-color: ${colorTransparentBackground};
    border-color: transparent;
  }

  :host([appearance='transparent']:is(:disabled, [disabled], [disabled-focusable])),
  :host([appearance='transparent']:is(:disabled, [disabled], [disabled-focusable]):is(:hover, :hover:active)) {
    border-color: transparent;
    background-color: ${colorTransparentBackground};
  }

  @media (forced-colors: active) {
    :host {
      background-color: ButtonFace;
      color: ButtonText;
    }

    :host(:is(:hover, :focus-visible)) {
      border-color: Highlight !important;
    }

    :host([appearance='primary']:not(:is(:hover, :focus-visible))) {
      background-color: Highlight;
      color: HighlightText;
      forced-color-adjust: none;
    }

    :host(
        :is(
            :disabled,
            [disabled],
            [disabled-focusable],
            [appearance]:disabled,
            [appearance][disabled],
            [appearance][disabled-focusable]
          )
      ) {
      background-color: ButtonFace;
      color: GrayText;
      border-color: ButtonText;
    }
  }
`;

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/utils/template-helpers.js
  function staticallyCompose(item) {
    if (!item) {
      return InlineTemplateDirective.empty;
    }
    if (typeof item === "string") {
      return new InlineTemplateDirective(item);
    }
    if ("inline" in item) {
      return item.inline();
    }
    return item;
  }

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/patterns/start-end.js
  var StartEnd = class {
  };
  function endSlotTemplate(options) {
    return html` <slot name="end" ${ref("end")}>${staticallyCompose(options.end)}</slot> `.inline();
  }
  function startSlotTemplate(options) {
    return html` <slot name="start" ${ref("start")}>${staticallyCompose(options.start)}</slot> `.inline();
  }

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/button/button.template.js
  function buttonTemplate(options = {}) {
    return html`
    <template
      @click="${(x, c) => x.clickHandler(c.event)}"
      @keypress="${(x, c) => x.keypressHandler(c.event)}"
    >
      ${startSlotTemplate(options)}
      <span class="content" part="content">
        <slot ${slotted("defaultSlottedContent")}></slot>
      </span>
      ${endSlotTemplate(options)}
    </template>
  `;
  }
  var template = buttonTemplate();

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/button/button.definition.js
  var definition = {
    name: tagName,
    registry: FluentDesignSystem.registry,
    styles,
    template
  };

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/utils/apply-mixins.js
  function applyMixins(derivedCtor, ...baseCtors) {
    const derivedAttributes = AttributeConfiguration.locate(derivedCtor);
    baseCtors.forEach((baseCtor) => {
      Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
        if (name !== "constructor") {
          Object.defineProperty(
            derivedCtor.prototype,
            name,
            /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
            Object.getOwnPropertyDescriptor(baseCtor.prototype, name)
          );
        }
      });
      const baseAttributes = AttributeConfiguration.locate(baseCtor);
      baseAttributes.forEach((x) => derivedAttributes.push(x));
    });
  }

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/tslib/tslib.es6.mjs
  function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  }

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/utils/autofocus.js
  function maybeSetAutoFocus(element) {
    const doc = element.ownerDocument;
    if (element?.isConnected && element?.hasAttribute("autofocus") && // Note: opacity=0 is considered visible based on the native `autofocus` implementation
    element?.checkVisibility?.({ contentVisibilityAuto: true, visibilityProperty: true }) && [null, element, doc.body, doc.documentElement].includes(doc.activeElement)) {
      Updates.enqueue(() => {
        element.focus();
      });
    }
  }

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/button/button.base.js
  var _BaseButton = class _BaseButton extends FASTElement {
    /**
     * Handles changes to the disabled attribute. If the button is disabled, it
     * should not be focusable.
     *
     * @param previous - the previous disabled value
     * @param next - the new disabled value
     * @internal
     */
    disabledChanged() {
      this.setTabIndex();
    }
    /**
     * Sets the element's internal disabled state when the element is focusable while disabled.
     *
     * @param previous - the previous disabledFocusable value
     * @param next - the current disabledFocusable value
     * @internal
     */
    disabledFocusableChanged(previous, next2) {
      if (this.elementInternals) {
        this.elementInternals.ariaDisabled = `${!!next2}`;
      }
    }
    /**
     * The associated form element.
     *
     * @public
     */
    get form() {
      return this.elementInternals.form;
    }
    /**
     * A reference to all associated label elements.
     *
     * @public
     */
    get labels() {
      return Object.freeze(Array.from(this.elementInternals.labels));
    }
    /**
     * Removes the form submission fallback control when the type changes.
     *
     * @param previous - the previous type value
     * @param next - the new type value
     * @internal
     */
    typeChanged(previous, next2) {
      if (next2 !== ButtonType.submit) {
        this.formSubmissionFallbackControl?.remove();
        this.shadowRoot?.querySelector('slot[name="internal"]')?.remove();
      }
    }
    /**
     * Handles the button click event.
     *
     * @param e - The event object
     * @internal
     */
    clickHandler(e) {
      if (e && this.disabledFocusable) {
        e.stopImmediatePropagation();
        return;
      }
      this.press();
      return true;
    }
    connectedCallback() {
      super.connectedCallback();
      this.elementInternals.ariaDisabled = `${!!this.disabledFocusable}`;
      this.setTabIndex();
      maybeSetAutoFocus(this);
    }
    constructor() {
      super();
      this.disabledFocusable = false;
      this.elementInternals = this.attachInternals();
      this.elementInternals.role = "button";
    }
    /**
     * This fallback creates a new slot, then creates a submit button to mirror the custom element's
     * properties. The submit button is then appended to the slot and the form is submitted.
     *
     * @internal
     * @privateRemarks
     * This is a workaround until {@link https://github.com/WICG/webcomponents/issues/814 | WICG/webcomponents/issues/814} is resolved.
     */
    createAndInsertFormSubmissionFallbackControl() {
      const internalSlot = this.formSubmissionFallbackControlSlot ?? document.createElement("slot");
      internalSlot.setAttribute("name", "internal");
      this.shadowRoot?.appendChild(internalSlot);
      this.formSubmissionFallbackControlSlot = internalSlot;
      const fallbackControl = this.formSubmissionFallbackControl ?? document.createElement("button");
      fallbackControl.style.display = "none";
      fallbackControl.setAttribute("type", "submit");
      fallbackControl.setAttribute("slot", "internal");
      if (this.formNoValidate) {
        fallbackControl.toggleAttribute("formnovalidate", true);
      }
      if (this.elementInternals.form?.id) {
        fallbackControl.setAttribute("form", this.elementInternals.form.id);
      }
      if (this.name) {
        fallbackControl.setAttribute("name", this.name);
      }
      if (this.value) {
        fallbackControl.setAttribute("value", this.value);
      }
      if (this.formAction) {
        fallbackControl.setAttribute("formaction", this.formAction ?? "");
      }
      if (this.formEnctype) {
        fallbackControl.setAttribute("formenctype", this.formEnctype ?? "");
      }
      if (this.formMethod) {
        fallbackControl.setAttribute("formmethod", this.formMethod ?? "");
      }
      if (this.formTarget) {
        fallbackControl.setAttribute("formtarget", this.formTarget ?? "");
      }
      this.append(fallbackControl);
      this.formSubmissionFallbackControl = fallbackControl;
    }
    /**
     * Invoked when a connected component's form or fieldset has its disabled state changed.
     *
     * @param disabled - the disabled value of the form / fieldset
     *
     * @internal
     */
    formDisabledCallback(disabled) {
      this.disabled = disabled;
    }
    /**
     * Handles keypress events for the button.
     *
     * @param e - the keyboard event
     * @returns - the return value of the click handler
     * @public
     */
    keypressHandler(e) {
      if (e && this.disabledFocusable) {
        e.stopImmediatePropagation();
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        this.click();
        return;
      }
      return true;
    }
    /**
     * Presses the button.
     *
     * @public
     */
    press() {
      switch (this.type) {
        case ButtonType.reset: {
          this.resetForm();
          break;
        }
        case ButtonType.submit: {
          this.submitForm();
          break;
        }
      }
    }
    /**
     * Resets the associated form.
     *
     * @public
     */
    resetForm() {
      this.elementInternals.form?.reset();
    }
    /**
     * Sets the `tabindex` attribute based on the disabled state of the button.
     *
     * @internal
     */
    setTabIndex() {
      if (this.disabled) {
        this.removeAttribute("tabindex");
        return;
      }
      this.tabIndex = Number(this.getAttribute("tabindex") ?? 0) < 0 ? -1 : 0;
    }
    /**
     * Submits the associated form.
     *
     * @internal
     */
    submitForm() {
      if (!this.elementInternals.form || this.disabled || this.type !== ButtonType.submit) {
        return;
      }
      if (!this.name && !this.formAction && !this.formEnctype && !this.formAttribute && !this.formMethod && !this.formNoValidate && !this.formTarget) {
        this.elementInternals.form.requestSubmit();
        return;
      }
      try {
        this.elementInternals.setFormValue(this.value ?? "");
        this.elementInternals.form.requestSubmit(this);
      } catch (e) {
        this.createAndInsertFormSubmissionFallbackControl();
        this.elementInternals.setFormValue(null);
        this.elementInternals.form.requestSubmit(this.formSubmissionFallbackControl);
      }
    }
  };
  _BaseButton.formAssociated = true;
  var BaseButton = _BaseButton;
  __decorate([
    observable
  ], BaseButton.prototype, "defaultSlottedContent", void 0);
  __decorate([
    attr({ mode: "boolean" })
  ], BaseButton.prototype, "disabled", void 0);
  __decorate([
    attr({ attribute: "disabled-focusable", mode: "boolean" })
  ], BaseButton.prototype, "disabledFocusable", void 0);
  __decorate([
    attr({ attribute: "formaction" })
  ], BaseButton.prototype, "formAction", void 0);
  __decorate([
    attr({ attribute: "form" })
  ], BaseButton.prototype, "formAttribute", void 0);
  __decorate([
    attr({ attribute: "formenctype" })
  ], BaseButton.prototype, "formEnctype", void 0);
  __decorate([
    attr({ attribute: "formmethod" })
  ], BaseButton.prototype, "formMethod", void 0);
  __decorate([
    attr({ attribute: "formnovalidate", mode: "boolean" })
  ], BaseButton.prototype, "formNoValidate", void 0);
  __decorate([
    attr({ attribute: "formtarget" })
  ], BaseButton.prototype, "formTarget", void 0);
  __decorate([
    attr
  ], BaseButton.prototype, "name", void 0);
  __decorate([
    attr
  ], BaseButton.prototype, "type", void 0);
  __decorate([
    attr
  ], BaseButton.prototype, "value", void 0);

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/button/button.js
  var Button = class extends BaseButton {
  };
  applyMixins(Button, StartEnd);

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/button/define.js
  Button.define(definition);

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/anchor-button/anchor-button.options.js
  var AnchorAttributes = {
    download: "download",
    href: "href",
    hreflang: "hreflang",
    ping: "ping",
    referrerpolicy: "referrerpolicy",
    rel: "rel",
    target: "target",
    type: "type"
  };
  var tagName2 = `${FluentDesignSystem.prefix}-anchor-button`;

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/anchor-button/anchor-button.styles.js
  var styles2 = css`
  ${baseButtonStyles}

  ::slotted(a) {
    position: absolute;
    inset: 0;
  }

  @media (forced-colors: active) {
    :host {
      border-color: LinkText;
      color: LinkText;
    }
  }
`;

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/anchor-button/anchor-button.template.js
  function anchorTemplate(options = {}) {
    return html`
    <template
      @click="${(x, c) => x.clickHandler(c.event)}"
      @keydown="${(x, c) => x.keydownHandler(c.event)}"
    >
      ${startSlotTemplate(options)}
      <span class="content" part="content">
        <slot></slot>
      </span>
      ${endSlotTemplate(options)}
    </template>
  `;
  }
  var template2 = anchorTemplate();

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/anchor-button/anchor-button.definition.js
  var definition2 = {
    name: tagName2,
    registry: FluentDesignSystem.registry,
    styles: styles2,
    template: template2
  };

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/anchor-button/anchor-button.base.js
  var BaseAnchor = class extends FASTElement {
    constructor() {
      super();
      this.isMac = navigator.userAgent.includes("Mac");
      this.elementInternals = this.attachInternals();
      this.internalProxyAnchor = this.createProxyElement();
      this.elementInternals.role = "link";
    }
    connectedCallback() {
      super.connectedCallback();
      this.tabIndex = Number(this.getAttribute("tabindex") ?? 0) < 0 ? -1 : 0;
      Observable.getNotifier(this).subscribe(this);
      Object.keys(this.$fastController.definition.attributeLookup).forEach((key) => {
        this.handleChange(this, key);
      });
      this.append(this.internalProxyAnchor);
    }
    disconnectedCallback() {
      super.disconnectedCallback();
      Observable.getNotifier(this).unsubscribe(this);
    }
    /**
     * Handles changes to observable properties
     * @internal
     * @param source - the source of the change
     * @param propertyName - the property name being changed
     */
    handleChange(source, propertyName) {
      if (propertyName in AnchorAttributes) {
        const attribute = this.$fastController.definition.attributeLookup[propertyName]?.attribute;
        if (attribute) {
          this.handleProxyAttributeChange(attribute, this[propertyName]);
        }
      }
    }
    /**
     * Handles the anchor click event.
     *
     * @param e - The event object
     * @internal
     */
    clickHandler(e) {
      if (e.composedPath()[0] === this.internalProxyAnchor) {
        e.stopImmediatePropagation();
        return true;
      }
      if (this.href) {
        const newTab = e.ctrlKey || e.metaKey;
        this.handleNavigation(newTab);
      }
      return true;
    }
    /**
     * Handles keydown events for the anchor.
     *
     * @param e - the keyboard event
     * @returns - the return value of the click handler
     * @public
     */
    keydownHandler(e) {
      if (this.href) {
        if (e.key === "Enter") {
          const newTab = !this.isMac ? e.ctrlKey : e.metaKey || e.ctrlKey;
          this.handleNavigation(newTab);
          return;
        }
      }
      return true;
    }
    /**
     * Handles navigation based on input
     * If a modified activation requests a new tab, opens the href in a new window.
     * @internal
     */
    handleNavigation(newTab) {
      newTab ? window.open(this.href, "_blank") : this.internalProxyAnchor.click();
    }
    /**
     * A method for updating proxy attributes when attributes have changed
     * @internal
     * @param attribute - an attribute to set/remove
     * @param value - the value of the attribute
     */
    handleProxyAttributeChange(attribute, value) {
      if (value) {
        this.internalProxyAnchor.setAttribute(attribute, value);
      } else {
        this.internalProxyAnchor.removeAttribute(attribute);
      }
    }
    createProxyElement() {
      const proxy = this.internalProxyAnchor ?? document.createElement("a");
      proxy.inert = true;
      return proxy;
    }
  };
  __decorate([
    attr
  ], BaseAnchor.prototype, "download", void 0);
  __decorate([
    attr
  ], BaseAnchor.prototype, "href", void 0);
  __decorate([
    attr
  ], BaseAnchor.prototype, "hreflang", void 0);
  __decorate([
    attr
  ], BaseAnchor.prototype, "ping", void 0);
  __decorate([
    attr
  ], BaseAnchor.prototype, "referrerpolicy", void 0);
  __decorate([
    attr
  ], BaseAnchor.prototype, "rel", void 0);
  __decorate([
    attr
  ], BaseAnchor.prototype, "target", void 0);
  __decorate([
    attr
  ], BaseAnchor.prototype, "type", void 0);

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/anchor-button/anchor-button.js
  var AnchorButton = class extends BaseAnchor {
  };
  applyMixins(AnchorButton, StartEnd);

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/anchor-button/define.js
  AnchorButton.define(definition2);

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/badge/badge.options.js
  var tagName3 = `${FluentDesignSystem.prefix}-badge`;

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/styles/partials/badge.partials.js
  var badgeBaseStyles = css.partial`
  ${display("inline-flex")} :host {
    position: relative;
    box-sizing: border-box;
    align-items: center;
    justify-content: center;
    font-family: ${fontFamilyBase};
    font-weight: ${fontWeightSemibold};
    font-size: ${fontSizeBase200};
    line-height: ${lineHeightBase200};
    min-width: 20px;
    height: 20px;
    padding-inline: calc(${spacingHorizontalXS} + ${spacingHorizontalXXS});
    border-radius: ${borderRadiusCircular};
    border-color: ${colorTransparentStroke};
    background-color: ${colorBrandBackground};
    color: ${colorNeutralForegroundOnBrand};
    contain: content;
  }

  ::slotted(svg) {
    font-size: 12px;
  }

  :host(:not([appearance='ghost']))::after {
    position: absolute;
    content: '';
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    border-style: solid;
    border-width: ${strokeWidthThin};
    border-color: inherit;
    border-radius: inherit;
  }
`;
  var badgeSizeStyles = css.partial`
  :host([size='tiny']) {
    width: 6px;
    height: 6px;
    font-size: 4px;
    line-height: 4px;
    padding-inline: 0;
    min-width: unset;
  }
  :host([size='tiny']) ::slotted(svg) {
    font-size: 6px;
  }
  :host([size='extra-small']) {
    width: 10px;
    height: 10px;
    font-size: 6px;
    line-height: 6px;
    padding-inline: 0;
    min-width: unset;
  }
  :host([size='extra-small']) ::slotted(svg) {
    font-size: 10px;
  }
  :host([size='small']) {
    min-width: 16px;
    height: 16px;
    font-size: ${fontSizeBase100};
    line-height: ${lineHeightBase100};
    padding-inline: calc(${spacingHorizontalXXS} + ${spacingHorizontalXXS});
  }
  :host([size='small']) ::slotted(svg) {
    font-size: 12px;
  }
  :host([size='large']) {
    min-width: 24px;
    height: 24px;
    font-size: ${fontSizeBase200};
    line-height: ${lineHeightBase200};
    padding-inline: calc(${spacingHorizontalXS} + ${spacingHorizontalXXS});
  }
  :host([size='large']) ::slotted(svg) {
    font-size: 16px;
  }
  :host([size='extra-large']) {
    min-width: 32px;
    height: 32px;
    font-size: ${fontSizeBase200};
    line-height: ${lineHeightBase200};
    padding-inline: calc(${spacingHorizontalSNudge} + ${spacingHorizontalXXS});
  }
  :host([size='extra-large']) ::slotted(svg) {
    font-size: 20px;
  }
`;
  var badgeFilledStyles = css.partial`
  :host([color='danger']) {
    background-color: ${colorPaletteRedBackground3};
    color: ${colorNeutralForegroundOnBrand};
  }

  :host([color='important']) {
    background-color: ${colorNeutralForeground1};
    color: ${colorNeutralBackground1};
  }

  :host([color='informative']) {
    background-color: ${colorNeutralBackground5};
    color: ${colorNeutralForeground3};
  }

  :host([color='severe']) {
    background-color: ${colorPaletteDarkOrangeBackground3};
    color: ${colorNeutralForegroundOnBrand};
  }

  :host([color='subtle']) {
    background-color: ${colorNeutralBackground1};
    color: ${colorNeutralForeground1};
  }

  :host([color='success']) {
    background-color: ${colorPaletteGreenBackground3};
    color: ${colorNeutralForegroundOnBrand};
  }

  :host([color='warning']) {
    background-color: ${colorPaletteYellowBackground3};
    color: ${colorNeutralForeground1Static};
  }
`;
  var badgeGhostStyles = css.partial`
  :host([appearance='ghost']) {
    color: ${colorBrandForeground1};
    background-color: initial;
  }

  :host([appearance='ghost'][color='danger']) {
    color: ${colorPaletteRedForeground3};
  }

  :host([appearance='ghost'][color='important']) {
    color: ${colorNeutralForeground1};
  }

  :host([appearance='ghost'][color='informative']) {
    color: ${colorNeutralForeground3};
  }

  :host([appearance='ghost'][color='severe']) {
    color: ${colorPaletteDarkOrangeForeground3};
  }

  :host([appearance='ghost'][color='subtle']) {
    color: ${colorNeutralForegroundInverted};
  }

  :host([appearance='ghost'][color='success']) {
    color: ${colorPaletteGreenForeground3};
  }

  :host([appearance='ghost'][color='warning']) {
    color: ${colorPaletteYellowForeground2};
  }
`;
  var badgeOutlineStyles = css.partial`
  :host([appearance='outline']) {
    border-color: currentColor;
    color: ${colorBrandForeground1};
    background-color: initial;
  }

  :host([appearance='outline'][color='danger']) {
    color: ${colorPaletteRedForeground3};
  }

  :host([appearance='outline'][color='important']) {
    color: ${colorNeutralForeground3};
    border-color: ${colorNeutralStrokeAccessible};
  }

  :host([appearance='outline'][color='informative']) {
    color: ${colorNeutralForeground3};
    border-color: ${colorNeutralStroke2};
  }

  :host([appearance='outline'][color='severe']) {
    color: ${colorPaletteDarkOrangeForeground3};
  }

  :host([appearance='outline'][color='subtle']) {
    color: ${colorNeutralForegroundStaticInverted};
  }

  :host([appearance='outline'][color='success']) {
    color: ${colorPaletteGreenForeground2};
  }

  :host([appearance='outline'][color='warning']) {
    color: ${colorPaletteYellowForeground2};
  }
`;
  var badgeTintStyles = css.partial`
  :host([appearance='tint']) {
    background-color: ${colorBrandBackground2};
    color: ${colorBrandForeground2};
    border-color: ${colorBrandStroke2};
  }

  :host([appearance='tint'][color='danger']) {
    background-color: ${colorPaletteRedBackground1};
    color: ${colorPaletteRedForeground1};
    border-color: ${colorPaletteRedBorder1};
  }

  :host([appearance='tint'][color='important']) {
    background-color: ${colorNeutralForeground3};
    color: ${colorNeutralBackground1};
    border-color: ${colorTransparentStroke};
  }

  :host([appearance='tint'][color='informative']) {
    background-color: ${colorNeutralBackground4};
    color: ${colorNeutralForeground3};
    border-color: ${colorNeutralStroke2};
  }

  :host([appearance='tint'][color='severe']) {
    background-color: ${colorPaletteDarkOrangeBackground1};
    color: ${colorPaletteDarkOrangeForeground1};
    border-color: ${colorPaletteDarkOrangeBorder1};
  }

  :host([appearance='tint'][color='subtle']) {
    background-color: ${colorNeutralBackground1};
    color: ${colorNeutralForeground3};
    border-color: ${colorNeutralStroke2};
  }

  :host([appearance='tint'][color='success']) {
    background-color: ${colorPaletteGreenBackground1};
    color: ${colorPaletteGreenForeground1};
    border-color: ${colorPaletteGreenBorder2};
  }

  :host([appearance='tint'][color='warning']) {
    background-color: ${colorPaletteYellowBackground1};
    color: ${colorPaletteYellowForeground2};
    border-color: ${colorPaletteYellowBorder1};
  }
`;

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/badge/badge.styles.js
  var styles3 = css`
  :host([shape='square']) {
    border-radius: ${borderRadiusNone};
  }

  :host([shape='rounded']) {
    border-radius: ${borderRadiusMedium};
  }

  :host([shape='rounded']:is([size='tiny'], [size='extra-small'], [size='small'])) {
    border-radius: ${borderRadiusSmall};
  }

  ${badgeTintStyles}
  ${badgeOutlineStyles}
  ${badgeGhostStyles}
  ${badgeFilledStyles}
  ${badgeSizeStyles}
  ${badgeBaseStyles}

  @media (forced-colors: active) {
    :host,
    :host([appearance='outline']),
    :host([appearance='tint']) {
      border-color: CanvasText;
    }
  }
`;

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/badge/badge.template.js
  function badgeTemplate(options = {}) {
    return html`
    ${startSlotTemplate(options)}
    <slot>${staticallyCompose(options.defaultContent)}</slot>
    ${endSlotTemplate(options)}
  `;
  }
  var template3 = badgeTemplate();

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/badge/badge.definition.js
  var definition3 = {
    name: tagName3,
    registry: FluentDesignSystem.registry,
    styles: styles3,
    template: template3
  };

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/badge/badge.js
  var Badge = class extends FASTElement {
  };
  applyMixins(Badge, StartEnd);

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/badge/define.js
  Badge.define(definition3);

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/utils/orientation.js
  var Orientation = {
    horizontal: "horizontal",
    vertical: "vertical"
  };

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/divider/divider.options.js
  var DividerRole = {
    /**
     * The divider semantically separates content
     */
    separator: "separator",
    /**
     * The divider has no semantic value and is for visual presentation only.
     */
    presentation: "presentation"
  };
  var DividerOrientation = Orientation;
  var tagName4 = `${FluentDesignSystem.prefix}-divider`;

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/divider/divider.styles.js
  var styles4 = css`
  ${display("flex")}

  :host {
    --_vertical-min-height: 10px;

    contain: content;
  }

  :host::after,
  :host::before {
    align-self: center;
    background: ${colorNeutralStroke2};
    box-sizing: border-box;
    content: '';
    display: flex;
    flex-grow: 1;
    height: ${strokeWidthThin};
  }

  :host([inset]) {
    padding: 0 12px;
  }

  :host ::slotted(*) {
    color: ${colorNeutralForeground2};
    font-family: ${fontFamilyBase};
    font-size: ${fontSizeBase200};
    font-weight: ${fontWeightRegular};
    margin: 0;
    padding: 0 12px;
  }

  :host([align-content='start'])::before,
  :host([align-content='end'])::after {
    flex-basis: 12px;
    flex-grow: 0;
    flex-shrink: 0;
  }

  :host([orientation='vertical']) {
    align-items: center;
    flex-direction: column;
    height: 100%;
  }

  :host([orientation='vertical'][inset])::before {
    margin-top: 12px;
  }

  :host([orientation='vertical'][inset])::after {
    margin-bottom: 12px;
  }

  :host([orientation='vertical'])::before,
  :host([orientation='vertical'])::after {
    width: ${strokeWidthThin};
    min-height: var(--_vertical-min-height);
    height: 100%;
  }

  /**
   * Use @supports to avoid the scoped styles from applying in Safari. Because
   * Safari supports @scope but ':scope:has(*)' would select a host with no
   * children.
   */
  @supports not selector(:host(:has(*))) {
    @scope {
      :scope:has(*) {
        --_vertical-min-height: 20px;
      }
    }
  }

  :host(:has(*)) {
    --_vertical-min-height: 20px;
  }

  :host([orientation='vertical']) ::slotted(*) {
    display: flex;
    flex-direction: column;
    padding: 12px 0;
    line-height: 20px;
  }

  :host([orientation='vertical'][align-content='start'])::before {
    min-height: 8px;
  }
  :host([orientation='vertical'][align-content='end'])::after {
    min-height: 8px;
  }

  :host([appearance='strong'])::before,
  :host([appearance='strong'])::after {
    background: ${colorNeutralStroke1};
  }
  :host([appearance='strong']) ::slotted(*) {
    color: ${colorNeutralForeground1};
  }
  :host([appearance='brand'])::before,
  :host([appearance='brand'])::after {
    background: ${colorBrandStroke1};
  }
  :host([appearance='brand']) ::slotted(*) {
    color: ${colorBrandForeground1};
  }
  :host([appearance='subtle'])::before,
  :host([appearance='subtle'])::after {
    background: ${colorNeutralStroke3};
  }
  :host([appearance='subtle']) ::slotted(*) {
    color: ${colorNeutralForeground3};
  }

  @media (forced-colors: active) {
    :host([appearance='strong'])::before,
    :host([appearance='strong'])::after,
    :host([appearance='brand'])::before,
    :host([appearance='brand'])::after,
    :host([appearance='subtle'])::before,
    :host([appearance='subtle'])::after,
    :host::after,
    :host::before {
      background: WindowText;
      color: WindowText;
    }
  }
`;

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/divider/divider.template.js
  function dividerTemplate() {
    return html`<slot></slot>`;
  }
  var template4 = dividerTemplate();

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/divider/divider.definition.js
  var definition4 = {
    name: tagName4,
    registry: FluentDesignSystem.registry,
    styles: styles4,
    template: template4
  };

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/utils/support.js
  var AnchorPositioningCSSSupported = CSS.supports("anchor-name: --a");
  var AnchorPositioningHTMLSupported = "anchor" in HTMLElement.prototype;
  var CustomStatesSetSupported = CSS.supports("selector(:state(g))");

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/utils/element-internals.js
  function toggleState(elementInternals, state, force) {
    if (!state || !elementInternals) {
      return;
    }
    if (!CustomStatesSetSupported) {
      elementInternals.shadowRoot.host.toggleAttribute(`state--${state}`, force);
      return;
    }
    if (force ?? !elementInternals.states.has(state)) {
      elementInternals.states.add(state);
      return;
    }
    elementInternals.states.delete(state);
  }
  var matchingStateMap = /* @__PURE__ */ new WeakMap();
  function hasMatchingState(States, state) {
    if (!States || !state) {
      return false;
    }
    if (matchingStateMap.has(States)) {
      return matchingStateMap.get(States).has(state);
    }
    const stateSet = new Set(Object.values(States));
    matchingStateMap.set(States, stateSet);
    return stateSet.has(state);
  }
  function swapStates(elementInternals, prev = "", next2 = "", States, prefix = "") {
    toggleState(elementInternals, `${prefix}${prev}`, false);
    if (!States || hasMatchingState(States, next2)) {
      toggleState(elementInternals, `${prefix}${next2}`, true);
    }
  }

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/divider/divider.base.js
  var BaseDivider = class extends FASTElement {
    constructor() {
      super(...arguments);
      this.elementInternals = this.attachInternals();
    }
    connectedCallback() {
      super.connectedCallback();
      this.elementInternals.role = this.role ?? DividerRole.separator;
      if (this.role !== DividerRole.presentation) {
        this.elementInternals.ariaOrientation = this.orientation ?? DividerOrientation.horizontal;
      }
    }
    /**
     * Sets the element's internal role when the role attribute changes.
     *
     * @param previous - the previous role value
     * @param next - the current role value
     * @internal
     */
    roleChanged(previous, next2) {
      if (this.$fastController.isConnected) {
        this.elementInternals.role = `${next2 ?? DividerRole.separator}`;
      }
      if (next2 === DividerRole.presentation) {
        this.elementInternals.ariaOrientation = null;
      }
    }
    /**
     * Sets the element's internal orientation when the orientation attribute changes.
     *
     * @param previous - the previous orientation value
     * @param next - the current orientation value
     * @internal
     */
    orientationChanged(previous, next2) {
      this.elementInternals.ariaOrientation = this.role !== DividerRole.presentation ? next2 ?? null : null;
      swapStates(this.elementInternals, previous, next2, DividerOrientation);
    }
  };
  __decorate([
    attr
  ], BaseDivider.prototype, "role", void 0);
  __decorate([
    attr
  ], BaseDivider.prototype, "orientation", void 0);

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/divider/divider.js
  var Divider = class extends BaseDivider {
  };

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/divider/define.js
  Divider.define(definition4);

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/message-bar/message-bar.options.js
  var tagName5 = `${FluentDesignSystem.prefix}-message-bar`;

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/message-bar/message-bar.styles.js
  var styles5 = css`
  :host {
    display: grid;
    box-sizing: border-box;
    font-family: ${fontFamilyBase};
    font-size: ${fontSizeBase200};
    line-height: ${lineHeightBase200};
    width: 100%;
    background: ${colorNeutralBackground3};
    color: ${colorNeutralForeground3};
    border: 1px solid ${colorNeutralStroke1};
    padding-inline: ${spacingHorizontalM};
    border-radius: ${borderRadiusMedium};
    min-height: 36px;
    align-items: center;
    grid-template: 'icon body actions dismiss' / auto 1fr auto auto;
    contain: layout style paint;
  }

  :host([shape='square']) {
    border-radius: 0;
  }

  :host([intent='success']) {
    background-color: ${colorPaletteGreenBackground1};
    border-color: ${colorPaletteGreenBorder1};
  }

  :host([intent='warning']) {
    background-color: ${colorPaletteDarkOrangeBackground1};
    border-color: ${colorPaletteDarkOrangeBorder1};
  }

  :host([intent='error']) {
    background-color: ${colorPaletteRedBackground1};
    border-color: ${colorPaletteRedBorder1};
  }

  :host([layout='multiline']) {
    grid-template-areas:
      'icon body dismiss'
      'actions actions actions';
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto auto 1fr;
    padding-block: ${spacingVerticalMNudge};
    padding-inline: ${spacingHorizontalM};
  }

  .content {
    grid-area: body;
    padding-block: ${spacingVerticalMNudge};
    padding-inline: 0;
  }

  :host([layout='multiline']) .content {
    padding: 0;
  }

  ::slotted([slot='icon']) {
    display: flex;
    grid-area: icon;
    flex-direction: column;
    align-items: center;
    color: ${colorNeutralForeground3};
    margin-inline-end: ${spacingHorizontalS};
  }

  :host([layout='multiline']) ::slotted([slot='icon']) {
    align-items: start;
    height: 100%;
  }

  ::slotted([slot='dismiss']) {
    grid-area: dismiss;
  }

  .actions {
    grid-area: actions;
    display: flex;
    justify-self: end;
    margin-inline-end: ${spacingHorizontalS};
    gap: ${spacingHorizontalS};
  }

  :host([layout='multiline']) .actions {
    margin-block-start: ${spacingVerticalMNudge};
    margin-inline-end: 0;
  }

  :host([layout='multiline']) ::slotted([slot='dismiss']) {
    align-items: start;
    height: 100%;
  }

  ::slotted(*) {
    font-size: inherit;
  }
`;

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/message-bar/message-bar.template.js
  function messageBarTemplate() {
    return html`
    <slot name="icon"></slot>
    <div class="content">
      <slot></slot>
    </div>
    <div class="actions">
      <slot name="actions"></slot>
    </div>
    <slot name="dismiss"></slot>
  `;
  }
  var template5 = messageBarTemplate();

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/message-bar/message-bar.definition.js
  var definition5 = {
    name: tagName5,
    registry: FluentDesignSystem.registry,
    styles: styles5,
    template: template5
  };

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/message-bar/message-bar.js
  var MessageBar = class extends FASTElement {
    constructor() {
      super();
      this.elementInternals = this.attachInternals();
      this.dismissMessageBar = () => {
        this.$emit("dismiss", {});
      };
      this.elementInternals.role = "status";
    }
  };

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/@fluentui/web-components/dist/esm/message-bar/define.js
  MessageBar.define(definition5);

  // web/src/api.ts
  async function api(path, opts) {
    const r = await fetch(path, opts);
    const j = await r.json();
    if (!j.ok) throw new Error(j.error?.message || "HTTP " + r.status);
    return j;
  }

  // web/src/format.ts
  function formatNumber(n) {
    return n.toLocaleString("en-US");
  }
  function formatDuration(ms) {
    if (ms < 1e3) return `${ms}ms`;
    if (ms < 6e4) return `${(ms / 1e3).toFixed(1)}s`;
    return `${Math.floor(ms / 6e4)}m ${Math.floor(ms % 6e4 / 1e3)}s`;
  }
  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }

  // web/src/ui/shell.ts
  var userNav = [
    { href: "/user/main", label: "\u63A7\u5236\u53F0", icon: "\u25C7" },
    { href: "/user/stats", label: "\u7528\u91CF\u7EDF\u8BA1", icon: "\u25A4" }
  ];
  var adminNav = [
    { href: "/admin/models", label: "\u6A21\u578B", icon: "\u25C7" },
    { href: "/admin/model-groups", label: "\u5206\u7EC4", icon: "\u25A6" },
    { href: "/admin/api-keys", label: "\u5BC6\u94A5", icon: "\u2318" },
    { href: "/admin/users", label: "\u7528\u6237", icon: "\u25CE" },
    { href: "/admin/stats", label: "\u7EDF\u8BA1", icon: "\u25A4" },
    { href: "/admin/announcement", label: "\u516C\u544A", icon: "\u270E" },
    { href: "/admin/privacy", label: "\u9690\u79C1", icon: "\u25C8" },
    { href: "/admin/password", label: "\u5BC6\u7801", icon: "\u26BF" }
  ];
  var formCSS = `
:root{--border-color:var(--ui-line);--bg-page:var(--ui-bg);--text-secondary:var(--ui-muted)}
.form-card,.limits-card{background:#fff;border:1px solid var(--ui-line);border-radius:var(--ui-radius);padding:18px;box-shadow:0 1px 2px rgba(16,24,40,.04),0 8px 24px rgba(16,24,40,.03)}
.form-title,.limits-title{margin:0 0 4px;font-size:18px;font-weight:800}.page-subtitle,.limits-subtitle{margin:0 0 16px;color:var(--ui-muted)}
.form-group{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}.form-label{font-size:12px;font-weight:800;color:var(--ui-ink)}
.form-input,.form-select,.form-textarea{width:100%;border:1px solid #D0D5DD;border-radius:9px;padding:9px 11px;min-height:38px;font:inherit;background:#fff;color:var(--ui-ink)}
.form-textarea{min-height:120px;resize:vertical}.form-hint{font-size:11px;color:var(--ui-muted)}
.form-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}.btn,.btn-submit{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:9px 14px;min-height:38px;border:1px solid var(--ui-line);border-radius:9px;background:#fff;color:var(--ui-ink);font-weight:700;font-size:13px;cursor:pointer}
.btn-primary,.btn-submit{background:var(--ui-accent);border-color:var(--ui-accent);color:#fff}.btn-secondary{background:#fff}.btn-danger{color:#DC2626;border-color:#FECACA}.btn-small{padding:5px 9px;min-height:30px;font-size:12px}.btn-icon{min-width:30px;padding:5px}
.error-banner,.alert-error{background:#FEF2F2;border:1px solid #FECACA;color:#991B1B;border-radius:10px;padding:11px 14px;margin-bottom:16px}.success-banner,.alert-success{background:#ECFDF5;border:1px solid #A7F3D0;color:#065F46;border-radius:10px;padding:11px 14px;margin-bottom:16px}
.section-title{font-size:14px;margin:18px 0 10px}.limits-table{width:100%;border-collapse:collapse}.limits-table th,.limits-table td{padding:10px 12px;border-bottom:1px solid var(--ui-line);text-align:left;font-size:13px}.limits-table th{color:var(--ui-muted);font-size:11px}.form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}
.model-selector{display:grid;grid-template-columns:1fr 1fr;gap:14px}.model-list{min-height:180px;border:1px solid var(--ui-line);border-radius:10px;padding:12px;background:#FAFCFF}.model-list-title{font-size:13px;margin:0 0 10px}.model-list-empty{color:var(--ui-muted);font-size:12px}.checkbox-list{display:grid;gap:8px}.checkbox-item,.model-item{display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--ui-line);border-radius:8px;background:#fff;font-size:13px}.model-item-name{flex:1}.model-item-desc{color:var(--ui-muted)}.model-actions{display:flex;gap:5px}.selected-index{color:var(--ui-muted);font-family:ui-monospace,monospace}.apikey-display{margin-bottom:14px}.apikey-label{display:block;font-size:12px;font-weight:800;margin-bottom:6px}.apikey-code{display:block;padding:10px;background:#F8FAFC;border:1px solid var(--ui-line);border-radius:8px;word-break:break-all}.apikey-note{font-size:11px;color:var(--ui-muted)}
.heatmap-scroll{overflow-x:auto;padding-bottom:6px}.heatmap-grid{display:flex;gap:3px;min-width:660px}.heatmap-col{display:flex;flex-direction:column;gap:3px;flex:1 1 0;min-width:0}.heatmap-months{display:flex;gap:3px;min-width:660px}.heatmap-months>span{flex:1 1 0;min-width:0;overflow:hidden;white-space:nowrap;color:var(--ui-muted);font-size:11px}.heatmap-cell{display:block;width:100%;aspect-ratio:1/1;border-radius:2px;background:#ebedf0;min-width:0}.heatmap-legend{display:flex;align-items:center;gap:4px;margin-top:10px;color:var(--ui-muted);font-size:11px}.heatmap-legend .heatmap-cell{width:11px;height:11px;flex:none;aspect-ratio:auto}.heatmap-tip{position:fixed;z-index:9999;pointer-events:none;background:#101828;color:#fff;font-size:12px;padding:5px 8px;border-radius:6px;white-space:nowrap;display:none;box-shadow:0 6px 18px rgba(16,24,40,.22)}
@media(max-width:820px){.model-selector{grid-template-columns:1fr}.form-card,.limits-card{padding:14px}.form-actions .btn,.btn-submit{min-height:44px}}
`;
  function shell(opts) {
    const width = opts.width ?? 1180;
    const nav = opts.nav ?? adminNav;
    const links = nav.map((n) => {
      const active = opts.path === n.href || n.href !== "/admin/models" && opts.path.startsWith(n.href + "/") || n.href === "/admin/models" && opts.path.startsWith("/admin/models/");
      return `<a href="${n.href}" class="ui-nav-link${active ? " is-active" : ""}">${n.icon ? `<span class="ui-nav-icon">${n.icon}</span>` : ""}<span>${escapeHtml(n.label)}</span></a>`;
    }).join("");
    return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(opts.title)} \xB7 LLM Gateway</title><style>${uiCSS}${formCSS}${opts.extraCSS || ""}</style></head><body>
<header class="ui-topbar"><div class="ui-topbar-inner" style="max-width:${width}px">
  <a href="/admin/models" class="ui-brand"><span class="ui-brand-mark">L</span><span>LLM Gateway</span></a>
  <nav class="ui-nav">${links}</nav>
  <div class="ui-topbar-end"><a href="/user/main" class="ui-link">\u7528\u6237\u7AEF</a><span class="ui-version">v${escapeHtml(opts.version || "1.15.0")}</span></div>
</div></header>
<main class="ui-main" style="max-width:${width}px">${opts.body}</main>
<footer class="ui-footer" style="max-width:${width}px">LLM Gateway \xB7 Go rewrite</footer>
${opts.scripts || ""}
</body></html>`;
  }
  function pageHeader(opts) {
    return `<div class="ui-page-head"><div><div class="ui-eyebrow">${escapeHtml(opts.eyebrow || "\u63A7\u5236\u53F0")}</div><h1 class="ui-title">${escapeHtml(opts.title)}</h1>${opts.subtitle ? `<p class="ui-subtitle">${escapeHtml(opts.subtitle)}</p>` : ""}</div>${opts.actions ? `<div class="ui-actions">${opts.actions}</div>` : ""}</div>`;
  }
  function panel(title, subtitle, content = "", actions = "") {
    return `<section class="ui-panel">${title || actions ? `<div class="ui-panel-head"><div>${title ? `<h2 class="ui-panel-title">${escapeHtml(title)}</h2>` : ""}${subtitle ? `<p class="ui-panel-sub">${escapeHtml(subtitle)}</p>` : ""}</div>${actions ? `<div class="ui-panel-actions">${actions}</div>` : ""}</div>` : ""}<div class="ui-panel-body">${content}</div></section>`;
  }
  function notice(message, kind = "info") {
    return `<div class="ui-notice ui-notice-${kind}">${escapeHtml(message)}</div>`;
  }
  function empty(title, hint, action = "") {
    return `<div class="ui-empty"><div class="ui-empty-mark">\u25C7</div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(hint)}</p>${action}</div>`;
  }
  function table(headers, rows) {
    return `<div class="ui-table-wrap"><table class="ui-table"><thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
  }
  function formField(label, input, hint = "") {
    return `<label class="ui-field"><span class="ui-field-label">${escapeHtml(label)}</span>${input}${hint ? `<span class="ui-field-hint">${escapeHtml(hint)}</span>` : ""}</label>`;
  }
  var uiCSS = `
:root{--ui-bg:#F6F8FB;--ui-panel:#fff;--ui-line:#E3E8EF;--ui-ink:#111827;--ui-muted:#64748B;--ui-accent:#2563EB;--ui-soft:#EFF4FF;--ui-radius:14px}
*{box-sizing:border-box}html,body{margin:0;padding:0}body{background:var(--ui-bg);color:var(--ui-ink);font:14px/1.55 Inter,"Noto Sans SC",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
a{color:var(--ui-accent);text-decoration:none}a:hover{text-decoration:none}
.ui-topbar{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.94);backdrop-filter:blur(14px);border-bottom:1px solid var(--ui-line)}
.ui-topbar-inner{margin:0 auto;padding:0 20px;min-height:64px;display:flex;align-items:center;gap:20px}
.ui-brand{display:flex;align-items:center;gap:9px;font-weight:800;color:var(--ui-ink);font-size:15px;white-space:nowrap}
.ui-brand-mark{display:grid;place-items:center;width:28px;height:28px;border-radius:8px;background:var(--ui-accent);color:#fff;font-size:13px}
.ui-nav{display:flex;gap:2px;flex:1;overflow-x:auto;scrollbar-width:none}.ui-nav::-webkit-scrollbar{display:none}
.ui-nav-link{display:flex;align-items:center;gap:6px;color:var(--ui-muted);padding:8px 11px;border-radius:9px;font-size:13px;font-weight:600;white-space:nowrap}
.ui-nav-link:hover{background:var(--ui-soft);color:var(--ui-accent)}
.ui-nav-link.is-active{background:var(--ui-soft);color:var(--ui-accent)}
.ui-nav-icon{font-size:12px;opacity:.8}
.ui-topbar-end{display:flex;align-items:center;gap:12px;font-size:12px;color:var(--ui-muted);white-space:nowrap}
.ui-version{font-family:ui-monospace,monospace;padding:2px 7px;border:1px solid var(--ui-line);border-radius:999px}
.ui-main{margin:0 auto;padding:26px 20px 60px;min-height:70vh}
.ui-footer{margin:0 auto;padding:0 20px 28px;color:var(--ui-muted);font-size:12px;text-align:center}
.ui-page-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:22px;padding-bottom:18px;border-bottom:1px solid var(--ui-line);flex-wrap:wrap}
.ui-eyebrow{font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--ui-accent);margin-bottom:4px}
.ui-title{font-size:25px;line-height:1.2;letter-spacing:-.02em;margin:0;font-weight:800}
.ui-subtitle{margin:5px 0 0;color:var(--ui-muted);font-size:13px}
.ui-actions{display:flex;gap:8px;flex-wrap:wrap}
.ui-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:9px 14px;min-height:38px;border:1px solid var(--ui-line);border-radius:9px;background:#fff;color:var(--ui-ink);font-weight:700;font-size:13px;cursor:pointer}
.ui-btn:hover{background:#F9FAFB;box-shadow:0 2px 8px rgba(16,24,40,.06)}
.ui-btn-primary{background:var(--ui-accent);border-color:var(--ui-accent);color:#fff}
.ui-btn-primary:hover{background:#1D4ED8}
.ui-btn-danger{color:#DC2626;border-color:#FECACA;background:#fff}
.ui-btn-sm{padding:5px 9px;min-height:30px;font-size:12px}
.ui-panel{background:var(--ui-panel);border:1px solid var(--ui-line);border-radius:var(--ui-radius);box-shadow:0 1px 2px rgba(16,24,40,.04),0 8px 24px rgba(16,24,40,.03);overflow:hidden;margin-bottom:16px}
.ui-panel-head{padding:15px 18px;border-bottom:1px solid var(--ui-line);display:flex;align-items:center;justify-content:space-between;gap:12px}
.ui-panel-title{margin:0;font-size:15px;font-weight:800}
.ui-panel-sub{margin:2px 0 0;color:var(--ui-muted);font-size:12px}
.ui-panel-body{padding:18px}
.ui-grid{display:grid;gap:16px}.ui-grid-2{grid-template-columns:minmax(0,1.35fr) minmax(0,1fr)}.ui-grid-auto{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}
.ui-notice{padding:11px 14px;border-radius:10px;margin-bottom:16px;font-size:13px;border:1px solid}
.ui-notice-error{background:#FEF2F2;border-color:#FECACA;color:#991B1B}.ui-notice-success{background:#ECFDF5;border-color:#A7F3D0;color:#065F46}.ui-notice-info{background:var(--ui-soft);border-color:#D7E3FF;color:#1E40AF}
.ui-empty{text-align:center;padding:42px 20px;border:1px dashed var(--ui-line);border-radius:var(--ui-radius);color:var(--ui-muted)}
.ui-empty-mark{font-size:24px;color:var(--ui-accent);margin-bottom:8px}.ui-empty h3{margin:0 0 4px;color:var(--ui-ink)}.ui-empty p{margin:0 0 14px}
.ui-table-wrap{overflow:auto;border:1px solid var(--ui-line);border-radius:var(--ui-radius);background:#fff}
.ui-table{width:100%;border-collapse:collapse;min-width:680px}
.ui-table th{text-align:left;padding:11px 14px;background:#F8FAFC;color:var(--ui-muted);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid var(--ui-line)}
.ui-table td{padding:12px 14px;border-bottom:1px solid var(--ui-line);vertical-align:middle;font-size:13px}
.ui-table tr:last-child td{border-bottom:0}.ui-table tbody tr:hover{background:#FAFCFF}
.ui-field{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
.ui-field-label{font-size:12px;font-weight:800}.ui-field-hint{font-size:11px;color:var(--ui-muted)}
.ui-input,.ui-select,.ui-textarea{width:100%;border:1px solid #D0D5DD;border-radius:9px;padding:9px 11px;min-height:38px;font:inherit;background:#fff;color:var(--ui-ink)}
.ui-input:focus,.ui-select:focus,.ui-textarea:focus{border-color:var(--ui-accent);box-shadow:0 0 0 3px rgba(37,99,235,.12);outline:none}
.ui-badge{display:inline-grid;place-items:center;min-width:26px;height:26px;padding:0 7px;border-radius:8px;background:var(--ui-soft);color:var(--ui-accent);font-weight:800;font-size:12px}
.ui-mono{font-family:"IBM Plex Mono",ui-monospace,monospace}
.ui-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.ui-spacer{flex:1}
@media(max-width:820px){.ui-topbar-inner{flex-wrap:wrap;padding:10px 14px;gap:8px}.ui-nav{order:3;width:100%;flex-basis:100%}.ui-topbar-end{margin-left:auto}.ui-main{padding:18px 14px 48px}.ui-grid-2{grid-template-columns:1fr}.ui-page-head{align-items:flex-start}.ui-btn{min-height:44px}}
`;

  // web/src/styles/admin_models.ts
  var modelsCSS = `
:root{
  --f-bg:var(--neutralLayer2,#F5F5F5);
  --f-surface:var(--neutralLayer1,#FFFFFF);
  --f-text:var(--neutralForeground1,#242424);
  --f-muted:var(--neutralForeground3,#616161);
  --f-line:var(--neutralStroke2,#E0E0E0);
  --f-brand:var(--brandForeground1,#0F6CBD);
  --f-danger:var(--paletteRedForeground1,#B10E1C);
}
body{background:var(--f-bg);color:var(--f-text)}
.f-page{max-width:1180px;margin:0 auto;padding:28px 20px 56px}
.f-head{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:20px;flex-wrap:wrap}
.f-eyebrow{font-size:11px;letter-spacing:.14em;font-weight:700;color:var(--f-muted);text-transform:uppercase;margin-bottom:6px}
.f-title{font-size:28px;line-height:1.2;margin:0 0 6px;font-weight:600}
.f-subtitle{margin:0;color:var(--f-muted);font-size:13px}
.f-commandbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.f-card{background:var(--f-surface);border:1px solid var(--f-line);border-radius:8px;box-shadow:0 1px 2px rgba(0,0,0,.04);overflow:hidden}
.f-card-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 20px 14px}
.f-card-title{margin:0;font-size:16px;font-weight:600}
.f-card-sub{margin:3px 0 0;font-size:12px;color:var(--f-muted)}
.f-table-wrap{overflow-x:auto}
.f-table{width:100%;border-collapse:collapse;font-size:13px}
.f-table th{text-align:left;font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:var(--f-muted);font-weight:600;padding:10px 16px;background:rgba(0,0,0,.015);border-bottom:1px solid var(--f-line);white-space:nowrap}
.f-table td{padding:12px 16px;border-bottom:1px solid var(--f-line);vertical-align:middle}
.f-row:last-child td{border-bottom:0}
.f-row:hover td{background:rgba(0,0,0,.018)}
.f-row.is-hidden{opacity:.62}
.f-index{width:52px}
.f-model-name{font-weight:600;color:var(--f-text)}
.f-model-real{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;color:var(--f-muted);margin-top:3px}
.f-desc{color:var(--f-muted);max-width:260px}
.f-state{width:96px}
.f-actions{display:flex;gap:4px;align-items:center;flex-wrap:wrap}
.f-actions fluent-button,.f-actions fluent-anchor-button{min-width:30px}
.f-danger{color:var(--f-danger)}
.f-empty{padding:64px 20px;text-align:center;color:var(--f-muted)}
.f-empty-mark{font-size:40px;color:var(--f-brand);line-height:1}
.f-empty h3{margin:12px 0 4px;color:var(--f-text);font-size:16px}
.f-empty p{margin:0 0 16px;font-size:13px}
fluent-message-bar{margin-bottom:16px;display:block}
@media(max-width:820px){.f-page{padding:18px 12px 40px}.f-title{font-size:23px}.f-head{align-items:flex-start}.f-table th,.f-table td{padding:10px}}
`;

  // web/src/views/models.ts
  function modelsPage(models, error, version = "1.15.0") {
    const rows = models.map((m, i) => `<tr class="f-row${m.hidden ? " is-hidden" : ""}">
    <td class="f-index"><fluent-badge appearance="neutral" size="small">${i + 1}</fluent-badge></td>
    <td>
      <div class="f-model-name">${escapeHtml(m.customModel)}</div>
      <div class="f-model-real">\u2192 ${escapeHtml(m.realModel)}</div>
    </td>
    <td class="f-desc">${escapeHtml(m.desc || "\u2014")}</td>
    <td class="f-state">${m.hidden ? '<fluent-badge appearance="neutral">\u5DF2\u9690\u85CF</fluent-badge>' : '<fluent-badge appearance="success">\u542F\u7528\u4E2D</fluent-badge>'}</td>
    <td>
      <div class="f-actions">
        <fluent-button appearance="subtle" size="small" aria-label="\u4E0A\u79FB" data-move-url="/admin/models/move/${encodeURIComponent(m.customModel)}" data-direction="up" ${i === 0 ? "disabled" : ""}>\u2191</fluent-button>
        <fluent-button appearance="subtle" size="small" aria-label="\u4E0B\u79FB" data-move-url="/admin/models/move/${encodeURIComponent(m.customModel)}" data-direction="down" ${i === models.length - 1 ? "disabled" : ""}>\u2193</fluent-button>
        <fluent-button appearance="subtle" size="small" data-toggle-url="/admin/models/toggle-hidden/${encodeURIComponent(m.customModel)}">${m.hidden ? "\u663E\u793A" : "\u9690\u85CF"}</fluent-button>
        <fluent-button appearance="subtle" size="small" data-copy-url="/admin/models/copy/${encodeURIComponent(m.customModel)}">\u590D\u5236</fluent-button>
        <fluent-anchor-button appearance="subtle" size="small" href="/admin/models/edit/${encodeURIComponent(m.customModel)}">\u7F16\u8F91</fluent-anchor-button>
        <fluent-anchor-button appearance="subtle" size="small" href="/admin/models/${encodeURIComponent(m.customModel)}/limits">\u9650\u5236</fluent-anchor-button>
        <fluent-button appearance="subtle" size="small" class="f-danger" data-delete-url="/admin/models/delete/${encodeURIComponent(m.customModel)}">\u5220\u9664</fluent-button>
      </div>
    </td>
  </tr>`).join("");
    const content = `
<section class="f-page">
  <div class="f-head">
    <div>
      <div class="f-eyebrow">ROUTING</div>
      <h1 class="f-title">\u6A21\u578B\u7BA1\u7406</h1>
      <p class="f-subtitle">\u914D\u7F6E\u548C\u7BA1\u7406\u6240\u6709\u4E0A\u6E38\u6A21\u578B\u4FE1\u606F\uFF0C\u8C03\u6574\u987A\u5E8F\u53CA\u589E\u51CF\u6A21\u578B\u3002</p>
    </div>
    <div class="f-commandbar">
      <fluent-anchor-button appearance="secondary" href="/admin/model-groups">\u6A21\u578B\u5206\u7EC4</fluent-anchor-button>
      <fluent-anchor-button appearance="primary" href="/admin/models/new">+ \u65B0\u589E\u6A21\u578B</fluent-anchor-button>
    </div>
  </div>
  ${error ? `<fluent-message-bar severity="error">${escapeHtml(error)}</fluent-message-bar>` : ""}
  <section class="f-card">
    <header class="f-card-head">
      <div>
        <h2 class="f-card-title">\u6A21\u578B\u5217\u8868</h2>
        <p class="f-card-sub">${models.length} \u4E2A\u6A21\u578B</p>
      </div>
      <fluent-badge appearance="brand">${models.length}</fluent-badge>
    </header>
    <fluent-divider></fluent-divider>
    ${models.length ? `
    <div class="f-table-wrap">
      <table class="f-table">
        <thead><tr><th>#</th><th>\u6A21\u578B\u540D\u79F0</th><th>\u63CF\u8FF0</th><th>\u72B6\u6001</th><th>\u64CD\u4F5C</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>` : `
    <div class="f-empty">
      <div class="f-empty-mark">\u25C7</div>
      <h3>\u6682\u65E0\u6A21\u578B</h3>
      <p>\u70B9\u51FB\u201C\u65B0\u589E\u6A21\u578B\u201D\u5F00\u59CB\u914D\u7F6E\u3002</p>
      <fluent-anchor-button appearance="primary" href="/admin/models/new">\u65B0\u589E\u6A21\u578B</fluent-anchor-button>
    </div>`}
  </section>
</section>`;
    const script = `<script>(function(){
function post(url){var f=document.createElement('form');f.method='post';f.action=url;document.body.appendChild(f);f.submit()}
document.querySelectorAll('[data-delete-url]').forEach(function(btn){btn.addEventListener('click',function(){var url=this.getAttribute('data-delete-url');var n=decodeURIComponent(url.split('/').pop());if(confirm('\u786E\u5B9A\u8981\u5220\u9664\u6A21\u578B "'+n+'" \u5417\uFF1F')){post(url)}})});
document.querySelectorAll('[data-move-url]').forEach(function(btn){btn.addEventListener('click',function(){post(this.getAttribute('data-move-url')+'?direction='+this.getAttribute('data-direction'))})});
document.querySelectorAll('[data-copy-url]').forEach(function(btn){btn.addEventListener('click',function(){var url=this.getAttribute('data-copy-url');var n=decodeURIComponent(url.split('/').pop());if(confirm('\u786E\u5B9A\u8981\u590D\u5236\u6A21\u578B "'+n+'" \u5417\uFF1F')){post(url)}})});
document.querySelectorAll('[data-toggle-url]').forEach(function(btn){btn.addEventListener('click',function(){post(this.getAttribute('data-toggle-url'))})});
})();<\/script>`;
    return shell({ title: "\u6A21\u578B\u7BA1\u7406", path: "/admin/models", version, body: content, scripts: script, extraCSS: modelsCSS });
  }

  // web/src/views/groups.ts
  function groupsPage(groups, error, success, version = "1.15.0") {
    const cards = groups.map((g) => `<article class="ui-panel" style="margin:0">
    <div class="ui-panel-head"><div><h3 class="ui-panel-title">${escapeHtml(g.name)}</h3><p class="ui-panel-sub">${g.models.length} \u4E2A\u6A21\u578B</p></div><a class="ui-btn ui-btn-sm" href="/admin/model-groups/edit/${encodeURIComponent(g.name)}">\u7BA1\u7406\u6A21\u578B</a></div>
    <div class="ui-panel-body"><p class="ui-field-hint">${escapeHtml(g.desc || "\u2014")}</p><div class="ui-row" style="margin:10px 0 14px">${g.models.slice(0, 5).map((m) => `<a class="ui-badge" href="/admin/models/edit/${encodeURIComponent(m)}">${escapeHtml(m)}</a>`).join("")}${g.models.length > 5 ? `<span class="ui-field-hint">+${g.models.length - 5}</span>` : ""}</div>
    <form method="POST" action="/admin/model-groups/delete/${encodeURIComponent(g.name)}"><button class="ui-btn ui-btn-sm ui-btn-danger">\u5220\u9664\u5206\u7EC4</button></form></div></article>`).join("");
    const body = pageHeader({ eyebrow: "Routing", title: "\u6A21\u578B\u5206\u7EC4", subtitle: "\u7BA1\u7406\u6A21\u578B\u5206\u7EC4\u914D\u7F6E", actions: `<a class="ui-btn" href="/admin/models">\u8FD4\u56DE\u6A21\u578B</a><a class="ui-btn ui-btn-primary" href="/admin/model-groups/new">+ \u65B0\u5EFA\u5206\u7EC4</a>` }) + (error ? notice(error, "error") : "") + (success ? notice(success, "success") : "") + (groups.length ? `<div class="ui-grid ui-grid-auto">${cards}</div>` : panel("\u5206\u7EC4\u5217\u8868", "", empty("\u6682\u65E0\u5206\u7EC4", "\u521B\u5EFA\u5206\u7EC4\u540E\u53EF\u914D\u7F6E\u6A21\u578B\u56DE\u9000\u987A\u5E8F\u3002")));
    return shell({ title: "\u6A21\u578B\u5206\u7EC4", path: "/admin/model-groups", version, body });
  }

  // web/src/views/users.ts
  function usersPage(users, enabled = true, error, version = "1.15.0") {
    const cards = users.map((u) => `<article class="ui-panel" style="margin:0">
    <div class="ui-panel-head"><div><h3 class="ui-panel-title">${escapeHtml(u.name)}</h3><p class="ui-panel-sub">${escapeHtml(u.desc || "\u2014")}</p></div><a class="ui-btn ui-btn-sm" href="/admin/users/edit/${encodeURIComponent(u.name)}">\u7F16\u8F91</a></div>
    <div class="ui-panel-body">
      <div class="ui-field-hint ui-mono" style="margin-bottom:10px">${escapeHtml(u.apikey.slice(0, 8))}\u2026</div>
      <div class="ui-row">${!u.allowedModels || u.allowedModels.length === 0 ? '<span class="ui-badge">\u6240\u6709\u6A21\u578B</span>' : u.allowedModels.slice(0, 3).map((m) => `<span class="ui-badge">${escapeHtml(m)}</span>`).join("")}${(u.allowedModels?.length || 0) > 3 ? `<span class="ui-field-hint">\u7B49${u.allowedModels.length - 3}\u4E2A\u6A21\u578B</span>` : ""}</div>
      <div class="ui-row" style="margin-top:14px"><form method="POST" action="/api/admin/users/delete/${encodeURIComponent(u.name)}"><button class="ui-btn ui-btn-sm ui-btn-danger">\u5220\u9664</button></form></div>
    </div></article>`).join("");
    const toggle = `<form method="post" action="/admin/users/toggle"><input type="hidden" name="enabled" value="${enabled ? "false" : "true"}"><button class="ui-btn">${enabled ? "\u7981\u7528\u7528\u6237\u8BA4\u8BC1" : "\u542F\u7528\u7528\u6237\u8BA4\u8BC1"}</button></form>`;
    const body = pageHeader({ eyebrow: "Access", title: "\u7528\u6237\u7BA1\u7406", subtitle: "\u7BA1\u7406\u8BBF\u95EE API \u7684\u7528\u6237\u548C\u5BC6\u94A5", actions: `<a class="ui-btn ui-btn-primary" href="/admin/users/new">+ \u65B0\u589E\u7528\u6237</a>${toggle}` }) + (error ? notice(error, "error") : "") + (users.length ? `<div class="ui-grid ui-grid-auto">${cards}</div>` : panel("\u7528\u6237\u5217\u8868", "", empty("\u6682\u65E0\u7528\u6237", "\u6DFB\u52A0\u7528\u6237\u540E\u5373\u53EF\u6309\u5BC6\u94A5\u9650\u5236\u8BBF\u95EE\u3002")));
    return shell({ title: "\u7528\u6237\u7BA1\u7406", path: "/admin/users", version, body });
  }

  // web/src/views/apiKeys.ts
  function apiKeysPage(keys, error, success, version = "1.15.0", editing) {
    const rows = keys.map((k) => `<tr>
    <td><strong>${escapeHtml(k.name)}</strong><div class="ui-field-hint">${k.createdAt ? new Date(k.createdAt).toLocaleDateString("zh-CN") : ""}</div></td>
    <td class="ui-mono">${escapeHtml(k.keyHint || (k.key ? "*****" + k.key.slice(-4) : "*****"))}</td>
    <td><div class="ui-row">
      <a class="ui-btn ui-btn-sm" href="/admin/api-keys/edit/${encodeURIComponent(k.id)}">\u7F16\u8F91</a>
      <form method="POST" action="/admin/api-keys/delete/${encodeURIComponent(k.id)}" onsubmit="return confirm('\u786E\u5B9A\u5220\u9664 ${escapeHtml(k.name)}?')"><button class="ui-btn ui-btn-sm ui-btn-danger">\u5220\u9664</button></form>
    </div></td>
  </tr>`);
    const form = `<form method="POST" action="${editing ? "/admin/api-keys/edit/" + encodeURIComponent(editing.id) : "/admin/api-keys"}">
    ${formField("\u540D\u79F0", `<input class="ui-input" name="name" value="${editing ? escapeHtml(editing.name) : ""}" placeholder="\u4F8B\u5982\uFF1A\u4E3B\u7F51\u5173 Key" required>`)}
    ${formField("API Key", `<input class="ui-input" name="key" placeholder="${editing ? "\u7559\u7A7A\u8868\u793A\u4FDD\u6301\u5F53\u524D\u503C" : "sk-..."}" ${editing ? "" : "required"}>`, editing ? `\u5F53\u524D\u503C\uFF1A${escapeHtml(editing.keyHint)}` : "")}
    <div class="ui-row"><button class="ui-btn ui-btn-primary">${editing ? "\u4FDD\u5B58\u4FEE\u6539" : "\u6DFB\u52A0\u5BC6\u94A5"}</button><a class="ui-btn" href="/admin/api-keys">\u53D6\u6D88</a></div>
  </form>`;
    const body = pageHeader({
      eyebrow: "Credentials",
      title: "API Key \u7BA1\u7406",
      subtitle: "\u96C6\u4E2D\u7EF4\u62A4\u4E0A\u6E38\u8C03\u7528\u4F7F\u7528\u7684\u5BC6\u94A5\uFF0C\u6A21\u578B\u914D\u7F6E\u53EF\u901A\u8FC7 $$\u540D\u79F0$$ \u5F15\u7528\u3002",
      actions: `<a class="ui-btn ui-btn-primary" href="/admin/api-keys">+ \u65B0\u589E\u5BC6\u94A5</a>`
    }) + (error ? notice(error, "error") : "") + (success ? notice(success, "success") : "") + `<div class="ui-grid ui-grid-2">
      ${panel("\u5BC6\u94A5\u5217\u8868", `${keys.length} \u4E2A\u5DF2\u5B58\u50A8\u5BC6\u94A5`, keys.length ? table(["\u540D\u79F0", "Key", "\u64CD\u4F5C"], rows) : empty("\u6682\u65E0\u5BC6\u94A5", "\u6DFB\u52A0\u7B2C\u4E00\u4E2A API Key \u540E\u5373\u53EF\u5728\u6A21\u578B\u914D\u7F6E\u4E2D\u5F15\u7528\u3002"))}
      ${panel(editing ? "\u7F16\u8F91\u5BC6\u94A5" : "\u65B0\u589E\u5BC6\u94A5", "", form)}
    </div>`;
    return shell({ title: "API Key \u7BA1\u7406", path: "/admin/api-keys", version, body });
  }

  // web/src/views/password.ts
  function passwordPage(hasPassword, error, success, version = "1.15.0") {
    const body = pageHeader({
      eyebrow: "SECURITY",
      title: "\u5BC6\u7801\u8BBE\u7F6E",
      subtitle: "\u8BBE\u7F6E\u6216\u4FEE\u6539\u7BA1\u7406\u540E\u53F0\u767B\u5F55\u5BC6\u7801"
    }) + (error ? notice(error, "error") : "") + (success ? notice(success, "success") : "") + panel("", "", `<div class="form-card"><form method="POST" action="/api/admin/password">${hasPassword ? '<div class="form-group"><label class="form-label" for="currentPassword">\u5F53\u524D\u5BC6\u7801</label><input class="form-input" type="password" id="currentPassword" name="currentPassword"></div>' : ""}<div class="form-group"><label class="form-label" for="newPassword">\u65B0\u5BC6\u7801</label><input class="form-input" type="password" id="newPassword" name="newPassword"></div><div class="form-group"><label class="form-label" for="confirmPassword">\u786E\u8BA4\u65B0\u5BC6\u7801</label><input class="form-input" type="password" id="confirmPassword" name="confirmPassword"></div><div class="form-actions"><button class="btn btn-primary" name="action" value="change">\u4FDD\u5B58\u5BC6\u7801</button>${hasPassword ? '<button class="btn btn-danger" name="action" value="delete">\u5220\u9664\u5BC6\u7801</button>' : ""}</div></form></div><script>document.querySelector('form').addEventListener('submit',async function(e){e.preventDefault();var f=e.target;var a=document.activeElement&&document.activeElement.value||'change';var body={action:a,currentPassword:f.currentPassword?f.currentPassword.value:'',newPassword:f.newPassword.value,confirmPassword:f.confirmPassword.value};var r=await fetch('/api/admin/password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});var j=await r.json();if(j.ok){location.reload()}else{alert(j.error&&j.error.message||'\u64CD\u4F5C\u5931\u8D25')}})<\/script>`);
    return shell({ title: "\u5BC6\u7801\u8BBE\u7F6E", path: "/admin/password", body, version });
  }

  // web/src/views/privacy.ts
  function privacyPage(s, detailLogEnabled = false, cliDebug = false, error, success, version = "1.15.0") {
    const body = pageHeader({
      eyebrow: "PRIVACY",
      title: "\u9690\u79C1\u4FDD\u62A4",
      subtitle: "\u63A7\u5236\u65E5\u5FD7\u4E2D\u7684\u654F\u611F\u4FE1\u606F\u5904\u7406"
    }) + (error ? notice(error, "error") : "") + (success ? notice(success, "success") : "") + panel("", "", `<div class="form-card"><form id="privacy-form" method="POST" action="/admin/privacy">${[["enabled", "\u542F\u7528\u9690\u79C1\u4FDD\u62A4"], ["stripUserField", "\u62B9\u6389 user \u5B57\u6BB5"], ["sanitizeFilePaths", "\u6587\u4EF6\u8DEF\u5F84\u7528\u6237\u540D\u66FF\u6362"], ["whitelistFilter", "\u767D\u540D\u5355\u5B57\u6BB5\u8FC7\u6EE4"]].map(([k, label]) => `<div class="form-group"><label><input type="checkbox" name="${k}" ${s[k] ? "checked" : ""}> ${label}</label></div>`).join("")}<div class="form-group"><label class="form-label" for="pathPlaceholder">\u8DEF\u5F84\u5360\u4F4D\u7B26</label><input class="form-input" id="pathPlaceholder" name="pathPlaceholder" value="${s.pathPlaceholder || "USER"}"></div><div class="form-group"><label class="form-label">\u65E5\u5FD7\u8BB0\u5F55</label><label><input type="checkbox" name="detailLogEnabled" ${detailLogEnabled ? "checked" : ""} ${cliDebug ? "disabled" : ""}> \u8BB0\u5F55\u5B8C\u6574\u8BF7\u6C42/\u54CD\u5E94\u65E5\u5FD7</label>${cliDebug ? '<p class="form-hint">\u547D\u4EE4\u884C\u542F\u52A8\u65F6\u4F7F\u7528\u4E86 --debug\uFF0C\u65E5\u5FD7\u8BB0\u5F55\u8BBE\u7F6E\u4E0D\u53EF\u4FEE\u6539</p>' : ""}</div><div class="form-group"><label class="form-label">\u547D\u4EE4\u884C\u8C03\u8BD5\u53C2\u6570</label><code>--debug</code></div><div class="form-actions"><button class="btn btn-primary" type="submit">\u4FDD\u5B58\u8BBE\u7F6E</button></div></form></div>`);
    return shell({ title: "\u9690\u79C1\u4FDD\u62A4", path: "/admin/privacy", body, version });
  }

  // web/src/views/announcement.ts
  function announcementPage(content, enabled = true, error, success, version = "1.15.0") {
    const body = pageHeader({
      eyebrow: "ANNOUNCEMENT",
      title: "\u516C\u544A\u7BA1\u7406",
      subtitle: "\u8BBE\u7F6E\u7528\u6237\u9875\u9762\u663E\u793A\u7684\u516C\u544A\uFF08\u652F\u6301 Markdown\uFF09"
    }) + (error ? notice(error, "error") : "") + (success ? notice(success, "success") : "") + panel("", "", `<div class="form-card"><form method="POST" action="/admin/announcement"><div class="form-group"><label class="form-label" for="content">\u516C\u544A\u5185\u5BB9</label><textarea class="form-textarea" id="content" name="content" rows="12">${escapeHtml(content)}</textarea></div><div class="form-group"><label><input type="checkbox" name="enabled" ${enabled ? "checked" : ""}> \u542F\u7528\u516C\u544A</label></div><div class="form-actions"><button class="btn btn-primary" type="submit">\u4FDD\u5B58\u516C\u544A</button></div></form></div>`);
    return shell({ title: "\u516C\u544A\u7BA1\u7406", path: "/admin/announcement", body, version });
  }

  // web/src/views/jsonEditor.ts
  function jsonEditor(name, value = "") {
    const sanitized = name.replace(/[^a-zA-Z0-9_-]/g, "_");
    const id3 = `je-${sanitized}-${Math.random().toString(36).slice(2, 8)}`;
    return `<div style="display:flex;gap:1rem;margin-bottom:0.5rem"><div style="flex:1"><textarea id="${id3}-input" style="width:100%;min-height:180px;padding:0.75rem;font-family:monospace;font-size:0.85rem;border:1.5px solid var(--border-color);border-radius:8px;resize:vertical;background:var(--bg-page)" placeholder='{"temperature": 0.7, "max_tokens": 4096}' oninput="jsonEditorValidate('${id3}')">${escapeHtml(value)}</textarea><div style="display:flex;gap:0.5rem;margin-top:0.5rem"><button type="button" style="padding:0.4rem 0.8rem;font-size:0.8rem;cursor:pointer" onclick="jsonEditorFormat('${id3}')">\u683C\u5F0F\u5316</button><button type="button" style="padding:0.4rem 0.8rem;font-size:0.8rem;cursor:pointer" onclick="jsonEditorClear('${id3}')">\u6E05\u7A7A</button></div></div><div style="flex:1"><pre id="${id3}-preview" style="min-height:180px;padding:0.75rem;font-family:monospace;font-size:0.85rem;border:1.5px solid var(--border-color);border-radius:8px;background:#dcfce7;overflow:auto" data-valid="true">${escapeHtml(value ? JSON.stringify(JSON.parse(value || "{}"), null, 2) : "\u7B49\u5F85\u8F93\u5165...")}</pre></div></div><input type="hidden" id="${id3}-hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}"><script>window.jsonEditorValidate=function(id){var t=document.getElementById(id+'-input'),p=document.getElementById(id+'-preview'),h=document.getElementById(id+'-hidden');try{var o=JSON.parse(t.value),f=JSON.stringify(o,null,2);p.textContent=f;p.setAttribute('data-valid','true');p.style.background='#dcfce7';h.value=f}catch(e){p.textContent='JSON \u683C\u5F0F\u9519\u8BEF\uFF1A'+e.message;p.setAttribute('data-valid','false');p.style.background='#fef2f2';h.value=t.value}};window.jsonEditorFormat=function(id){var t=document.getElementById(id+'-input');try{t.value=JSON.stringify(JSON.parse(t.value),null,2);window.jsonEditorValidate(id)}catch(e){alert('JSON \u683C\u5F0F\u9519\u8BEF\uFF1A'+e.message)}};window.jsonEditorClear=function(id){var t=document.getElementById(id+'-input'),p=document.getElementById(id+'-preview'),h=document.getElementById(id+'-hidden');t.value='';p.textContent='\u7B49\u5F85\u8F93\u5165...';p.setAttribute('data-valid','true');p.style.background='#dcfce7';h.value=''}<\/script>`;
  }

  // web/src/views/modelForm.ts
  function modelFormPage(model, apiKeyOptions, error, version = "1.15.0", selectedApiKeyRef) {
    const isEdit = !!model;
    const m = model || {};
    const v = (s) => escapeHtml(s || "");
    const opts = apiKeyOptions.map((k) => typeof k === "string" ? { id: k, name: k } : k);
    const refName = selectedApiKeyRef || (model?.apiKey?.startsWith("$$") && model.apiKey.endsWith("$$") ? model.apiKey.slice(2, -2) : "");
    const keyOptions = opts.map((k) => `<option value="${escapeHtml(k.id)}"${refName === k.name ? " selected" : ""}>${escapeHtml(k.name)}</option>`).join("");
    const testScript = `
<script>window.runTest = async function(){var b=document.getElementById('testBtn');b.disabled=true;document.getElementById('testLoading').style.display='block';try{var src=document.getElementById('apiKeySourceTest').value;var payload={provider:b.dataset.provider,baseUrl:b.dataset.base,realModel:b.dataset.real,message:document.getElementById('testMessage').value,defaultParams:JSON.parse(b.dataset.params||'{}'),proxy:document.getElementById('proxy')?document.getElementById('proxy').value:''};if(src!=='manual'){payload.apiKeyId=src}else{payload.apiKey=document.getElementById('apiKeyTest').value}var res=await fetch('/admin/models/test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});var d=await res.json();if(d.success){document.getElementById('testResultModel').textContent=d.model||b.dataset.real;document.getElementById('testResultContent').textContent=d.content||'(\u65E0\u5185\u5BB9)';document.getElementById('testResultUsage').textContent=d.usage?('Tokens: \u8F93\u5165='+d.usage.prompt_tokens+', \u8F93\u51FA='+d.usage.completion_tokens):'';if(d.requestBody){document.getElementById('requestBodyContent').textContent=d.requestBody;document.getElementById('requestSection').style.display='block'}if(d.fullResponse){document.getElementById('responseBodyContent').textContent=d.fullResponse;document.getElementById('responseSection').style.display='block'}document.getElementById('testResult').style.display='block'}else{document.getElementById('testErrorMessage').textContent=d.message||'\u672A\u77E5\u9519\u8BEF';if(d.rawResponse){document.getElementById('testRawResponse').textContent=d.rawResponse;document.getElementById('rawResponseSection').style.display='block'}document.getElementById('testError').style.display='block'}}catch(e){document.getElementById('testErrorMessage').textContent='\u8BF7\u6C42\u5931\u8D25: '+e.message;document.getElementById('testError').style.display='block'}finally{b.disabled=false;document.getElementById('testLoading').style.display='none'}};window.toggleRawResponse = function(){var s=document.getElementById('rawResponseSection');s.style.display=s.style.display==='none'?'block':'none'}<\/script>`;
    const testHtml = isEdit ? `<details class="test-details"><summary>\u{1F9EA} \u6D4B\u8BD5\u6A21\u578B\u914D\u7F6E</summary><div class="form-card" style="margin-top:1rem"><div class="form-group"><label class="form-label" for="testMessage">\u6D4B\u8BD5\u6D88\u606F</label><textarea class="form-textarea" id="testMessage" placeholder="\u8BF7\u4ECB\u7ECD\u4E00\u4E0B\u4F60\u81EA\u5DF1">\u8BF7\u4ECB\u7ECD\u4E00\u4E0B\u4F60\u81EA\u5DF1</textarea></div><div class="form-group"><label class="form-label" for="apiKeySourceTest">API Key \u6765\u6E90</label><select id="apiKeySourceTest"><option value="manual">\u624B\u52A8\u8F93\u5165</option>${keyOptions}</select><input id="apiKeyTest" placeholder="\u7559\u7A7A\u5219\u4F7F\u7528\u6A21\u578B\u5DF2\u4FDD\u5B58\u7684 Key"></div><button type="button" class="btn btn-primary" id="testBtn" onclick="runTest()" data-provider="${v(m.provider)}" data-base="${v(m.baseUrl)}" data-real="${v(m.realModel)}" data-params="${escapeHtml(JSON.stringify(m.defaultParams || {}))}">\u53D1\u9001\u6D4B\u8BD5\u8BF7\u6C42</button><div id="testLoading" style="display:none;margin-top:0.75rem">\u53D1\u9001\u4E2D\u2026</div><div id="testResult" style="display:none;margin-top:1rem">\u6A21\u578B: <strong id="testResultModel"></strong><pre id="testResultContent"></pre><div id="testResultUsage"></div></div><div id="requestSection" style="display:none"><pre id="requestBodyContent"></pre></div><div id="responseSection" style="display:none"><pre id="responseBodyContent"></pre></div><div id="testError" style="display:none;margin-top:1rem;color:#dc2626"><span id="testErrorMessage"></span><div id="rawResponseSection" style="display:none"><pre id="testRawResponse"></pre></div></div></div></details>${testScript}` : "";
    const title = isEdit ? "\u7F16\u8F91\u6A21\u578B" : "\u65B0\u589E\u6A21\u578B";
    const form = `<div class="form-card"><form method="post" action="${isEdit ? `/admin/models/edit/${encodeURIComponent(m.customModel)}` : "/admin/models"}">
<div class="form-group"><label class="form-label" for="customModel">\u6A21\u578B\u540D\u79F0</label><input class="form-input" id="customModel" name="customModel" value="${v(m.customModel)}" placeholder="\u4F8B\u5982\uFF1Amy-gpt4" required><span class="form-hint">\u8C03\u7528 API \u65F6\u4F7F\u7528\u6B64\u540D\u79F0</span></div>
<div class="form-group"><label class="form-label" for="realModel">\u5B9E\u9645\u6A21\u578B\u540D\u79F0</label><input class="form-input" id="realModel" name="realModel" value="${v(m.realModel)}" placeholder="\u4F8B\u5982\uFF1Agpt-4" required><span class="form-hint">\u4E0A\u6E38 API \u652F\u6301\u7684\u6A21\u578B\u540D\u79F0</span></div>
<div class="form-group"><label class="form-label" for="provider">Provider</label><select class="form-select" id="provider" name="provider" required><option value="">\u8BF7\u9009\u62E9...</option>${["openai", "response-api", "anthropic"].map((p) => `<option value="${p}" ${m.provider === p ? "selected" : ""}>${p}</option>`).join("")}</select></div>
<div class="form-group"><label class="form-label" for="baseUrl">Base URL</label><input class="form-input" id="baseUrl" name="baseUrl" value="${v(m.baseUrl)}" placeholder="\u4F8B\u5982\uFF1Ahttps://api.openai.com" required><span class="form-hint">API \u63D0\u4F9B\u5546\u7684\u5730\u5740</span></div>
<div class="form-group"><label class="form-label" for="proxy">\u4EE3\u7406\uFF08\u53EF\u9009\uFF09</label><input class="form-input" id="proxy" name="proxy" value="${v(m.proxy)}" placeholder="http://user:pass@127.0.0.1:7890 \u6216 socks5://127.0.0.1:1080"><span class="form-hint">\u53D1\u5F80\u4E0A\u6E38\u7684\u8BF7\u6C42\u901A\u8FC7\u6B64\u4EE3\u7406\u8F6C\u53D1\uFF0C\u7559\u7A7A\u5219\u76F4\u8FDE\u3002\u652F\u6301 http://\u3001https://\u3001socks5://\uFF08\u53EF\u5E26 user:pass@ \u8BA4\u8BC1\uFF09\uFF1B\u4E0D\u652F\u6301 socks5h:// \u548C socks4://</span></div>
<div class="form-group"><label class="form-label" for="apiKeySource">API Key</label><select class="form-select" id="apiKeySource" name="apiKeySource" onchange="var i=document.getElementById('apiKeyManual');i.disabled=this.value!=='manual';if(i.disabled)i.value=''"><option value="manual"${refName ? "" : " selected"}>\u624B\u52A8\u8F93\u5165</option>${keyOptions}</select><input class="form-input" id="apiKeyManual" name="apiKey" ${refName ? "disabled" : ""} placeholder="${refName ? `\u4F7F\u7528\u5F15\u7528\uFF1A$$${escapeHtml(refName)}$$` : isEdit ? "\u7559\u7A7A\u5219\u4FDD\u6301\u539F\u5BC6\u94A5\u4E0D\u53D8" : "\u8BF7\u8F93\u5165 API Key"}"><span class="form-hint">${refName ? `\u5F15\u7528 API Key\u300C${escapeHtml(refName)}\u300D\uFF0C\u4FEE\u6539\u540E\u5C06\u5168\u5C40\u751F\u6548` : "\u53EF\u9009\u62E9\u5DF2\u4FDD\u5B58\u7684 API Key\uFF0C\u6216\u624B\u52A8\u8F93\u5165"}${isEdit ? "\uFF1B\u7559\u7A7A\u5219\u4FDD\u6301\u539F\u5BC6\u94A5\u4E0D\u53D8" : ""}</span></div>
<div class="form-group"><label class="form-label" for="desc">\u63CF\u8FF0</label><textarea class="form-textarea" id="desc" name="desc" placeholder="\u8BF7\u8F93\u5165\u6A21\u578B\u63CF\u8FF0\uFF08\u53EF\u9009\uFF09">${v(m.desc)}</textarea><span class="form-hint">\u7528\u4E8E\u8BB0\u5F55\u6A21\u578B\u7684\u7528\u9014\u6216\u5907\u6CE8</span></div>
<div class="form-group"><label class="form-label" for="maxContextLength">\u6700\u5927\u4E0A\u4E0B\u6587\u957F\u5EA6</label><input class="form-input" id="maxContextLength" name="maxContextLength" type="number" value="${m.maxContextLength || ""}" placeholder="\u9ED8\u8BA4 200000"><span class="form-hint">\u6A21\u578B\u652F\u6301\u7684\u6700\u5927 token \u6570\uFF0C\u672A\u586B\u5199\u5219\u4F7F\u7528\u9ED8\u8BA4\u503C 200000</span></div>
<div class="form-group"><label class="form-label">\u9ED8\u8BA4\u53C2\u6570 (JSON)</label>${jsonEditor("defaultParams", m.defaultParams ? JSON.stringify(m.defaultParams, null, 2) : "")}</div>
<div class="form-actions"><button type="submit" class="btn btn-primary">\u4FDD\u5B58\u6A21\u578B</button><a href="/admin/models" class="btn btn-secondary">\u53D6\u6D88</a></div></form></div>`;
    const body = pageHeader({ eyebrow: "MODEL", title, subtitle: isEdit ? "\u4FEE\u6539\u6A21\u578B\u914D\u7F6E\u4E0E API Key \u5F15\u7528" : "\u521B\u5EFA\u65B0\u7684\u4E0A\u6E38\u6A21\u578B\u914D\u7F6E", actions: '<a class="ui-btn" href="/admin/models">\u8FD4\u56DE\u6A21\u578B</a>' }) + (error ? notice(error, "error") : "") + panel("\u6A21\u578B\u914D\u7F6E", "", form) + testHtml;
    return shell({ title, path: "/admin/models", body, version });
  }

  // web/src/views/modelLimits.ts
  function modelLimitsPage(model, limits, error, success, version = "1.15.0") {
    const rows = limits.map((l, i) => `<tr><td>${escapeHtml(l.type)}</td><td>${escapeHtml(l.period)}</td><td>${l.periodValue}</td><td>${l.type === "cost" ? l.costMax : l.max}</td><td>${escapeHtml(l.groupName || "")}</td><td>${l.enabled ? "\u542F\u7528" : "\u7981\u7528"}</td><td><div class="actions-cell"><button class="btn btn-small" type="button" onclick="editLimit(${i})">\u7F16\u8F91</button><form method="POST" action="/api/admin/models/${encodeURIComponent(model)}/limits/delete/${i}" style="display:inline"><button class="btn btn-small btn-danger" type="submit">\u5220\u9664</button></form></div></td></tr>`).join("");
    const body = pageHeader({
      eyebrow: "MODEL LIMITS",
      title: `\u9650\u5236\u89C4\u5219\u7BA1\u7406 - ${model}`,
      subtitle: "\u8BBE\u7F6E\u6BCF\u5206\u949F/\u6BCF\u5C0F\u65F6\u8BF7\u6C42\u6570\u3001token \u6570\u6216\u8D39\u7528\u9650\u5236",
      actions: '<a class="ui-btn" href="/admin/models">\u8FD4\u56DE\u6A21\u578B</a>'
    }) + (error ? `<div class="error-banner">${escapeHtml(error)}</div>` : "") + (success ? `<div class="success-banner">${escapeHtml(success)}</div>` : "") + panel("\u9650\u5236\u89C4\u5219", "", `<div class="limits-card"><h2 class="limits-title">\u9650\u5236\u89C4\u5219\u7BA1\u7406</h2>${limits.length ? `<table class="limits-table"><thead><tr><th>\u7C7B\u578B</th><th>\u5468\u671F</th><th>\u5468\u671F\u503C</th><th>\u4E0A\u9650</th><th>\u7528\u6237\u7EC4</th><th>\u72B6\u6001</th><th>\u64CD\u4F5C</th></tr></thead><tbody>${rows}</tbody></table>` : empty("\u6682\u65E0\u9650\u5236\u89C4\u5219")}<h3 class="section-title">\u65B0\u589E\u89C4\u5219</h3><form method="POST" action="/api/admin/models/${encodeURIComponent(model)}/limits/add"><input type="hidden" name="model" value="${escapeHtml(model)}"><div class="form-grid"><div class="form-group"><label class="form-label" for="type">\u7C7B\u578B</label><select class="form-select" id="type" name="type" onchange="handleTypeChange()"><option value="rpm">\u8BF7\u6C42\u6570/\u5206\u949F</option><option value="tpm">Token/\u5206\u949F</option><option value="cost">\u8D39\u7528</option></select></div><div class="form-group"><label class="form-label" for="period">\u5468\u671F</label><select class="form-select" id="period" name="period" onchange="handlePeriodChange()"><option value="minute">\u5206\u949F</option><option value="hour">\u5C0F\u65F6</option><option value="day">\u5929</option></select></div><div class="form-group"><label class="form-label" for="periodValue">\u5468\u671F\u503C</label><input class="form-input" id="periodValue" name="periodValue" type="number" value="1"></div><div class="form-group" id="maxField"><label class="form-label" for="max">\u4E0A\u9650</label><input class="form-input" id="max" name="max" type="number"></div><div class="form-group" id="costMaxField" style="display:none"><label class="form-label" for="costMax">\u8D39\u7528\u4E0A\u9650</label><input class="form-input" id="costMax" name="costMax" type="number" step="0.01"></div><div class="form-group"><label class="form-label" for="groupName">\u7528\u6237\u7EC4</label><input class="form-input" id="groupName" name="groupName" value="default"></div><div class="form-group"><label><input type="checkbox" id="enabled" name="enabled" value="true" checked> \u542F\u7528</label></div></div><div class="form-actions"><button class="btn btn-primary" type="submit">\u6DFB\u52A0\u89C4\u5219</button></div></form><h3 class="section-title">\u4FEE\u6539\u89C4\u5219</h3><form id="editForm" method="POST" action=""><div class="form-grid"><div class="form-group"><label class="form-label">\u7D22\u5F15</label><input class="form-input" id="editIndex" name="index" type="number" readonly></div><div class="form-group"><label class="form-label">\u7C7B\u578B</label><select class="form-select" id="editType" name="type"><option value="rpm">rpm</option><option value="tpm">tpm</option><option value="cost">cost</option></select></div><div class="form-group"><label class="form-label">\u5468\u671F</label><select class="form-select" id="editPeriod" name="period"><option value="minute">minute</option><option value="hour">hour</option><option value="day">day</option></select></div><div class="form-group"><label class="form-label">\u5468\u671F\u503C</label><input class="form-input" id="editPeriodValue" name="periodValue" type="number"></div><div class="form-group"><label class="form-label">\u4E0A\u9650</label><input class="form-input" id="editMax" name="max" type="number"></div><div class="form-group"><label class="form-label">\u8D39\u7528\u4E0A\u9650</label><input class="form-input" id="editCostMax" name="costMax" type="number" step="0.01"></div><div class="form-group"><label class="form-label">\u7528\u6237\u7EC4</label><input class="form-input" id="editGroupName" name="groupName"></div></div><div class="form-actions"><button class="btn btn-primary" type="submit">\u4FDD\u5B58\u4FEE\u6539</button></div></form></div><script>window.limits=${JSON.stringify(limits).replace(/</g, "\\u003c")};window.handleTypeChange=function(){var t=document.getElementById('type').value;document.getElementById('maxField').style.display=t==='cost'?'none':'block';document.getElementById('costMaxField').style.display=t==='cost'?'block':'none'};window.handlePeriodChange=function(){};window.editLimit=function(i){var l=window.limits[i];document.getElementById('editForm').action='/api/admin/models/${encodeURIComponent(model)}/limits/edit/'+i;document.getElementById('editIndex').value=i;document.getElementById('editType').value=l.type;document.getElementById('editPeriod').value=l.period;document.getElementById('editPeriodValue').value=l.periodValue;document.getElementById('editMax').value=l.max;document.getElementById('editCostMax').value=l.costMax;document.getElementById('editGroupName').value=l.groupName};window.handleTypeChange()<\/script>`);
    return shell({ title: `\u9650\u5236\u89C4\u5219\u7BA1\u7406 - ${model}`, path: "/admin/models", body, version });
  }

  // web/src/views/stats.ts
  function statsPage(s, version = "1.15.0") {
    const pct = s.totalRequests ? s.successfulRequests / s.totalRequests * 100 : 0;
    const cards = [
      ["\u603B\u8BF7\u6C42", formatNumber(s.totalRequests), s.dateRange],
      ["\u6210\u529F\u8BF7\u6C42", formatNumber(s.successfulRequests), `${pct.toFixed(1)}% \u6210\u529F\u7387`],
      ["\u5931\u8D25\u8BF7\u6C42", formatNumber(s.failedRequests), `${(100 - pct).toFixed(1)}% \u5931\u8D25\u7387`],
      ["\u5E73\u5747\u5EF6\u8FDF", formatDuration(s.avgDuration), "\u6240\u6709\u8BF7\u6C42"]
    ].map(([label, value, sub]) => `<div class="ui-panel" style="margin:0;padding:16px 18px"><div class="ui-field-hint">${label}</div><div class="ui-mono" style="font-size:22px;font-weight:800;margin-top:4px">${value}</div><div class="ui-field-hint">${escapeHtml(sub)}</div></div>`).join("");
    const tokens = [["\u8F93\u5165", s.totalInputTokens], ["\u7F13\u5B58\u8F93\u5165", s.totalCachedTokens], ["\u8F93\u51FA", s.totalOutputTokens], ["\u603B\u8BA1", s.totalTokens]].map(([k, v]) => `<div><div class="ui-field-hint">${k}</div><div class="ui-mono" style="font-size:18px;font-weight:700">${formatNumber(v)}</div></div>`).join("");
    const days = Array.isArray(s.dailyHeatmap) ? s.dailyHeatmap : [];
    const maxTokens = Math.max(1, ...days.map((d) => d.totalTokens || 0));
    const levelOf = (t) => t <= 0 ? 0 : t < maxTokens * 0.25 ? 1 : t < maxTokens * 0.5 ? 2 : t < maxTokens * 0.75 ? 3 : 4;
    const colors = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];
    const start = /* @__PURE__ */ new Date(`${days[0]?.date || s.heatmapStart || s.startDate}T00:00:00`);
    const leadBlanks = Number.isFinite(start.getTime()) ? start.getDay() : 0;
    const cells = [];
    for (let i = 0; i < leadBlanks; i++) cells.push({ key: `blank-${i}` });
    days.forEach((d) => cells.push({ key: d.date, date: d.date, requests: d.requests, totalTokens: d.totalTokens }));
    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    const monthLabels = [];
    let lastMonth = "";
    weeks.forEach((week, col) => {
      const first = week.find((c) => c.date);
      if (!first?.date) return;
      const m = first.date.slice(0, 7);
      if (m !== lastMonth) {
        lastMonth = m;
        monthLabels.push({ col, label: `${Number(first.date.slice(5, 7))}\u6708` });
      }
    });
    const totalHeatTokens = days.reduce((sum, d) => sum + (d.totalTokens || 0), 0);
    const rangeText = s.heatmapStart && s.heatmapEnd ? ` \xB7 ${s.heatmapStart} ~ ${s.heatmapEnd}` : "";
    const heatmapHtml = days.length ? `<div class="stats-section-card"><h2 class="stats-section-title">\u{1F5D3}\uFE0F \u6BCF\u65E5 Token \u6D88\u8017</h2><div style="font-size:12px;color:var(--ui-muted);margin-bottom:10px">\u8FC7\u53BB ${days.length} \u5929 \xB7 \u5171 ${formatNumber(totalHeatTokens)} tokens${rangeText}</div><div class="heatmap-scroll"><div class="heatmap-months">${weeks.map((_, col) => {
      const lbl = monthLabels.find((l) => l.col === col);
      return `<span>${lbl ? lbl.label : ""}</span>`;
    }).join("")}</div><div class="heatmap-grid" data-heatmap-grid>${weeks.map((week) => `<div class="heatmap-col">${week.map((c) => c.date ? `<span class="heatmap-cell" data-tip="${escapeHtml(`${c.date} \xB7 ${c.requests || 0} \u6B21\u8BF7\u6C42 \xB7 ${formatNumber(c.totalTokens || 0)} tokens`)}" style="background:${colors[levelOf(c.totalTokens || 0)]}"></span>` : '<span class="heatmap-cell" style="visibility:hidden"></span>').join("")}</div>`).join("")}</div><div class="heatmap-legend"><span>Less</span>${colors.map((c) => `<span class="heatmap-cell" style="background:${c}"></span>`).join("")}<span>More</span><span style="margin-left:8px">\u6DF1\u6D45\u6309\u5F53\u65E5 token \u91CF\u76F8\u5BF9\u6700\u5927\u503C\u5212\u5206</span></div></div></div>` : "";
    const models = Object.entries(s.byModel).map(([m, v]) => `<div class="ui-row" style="padding:8px 0;border-bottom:1px solid var(--ui-line)"><strong>${escapeHtml(m)}</strong><span class="ui-spacer"></span><span class="ui-mono">${formatNumber(v.requests)} \u8BF7\u6C42</span><span class="ui-field-hint">${formatNumber(v.totalTokens)} tokens</span></div>`).join("");
    const detailRows = (s.details || []).map((r) => `<tr><td>${new Date(r.timestamp).toLocaleString()}</td><td>${escapeHtml(r.userName || "-")}</td><td>${escapeHtml(r.customModel)}</td><td>${escapeHtml(r.modelGroup || "\u2014")}</td><td>${r.statusCode}</td><td>${formatDuration(r.durationMs)}</td><td>${r.ttftMs != null ? formatDuration(r.ttftMs) : "\u2014"}</td><td>${r.tps != null ? r.tps.toFixed(1) : "\u2014"}</td><td>${formatNumber(r.completionTokens)}</td></tr>`);
    const filter = `<form method="get" action="/admin/stats" class="ui-row" id="stats-filter-form"><input class="ui-input" style="width:auto" type="date" id="start" name="startDate" value="${s.startDate}"><input class="ui-input" style="width:auto" type="date" id="end" name="endDate" value="${s.endDate}"><input class="ui-input" style="width:150px" name="userName" placeholder="\u7528\u6237" value="${escapeHtml(s.userName || "")}"><input class="ui-input" style="width:180px" name="model" placeholder="\u6A21\u578B" value="${escapeHtml(s.model || "")}"><button class="ui-btn ui-btn-primary">\u67E5\u8BE2</button><button type="button" class="ui-btn" data-days="1">\u4ECA\u5929</button><button type="button" class="ui-btn" data-days="7">7\u5929</button><button type="button" class="ui-btn" data-days="30">30\u5929</button></form>`;
    const body = pageHeader({ eyebrow: "Analytics", title: "\u7EDF\u8BA1 Dashboard", subtitle: `${escapeHtml(s.dateRange)} \xB7 \u5E73\u5747\u5EF6\u8FDF ${formatDuration(s.avgDuration)}` }) + filter + `<div style="height:14px"></div><div class="ui-grid ui-grid-auto">${cards}</div><div style="height:16px"></div>` + panel("Token \u7528\u91CF", "", `<div class="ui-grid ui-grid-auto">${tokens}</div>`) + heatmapHtml + panel("\u6309\u6A21\u578B\u7EDF\u8BA1", "", models || "\u6682\u65E0\u6570\u636E") + ((s.details || []).length ? `<div class="pagination">${panel("\u6700\u8FD1\u8BF7\u6C42", `${s.details.length} \u6761`, table(["\u65F6\u95F4", "\u7528\u6237", "\u6A21\u578B", "\u5206\u7EC4", "\u72B6\u6001", "\u8017\u65F6", "TTFT", "TPS", "\u8F93\u51FA"], detailRows))}</div>` : "");
    const script = `<script>document.querySelectorAll('[data-days]').forEach(function(b){b.addEventListener('click',function(){var d=parseInt(this.getAttribute('data-days'),10);var end=new Date();var start=new Date(end.getTime()-d*86400000);document.getElementById('start').value=start.toISOString().slice(0,10);document.getElementById('end').value=end.toISOString().slice(0,10);document.getElementById('stats-filter-form').submit()})});(function(){var tip=document.createElement('div');tip.className='heatmap-tip';document.body.appendChild(tip);document.querySelectorAll('[data-heatmap-grid] .heatmap-cell[data-tip]').forEach(function(c){c.addEventListener('mouseenter',function(){tip.textContent=c.getAttribute('data-tip')||'';tip.style.display='block'});c.addEventListener('mousemove',function(e){tip.style.left=(e.clientX+12)+'px';tip.style.top=(e.clientY+12)+'px'});c.addEventListener('mouseleave',function(){tip.style.display='none'})})})()<\/script>`;
    return shell({ title: "\u7EDF\u8BA1 Dashboard", path: "/admin/stats", version, body, scripts: script });
  }

  // web/src/views/login.ts
  function loginShell(title, heading, body) {
    return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${uiCSS}
.ui-login-wrap{min-height:100vh;display:grid;place-items:center;padding:24px}
.ui-login-card{width:min(100%,420px);background:#fff;border:1px solid var(--ui-line);border-radius:16px;box-shadow:0 24px 60px rgba(16,24,40,.10);padding:28px}
.ui-login-mark{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;background:var(--ui-accent);color:#fff;font-weight:800;margin-bottom:16px}
.ui-login-title{font-size:22px;margin:0 0 6px}.ui-login-sub{margin:0 0 22px;color:var(--ui-muted);font-size:13px}
</style></head><body><div class="ui-login-wrap"><div class="ui-login-card"><div class="ui-login-mark">L</div><h1 class="ui-login-title">${heading}</h1>${body}</div></div></body></html>`;
  }
  function adminLoginPage(isSetup, error) {
    return loginShell(
      "\u7BA1\u7406\u5458\u767B\u5F55 \xB7 LLM Gateway",
      isSetup ? "\u8BBE\u7F6E\u7BA1\u7406\u5458\u5BC6\u7801" : "\u7BA1\u7406\u5458\u767B\u5F55",
      `<p class="ui-login-sub">${isSetup ? "\u9996\u6B21\u4F7F\u7528\u8BF7\u8BBE\u7F6E\u7BA1\u7406\u5458\u5BC6\u7801" : "\u767B\u5F55\u540E\u7BA1\u7406\u6A21\u578B\u3001\u5BC6\u94A5\u4E0E\u7EDF\u8BA1\u4FE1\u606F\u3002"}</p>` + (error ? `<div class="ui-notice ui-notice-error">${escapeHtml(error)}</div>` : "") + `<form method="POST" action="/api/admin/login"><label class="ui-field"><span class="ui-field-label">\u5BC6\u7801</span><input class="ui-input" type="password" name="password" placeholder="\u8BF7\u8F93\u5165\u5BC6\u7801" required></label><button class="ui-btn ui-btn-primary" style="width:100%">${isSetup ? "\u8BBE\u7F6E\u5BC6\u7801" : "\u767B\u5F55"}</button></form>`
    );
  }
  function userLoginPage(error) {
    return loginShell(
      "\u7528\u6237\u767B\u5F55 \xB7 LLM Gateway",
      "\u7528\u6237\u767B\u5F55",
      `<p class="ui-login-sub">\u4F7F\u7528\u7528\u6237 API Key \u67E5\u770B\u53EF\u7528\u6A21\u578B\u4E0E\u7528\u91CF\u3002</p>` + (error ? `<div class="ui-notice ui-notice-error">${escapeHtml(error)}</div>` : "") + `<form method="POST" action="/api/user/login"><label class="ui-field"><span class="ui-field-label">API Key</span><input class="ui-input" type="password" name="apikey" placeholder="\u8BF7\u8F93\u5165 API Key" required></label><button class="ui-btn ui-btn-primary" style="width:100%">\u767B\u5F55</button></form>`
    );
  }

  // web/src/views/userHome.ts
  function userHomePage(p) {
    const cfg = JSON.stringify({ openai: { baseURL: location.origin + "/v1", apiKey: "sk-your-api-key" } }, null, 2);
    const copy = (id3) => `<button class="ui-btn ui-btn-sm copy-btn" data-copy="${id3}">\u590D\u5236</button>`;
    const body = `<div class="ui-page-head"><div><div class="ui-eyebrow">Getting started</div><h1 class="ui-title">\u{1F680} LLM Gateway</h1><p class="ui-subtitle">\u7EDF\u4E00\u7684\u5927\u6A21\u578B API \u7F51\u5173\uFF0C\u517C\u5BB9 OpenAI / Anthropic / Responses \u683C\u5F0F</p></div>${p.userName ? `<div class="ui-row">\u6B22\u8FCE\uFF0C${escapeHtml(p.userName)}</div>` : ""}</div>
${p.announcement ? `<div class="ui-notice ui-notice-info">${p.announcement}</div>` : ""}
<div class="ui-grid ui-grid-2">
  ${panel("JSON \u914D\u7F6E", "\u590D\u5236\u5230\u4F60\u7684 OpenAI \u517C\u5BB9\u5BA2\u6237\u7AEF", `<pre class="ui-input ui-mono" id="json-config" style="white-space:pre-wrap;min-height:160px">${escapeHtml(cfg)}</pre><div style="height:10px"></div>${copy("json-config")}`)}
  ${panel("Base URL", "\u7F51\u5173\u5730\u5740", `<div class="ui-mono" id="base-url">${location.origin}/v1</div><div style="height:10px"></div>${copy("base-url")}`)}
</div>
${panel("\u53EF\u7528\u6A21\u578B", `${p.models.length} \u4E2A\u6A21\u578B / ${p.modelGroups.length} \u4E2A\u6A21\u578B\u7EC4`, `<div class="ui-mono" id="model-value">${escapeHtml((p.modelGroups.length ? p.modelGroups : p.models)[0] || "")}</div><div style="height:10px"></div>${copy("model-value")}<div class="ui-row" style="margin-top:14px">${(p.modelGroups.length ? p.modelGroups : p.models).map((m) => `<span class="ui-badge">${escapeHtml(m)}</span>`).join("")}</div>`)}
<script>document.querySelectorAll('.copy-btn').forEach(function(b){b.addEventListener('click',function(){var el=document.getElementById(this.getAttribute('data-copy'));if(el&&navigator.clipboard)navigator.clipboard.writeText(el.textContent||'');this.textContent='\u5DF2\u590D\u5236';var btn=this;setTimeout(function(){btn.textContent='\u590D\u5236'},1500)})})<\/script>`;
    return shell({ title: "LLM Gateway", path: "/user/main", nav: userNav, body, width: 980 });
  }

  // web/src/views/userStats.ts
  function userStatsPage(s) {
    const pct = s.totalRequests ? s.successfulRequests / s.totalRequests * 100 : 0;
    const filter = `<form method="get" action="/user/stats" class="ui-row"><input class="ui-input" style="width:auto" type="date" name="startDate" value="${s.start}"><input class="ui-input" style="width:auto" type="date" name="endDate" value="${s.end}"><button class="ui-btn ui-btn-primary">\u67E5\u8BE2</button></form>`;
    if (!s.totalRequests) {
      return shell({
        title: "\u4F7F\u7528\u7EDF\u8BA1",
        path: "/user/stats",
        nav: userNav,
        width: 980,
        body: pageHeader({ eyebrow: "Analytics", title: `\u4F7F\u7528\u7EDF\u8BA1 \u2014 ${escapeHtml(s.userName)}`, subtitle: "\u67E5\u770B API \u4F7F\u7528\u60C5\u51B5\u4E0E\u7EDF\u8BA1\u6570\u636E" }) + filter + '<div style="height:16px"></div>' + panel("\u7EDF\u8BA1\u7ED3\u679C", "", empty("\u6682\u65E0\u7EDF\u8BA1\u6570\u636E", "\u53D1\u8D77\u4E00\u6B21\u8BF7\u6C42\u540E\u5373\u53EF\u770B\u5230\u7528\u91CF\u3002"))
      });
    }
    const cards = [["\u603B\u8BF7\u6C42", formatNumber(s.totalRequests)], ["\u6210\u529F\u7387", `${pct.toFixed(1)}%`], ["\u603B Token", formatNumber(s.totalTokens)], ["\u5E73\u5747\u5EF6\u8FDF", formatDuration(s.avgDuration)]].map(([k, v]) => `<div class="ui-panel" style="margin:0;padding:16px 18px"><div class="ui-field-hint">${k}</div><div class="ui-mono" style="font-size:22px;font-weight:800;margin-top:4px">${v}</div></div>`).join("");
    const rows = Object.entries(s.byModel).map(([m, v]) => `<tr><td>${escapeHtml(m)}</td><td>${v.requests}</td><td>${formatNumber(v.totalTokens)}</td></tr>`);
    const body = pageHeader({ eyebrow: "Analytics", title: `\u4F7F\u7528\u7EDF\u8BA1 \u2014 ${escapeHtml(s.userName)}`, subtitle: `${s.start} \u81F3 ${s.end}` }) + filter + '<div style="height:14px"></div><div class="ui-grid ui-grid-auto">' + cards + '</div><div style="height:16px"></div>' + panel("Token \u7528\u91CF\u660E\u7EC6", "", table(["\u6A21\u578B", "\u8BF7\u6C42\u6570", "Token"], rows));
    return shell({ title: "\u4F7F\u7528\u7EDF\u8BA1", path: "/user/stats", nav: userNav, width: 980, body });
  }

  // web/src/views/groupForm.ts
  function groupFormPage(group, models, error, success, version = "1.15.0") {
    const isEdit = !!group?.name;
    const title = isEdit ? `\u7F16\u8F91 Model Group - ${group.name}` : "\u65B0\u589E Model Group";
    const selected = Array.isArray(group?.models) ? group.models : [];
    const modelOptions = models.map((m) => typeof m === "string" ? { customModel: m } : m);
    const body = pageHeader({ eyebrow: "MODEL GROUP", title, subtitle: "\u6A21\u578B\u7EC4\u53EF\u4F5C\u4E3A API model \u4F7F\u7528\uFF0C\u6309\u987A\u5E8F\u9009\u62E9\u591A\u4E2A\u6A21\u578B\u5B9E\u73B0 fallback", actions: '<a class="ui-btn" href="/admin/model-groups">\u8FD4\u56DE\u6A21\u578B\u7EC4</a>' }) + (error ? notice(error, "error") : "") + (success ? notice(success, "success") : "") + panel("", "", `<div class="form-card"><form method="POST" action="${isEdit ? `/admin/model-groups/edit/${encodeURIComponent(group.name)}` : "/admin/model-groups/add"}"><input type="hidden" name="originalName" value="${escapeHtml(group?.name || "")}"><div class="form-group"><label class="form-label" for="name">\u7EC4\u540D</label><input class="form-input" id="name" name="name" value="${escapeHtml(group?.name || "")}" placeholder="\u4F8B\u5982\uFF1Amy-group" required></div><div class="form-group"><label class="form-label" for="desc">\u63CF\u8FF0</label><input class="form-input" id="desc" name="desc" value="${escapeHtml(group?.desc || "")}" placeholder="\u53EF\u9009"></div><div class="form-group"><label class="form-label" for="new-model-filter">\u7B5B\u9009\u6A21\u578B</label><input class="form-input" id="new-model-filter" placeholder="\u8F93\u5165\u6A21\u578B\u540D\u8FC7\u6EE4" oninput="filterModels()"></div><div class="model-selector"><div><h3 class="model-list-title">\u53EF\u7528\u6A21\u578B</h3><div class="model-list" id="all-models">${modelOptions.map((m) => `<label class="model-item" data-name="${escapeHtml(m.customModel)}"><input type="checkbox" name="modelCheckbox" value="${escapeHtml(m.customModel)}" onchange="sync()"> <span class="model-item-name">${escapeHtml(m.customModel)}</span><span class="model-item-desc">${escapeHtml(m.desc || "")}</span></label>`).join("")}</div></div><div><h3 class="model-list-title">\u5DF2\u9009\u6A21\u578B\uFF08\u6309\u987A\u5E8F\uFF09</h3><div class="model-list" id="selected-models"></div>${isEdit ? `<div class="model-actions"><a class="btn btn-small" href="/admin/model-groups/edit/${encodeURIComponent(group.name)}/remove-model?model=${encodeURIComponent(selected[0] || "")}">\u79FB\u9664\u9996\u4E2A\u6A21\u578B</a></div>` : ""}</div></div><input name="models" type="hidden" value='${JSON.stringify(selected)}'><div class="form-actions"><button class="btn btn-primary" type="submit">\u4FDD\u5B58\u6A21\u578B\u7EC4</button><a class="btn btn-secondary" href="/admin/model-groups">\u53D6\u6D88</a></div></form></div><script>window.groupModels=${JSON.stringify(selected).replace(/</g, "\\u003c")};window.sync=function(){var selected=Array.prototype.slice.call(document.querySelectorAll('input[name="modelCheckbox"]')).filter(function(i){return i.checked}).map(function(i){return i.value});document.querySelector('input[name="models"]').value=JSON.stringify(selected);window.groupModels=selected;renderSelected()};window.renderSelected=function(){var box=document.getElementById('selected-models');if(!box)return;box.innerHTML=window.groupModels.map(function(n,i){return '<div class="model-item"><span class="selected-index">'+(i+1)+'</span><span class="model-item-name">'+n+'</span><button type="button" class="btn btn-small btn-danger" onclick="removeModel('+i+')">\u79FB\u9664</button></div>'}).join('')||'<p class="model-list-empty">\u5C1A\u672A\u9009\u62E9\u6A21\u578B</p>'};window.removeModel=function(i){window.groupModels.splice(i,1);Array.prototype.slice.call(document.querySelectorAll('input[name="modelCheckbox"]')).forEach(function(c){c.checked=window.groupModels.indexOf(c.value)!==-1});window.sync()};window.filterModels=function(){var q=(document.getElementById('new-model-filter').value||'').toLowerCase();Array.prototype.slice.call(document.querySelectorAll('#all-models .model-item')).forEach(function(el){el.style.display=el.dataset.name.toLowerCase().indexOf(q)!==-1?'':'none'})};window.renderSelected()<\/script>`);
    return shell({ title, path: "/admin/model-groups", body, version });
  }

  // web/src/views/userForm.ts
  function userFormPage(user, allModels, error, success, version = "1.15.0") {
    const isEdit = !!user?.name;
    const title = isEdit ? "\u7F16\u8F91\u7528\u6237" : "\u65B0\u589E\u7528\u6237";
    const groups = Array.isArray(user?.allowedModels) ? user.allowedModels : Array.isArray(user?.groups) ? user.groups : [];
    const modelOptions = allModels.map((g) => typeof g === "string" ? { name: g, desc: "" } : g);
    const body = pageHeader({ eyebrow: "USER", title, subtitle: isEdit ? `\u7528\u6237\uFF1A${user?.name || ""}` : "\u521B\u5EFA\u7528\u6237\u5E76\u5206\u914D\u7528\u6237\u7EC4", actions: '<a class="ui-btn" href="/admin/users">\u8FD4\u56DE\u7528\u6237\u5217\u8868</a>' }) + (error ? notice(error, "error") : "") + (success ? notice(success, "success") : "") + panel("", "", `<div class="form-card"><form method="POST" action="${isEdit ? `/admin/users/edit/${encodeURIComponent(user.name)}` : "/admin/users/add"}"><div class="form-group"><label class="form-label" for="name">\u7528\u6237\u540D</label><input class="form-input" id="name" name="name" value="${escapeHtml(user?.name || "")}" ${isEdit ? "readonly" : ""}></div><div class="form-group"><label class="form-label" for="description">\u63CF\u8FF0</label><input class="form-input" id="description" name="description" value="${escapeHtml(user?.description || "")}"></div><div class="form-group"><label class="form-label" for="apiKey">API Key</label><input class="form-input" id="apiKey" name="apiKey" value="${escapeHtml(user?.apikey || user?.apiKey || "")}" placeholder="\u7559\u7A7A\u81EA\u52A8\u751F\u6210"></div><div class="form-group"><label class="form-label">\u6A21\u578B\u6743\u9650</label><div class="checkbox-list">${modelOptions.map((g) => `<label class="checkbox-item"><input type="checkbox" name="allowedModels" value="${escapeHtml(g.name)}" ${groups.includes(g.name) ? "checked" : ""}> ${escapeHtml(g.name)} <span class="model-item-desc">${escapeHtml(g.desc || "")}</span></label>`).join("")}<span class="form-hint">\u4E0D\u9009\u62E9\u4EFB\u4F55\u6A21\u578B\u8868\u793A\u4E0D\u9650\u5236</span></div></div><div class="form-actions"><button class="btn btn-primary" type="submit">\u4FDD\u5B58\u7528\u6237</button><a class="btn btn-secondary" href="/admin/users">\u53D6\u6D88</a></div></form></div>`);
    return shell({ title, path: "/admin/users", body, version });
  }

  // web/src/admin.ts
  var q = (name) => new URLSearchParams(location.search).get(name) || "";
  var today = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  var renderers = {
    "/": () => {
      location.replace("/admin/models");
      return "";
    },
    "/admin/models": async () => modelsPage((await api("/api/admin/models")).data || []),
    "/admin/model-groups": async () => groupsPage((await api("/api/admin/model-groups")).data || []),
    "/admin/users": async () => usersPage((await api("/api/admin/users")).data || []),
    "/admin/api-keys": async () => apiKeysPage((await api("/api/admin/api-keys")).data || []),
    "/admin/password": () => passwordPage(true),
    "/admin/privacy": async () => privacyPage((await api("/api/admin/privacy")).data?.settings || { enabled: false, stripUserField: false, sanitizeFilePaths: false, whitelistFilter: false, pathPlaceholder: "USER" }),
    "/admin/announcement": async () => announcementPage((await api("/api/admin/announcement")).data?.content || ""),
    "/admin/models/new": async () => modelFormPage(void 0, (await api("/api/admin/api-keys")).data || []),
    "/admin/model-groups/new": async () => groupFormPage(void 0, (await api("/api/admin/models")).data || []),
    "/admin/users/new": async () => userFormPage(void 0, (await api("/api/admin/models")).data || []),
    "/admin/stats": async () => {
      const d = (await api("/api/admin/stats" + location.search)).data || {};
      return statsPage({
        startDate: q("startDate") || today(),
        endDate: q("endDate") || q("startDate") || today(),
        dateRange: d.dateRange || "",
        userName: q("userName"),
        model: q("model"),
        totalRequests: d.totalRequests || 0,
        successfulRequests: d.successfulRequests || 0,
        failedRequests: d.failedRequests || 0,
        totalInputTokens: d.totalInputTokens || 0,
        totalOutputTokens: d.totalOutputTokens || 0,
        totalTokens: d.totalTokens || 0,
        totalCachedTokens: d.totalCachedTokens || 0,
        avgDuration: d.avgDuration || 0,
        byModel: d.byModel || {},
        byDate: d.byDate || {},
        byHour: d.byHour || {},
        dailyHeatmap: d.dailyHeatmap || [],
        heatmapStart: d.heatmapStart || "",
        heatmapEnd: d.heatmapEnd || "",
        page: d.page,
        totalPages: d.totalPages,
        details: d.details || []
      });
    },
    "/admin/login": async () => adminLoginPage(!(await api("/api/admin/auth-status")).data?.passwordConfigured),
    "/user/login": () => userLoginPage(),
    "/user/main": async () => {
      const d = (await api("/api/user/config")).data || {};
      return userHomePage({ models: (d.models || []).map((m) => m.customModel), modelGroups: (d.modelGroups || []).map((g) => g.name), announcement: d.announcement, userName: q("userName") });
    },
    "/user/stats": async () => {
      const d = (await api("/api/user/stats" + location.search)).data || {};
      return userStatsPage({ userName: q("userName") || "User", start: q("startDate") || today(), end: q("endDate") || today(), totalRequests: d.total || 0, successfulRequests: d.successful || 0, totalTokens: d.totalTokens || 0, avgDuration: d.avgDuration || 0, byModel: d.byModel || {}, byDate: d.byDate || {} });
    }
  };
  async function renderAdmin(ctx) {
    let path = ctx.path;
    let m;
    if (m = path.match(/^\/admin\/models\/edit\/(.+)$/)) {
      const models = (await api("/api/admin/models")).data || [];
      const model = models.find((x) => x.customModel === decodeURIComponent(m[1]));
      const keys = (await api("/api/admin/api-keys")).data || [];
      const ref2 = model?.apiKey?.startsWith("$$") && model.apiKey.endsWith("$$") ? model.apiKey.slice(2, -2) : "";
      return modelFormPage(model, keys, void 0, "1.15.0", ref2);
    }
    if (m = path.match(/^\/admin\/models\/([^/]+)\/limits$/)) return modelLimitsPage(decodeURIComponent(m[1]), (await api(`/api/admin/models/${m[1]}/limits`)).data || []);
    if (m = path.match(/^\/admin\/model-groups\/edit\/(.+)$/)) {
      const groups = (await api("/api/admin/model-groups")).data || [];
      const g = groups.find((x) => x.name === decodeURIComponent(m[1]));
      return groupFormPage(g, (await api("/api/admin/models")).data || []);
    }
    if (m = path.match(/^\/admin\/users\/edit\/(.+)$/)) {
      const users = (await api("/api/admin/users")).data || [];
      const u = users.find((x) => x.name === decodeURIComponent(m[1]));
      const models = (await api("/api/admin/models")).data || [];
      return userFormPage(u, models.map((x) => x.customModel));
    }
    if (m = path.match(/^\/admin\/api-keys\/edit\/(.+)$/)) {
      const all = (await api("/api/admin/api-keys")).data || [];
      const k = all.find((x) => x.id === decodeURIComponent(m[1]));
      if (!k) return apiKeysPage(all, "\u672A\u627E\u5230\u8BE5 API Key");
      return apiKeysPage(all, void 0, void 0, "1.15.0", { id: k.id, name: k.name, keyHint: k.keyHint || "*****" });
    }
    const fn = renderers[path];
    if (!fn) return modelsPage([], `Page not implemented: ${path}`, ctx.version);
    try {
      return await fn(ctx);
    } catch (e) {
      return modelsPage([], e.message, ctx.version);
    }
  }
  function bootstrap() {
    const root = document.getElementById("app");
    if (!root) return;
    renderAdmin({ path: location.pathname, version: "1.15.0" }).then((html2) => {
      document.open();
      document.write(html2);
      document.close();
    });
  }
  function startWhenReady(doc, start) {
    if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", start, { once: true });
    else start();
  }
  if (typeof document !== "undefined") startWhenReady(document, bootstrap);
})();
