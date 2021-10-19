# next-guard

Handle route guards and redirection with ease in your Next.js app. `next-guard` lets you manage all your redirections from a single file.

## Example usage

The package contains a single function that receives an array of redirection rules or `Guard`s.
This function should be called once, when the website loads for the first time.

```javascript
import setGuards from "next-guard";

// Place this function in the componentDidMount() method of the component in _app.js
setGuards([
  {
    routes: [/rewards/, /zyzz/],
    middleware: () => "/work-in-progress",
  },
  {
    routes: /mobile/,
    middleware: () => isMobile && "/desktop-required",
  },
  {
    routes: [/profile/, /followers/],
    middleware: () => isNotLoggedIn, // block the route change if user is not logged in
  },
  {
    routes: [/.+/],
    middleware: (nextRoute, prevRoute) => {
      console.log({ nextRoute, prevRoute });
    },
  },
]);
```

Each `Guard` is an object with 4 parameters:

- `routes`: either a regular expression or an array of regular expressions. If any of the `routes` matches the regular expression, the `middleware` will be called
- `middleware`: a function that takes two arguments

  - `nextRoute`: The route after it changes
  - `prevRoute`: The route before it was changed

  The `middleware` function can return:

  - A `string` of the route it should redirect to
  - `true` if you want to block the route change but not redirect it.
  - `false` or a falsy value if you want to do nothing.

- `runImmediately?`: If set to `true`, the middleware will run as soon as the page loads for the first time and `setGuards` is called. Defaults to `true`.
- `id?`: An identifier of the middleware. Very useful for debugging.

If a `Guard` is effective (and that means that the route matches and the redirect function returns `true` or a `string`), then the `Guard`s below will not run.

## Config

The `setGuards` function takes a second optional argument. It is an object of type `GuardsConfig`. It has the following parameters:

- `debug`: if set to `true`, it will print useful debug info to the console every time the current route changes.

## Troubleshooting

If you are inside a class component, it is recommended that you bind the middleware functions to `this`.