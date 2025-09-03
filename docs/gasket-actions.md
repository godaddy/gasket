# Gasket Actions

Gasket Actions provide a pattern for accessing and setting data on demand in Gasket applications.

This pattern, introduced in Gasket's v7 release, provides a more flexible and reliable method for accessing and setting data in a Gasket application, reducing the need to rely on decorating `req`/`res` objects and middleware.

For more details on why we are moving away from relying on `req`/`res` objects, please refer to the [v7 upgrade guide].

## Authoring Actions

Actions are registered through the `actions` property on a Gasket plugin.

```diff
import myActions from './my-actions';

export default {
    name: 'my-plugin',
+   actions: myActions,
    hooks: {
        // gasket hooks
    }
};
```

The `actions` property expects to receive an object where each key is expected to be a function that will be registered as a particular action.

Action names must be unique across the entire Gasket application. If multiple actions share the same name, even if defined in different plugins, an error will occur.

The first argument of an action is always the `gasket` instance.
This will be injected by Gasket when the action is called. Subsequent arguments can be defined as needed.

Actions can be synchronous or asynchronous and can take a variable number of arguments.

```js
const myActions = {
  myFirstAction(gasket) {
    // do something
  },
  async anAsyncAction(gasket) {
    // do something async
  },
  anActionWithArguments(gasket, arg1, arg2) {
    // do something with the arguments
  }
};

const plugin = {
  name: 'plugin-with-actions',
  actions: myActions
};

export default plugin;
```

## Invoking Actions

Once registered, actions can be called within the application code and can be used in other gasket plugins.
It is unnecessary to pass the `gasket` instance when invoking an action as Gasket will handle this automatically.

Actions are accessible on the `gasket` instance through the `actions` property. This is the same instance that is provided in gasket hooks and gasket lifecycles.

```js
export default {
  name: 'gasket-plugin-example',
  hooks: {
    hookExample(gasket) {
      gasket.actions.myFirstAction();
    },
  }
};
```

If you are calling actions outside of a gasket hook or lifecycle, the `gasket` instance, defined in your `gasket.js` file, can be imported into your application code and used to call actions.

```js
import gasket from './gasket';

gasket.actions.myFirstAction();
```

Every action has access to the `gasket` instance which can be utilized for various purposes such as accessing the `gasket.config`, calling a lifecycle, or even calling other actions.

```js
const actions = {
  logGasketConfig(gasket) {
    console.log('Gasket Config:', gasket.config);
  },
  executeLifecycle(gasket) {
    gasket.exec('myLifecycle');
  },
  callAnotherAction(gasket) {
    gasket.actions.myFirstAction();
  }
}
```

## Usage examples

### Getting a singleton instance

Actions can be used to get a singleton instance that can be accessed throughout the application.

```js
// Action code
let singleton;

const actions = {
  getSingleton() {
    if (!singleton) {
      singleton = {
        doSomething() {
          // do something
        }
      };
    }
    return singleton;
  }
};

// Application code
const singleton = gasket.actions.getSingleton();
singleton.doSomething();
```

### Getting data on demand

Actions can be used to get data on demand. This can be useful when data needs to be fetched only when it is needed.

```js
// Action code
const actions = {
  async getAuth(gasket) {
    // return auth data
  }
};

// Application code
const auth = await gasket.actions.getAuth();
if(auth.isAuthenticated) {
  // do something
} else {
  // do something else
}
```

### Replacing middleware with Actions

Let's say we have an application that has middleware that gets user data, all posts from a user, and all comments from a user.

Each middleware eventually attaches their respective data to the `req` object so other middleware can access this data down the middleware chain.

```js
// UserData middleware
req.userdata = await getUserData();

// Posts middleware
req.posts = await getPosts(req.userdata);

// Comments middleware
req.comments = await getComments(req.userdata);
```

The middleware in this example can be replaced with actions that can be called on demand and in any order because each action can be responsible for its own data.

```js
// getUserData action defined in user-plugin
const reqMap = new WeakMap();

async function getUserData(gasket, req) {
  if(!reqMap.has(req)) {
    const userData = await fetchUserData(req); // fetch user data
    reqMap.set(req, userData); 
  }
  return reqMap.get(req);
}

// getUserPosts action defined in posts-plugin
const reqMap = new WeakMap();

async function getUserPosts(gasket, req) {
  if(!reqMap.has(req)) {
    const userData = await gasket.actions.getUserData(req);
    const posts = await fetchUserPosts(userData); // fetch posts
    reqMap.set(req, posts); 
  }

  return reqMap.get(req);
}

// getUserComments action defined in comments-plugin
const reqMap = new WeakMap();

async function getUserComments(gasket, req) {
  if(!reqMap.has(req)) {
    const userData = await gasket.actions.getUserData(req);
    const comments = await fetchUserComments(userData); // fetch comments
    reqMap.set(req, comments); 
  }

  return reqMap.get(req);
}
```

Each action in the example above is responsible for fetching its respective data and storing it in a `WeakMap`. The data stored in the `WeakMap` will last for the length of the request. If an action is called again during the same request, the data will be retrieved from the `WeakMap` instead of fetching it again.

In our app code, if we want to get the user data, posts, and comments, the `getUserData` action will only need to fetch the user data once as the initial fetch will be cached in a `WeakMap`.

```js
const userData = await gasket.actions.getUserData(req);
const posts = await gasket.actions.getUserPosts(req);
const comments = await gasket.actions.getUserComments(req);
```

Since the fetched user data is stored in a `WeakMap`, it only needs to be fetched once, despite the `getUserData` action being called once in our app code and again in each of the subsequent actions.

Once the request is complete, the data stored in the `WeakMap` will be cleared and will be ready to set data for the next request.

### Improvements over middleware

Instead of serially wiring up `req.userData` for almost every request,
whether it is used or not, we can use `gasket.actions` to wire up details on demand, which can execute additional actions and lifecycles as needed.

Actions can support different arguments, but in these examples, the `req` is required, not to be decorated, but used as a unique lookup key.
It is also much easier to follow the flow of the code when debugging.

By avoiding decorating `req` with properties, we can avoid some of the pitfalls encountered with what Express expects and what Fastify expects, and more easily open the door for other server frameworks to use Gasket.

[v7 upgrade guide]: /docs/upgrade-to-7.md#switch-to-gasketactions
