# next-guard

## Example usage

The package contains a single function that receives an array of redirection rules.
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

`routes` is an optional param. If not supplied, the redirect rule will be executed always.

If a redirect rule is effective (and that means that the route must match and the redirect function must not return `null`), then the routes below will not run. If you want to execute many rules simultaneously, you can do so by calling setGuards several times. However, this might lead to unpredictable behaviour.

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
