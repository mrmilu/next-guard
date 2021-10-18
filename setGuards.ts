import RouterSingleton from "next/router";

/** A function that takes the current route and spits out the route
 * it should redirect to (or null if the redirection should not occur).
 */
export type GuardFunction = (route?: string) => string;

export interface Guard {
  routes: RegExp | Array<RegExp>;
  redirect: string | GuardFunction;
}

function isValidRoute(route: string, matcher: Guard["routes"]): boolean {
  const isArray = Array.isArray(matcher);
  if (isArray && matcher.some((r) => r.test(route))) {
    return true;
  }
  if (!isArray && matcher.test(route)) {
    return true;
  }
  return false;
}

/**
 * Receives a series of guard rules which will be applied every time a route changes.
 * @example setGuards([{routes: /profile/, redirect: () => isMobile ? '/desktop-required' : null}])
 */
export default function setGuards(guards: Array<Guard>): void {
  const handler = () => {
    const { route } = RouterSingleton;
    for (const guard of guards) {
      if (!isValidRoute(route, guard.routes)) {
        continue;
      }

      let redirectRoute: string = null;
      if (typeof guard.redirect === "string") {
        redirectRoute = guard.redirect;
      } else {
        redirectRoute = guard.redirect(route);
      }

      if (redirectRoute !== null) {
        void RouterSingleton.push(redirectRoute);
        break;
      }
    }
  };
  RouterSingleton.events.on("routeChangeStart", handler);
}
