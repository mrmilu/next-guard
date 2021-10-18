# next-guard

Handle route guards and redirection with ease in your Next.js app. `next-guard` lets you manage all your redirections from a single file.

## Example usage

The package contains a single function that receives an array of redirection rules or `Guard`s.
This function should be called once, when the website loads for the first time.

```javascript
import setGuards from 'next-guard'

// Place this function in the componentDidMount() method of the component in _app.js
setGuards([
  {
    routes: /profile/,
    redirect: () => (isMobile ? "/desktop-required" : null),
  },
  {
    routes: [/profile/, /followers/],
    redirect: () => (isNotLoggedIn ? "/login" : null),
  },
  {
    routes: [/rewards/, /zyzz/]
    redirect: '/work-in-progress'
  }
]);
```

If a `Guard` is effective (and that means that the route matches and the redirect function does not return `null`), then the `Guard`s below will not run. If you want to execute many `Guard`s simultaneously, you can do so by calling `setGuards` several times. However, this might lead to unpredictable behaviour.

```javascript
import setGuards from "next-guard";

// Place this function in the componentDidMount() method of the component in _app.js
setGuards([
  {
    routes: /profile/,
    redirect: () => (isMobile ? "/desktop-required" : null),
  },
]);
setGuards([
  {
    routes: [/profile/, /followers/],
    redirect: () => (isNotLoggedIn ? "/login" : null),
  },
]);
```
