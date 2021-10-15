# next-guard

## Example usage

`routes` is an optional param. If not supplied, the `redirect` function will be executed always.

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
