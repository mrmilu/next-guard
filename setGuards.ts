import RouterSingleton from "next/router";

/**
 * A function that takes the next and previous route and spits out the route
 * it should redirect to (or null if the redirection should not occur).
 * @param nextRoute The route the user is going to visit
 * @param currentRoute The route the user is currently visiting
 */
export type GuardFunction = (
  nextRoute?: string,
  currentRoute?: string
) => string;

export interface Guard {
  routes: RegExp | Array<RegExp>;
  redirect: string | GuardFunction;
}

function isValidRoute(route: string, matcher: Guard["routes"]): boolean {
  const isArray = Array.isArray(matcher);
  if (isArray && matcher.some((r) => r.test(route))) {
    return true;
  }
  return !isArray && matcher.test(route);
}

/**
 * Receives a series of guard rules which will be applied every time a route changes.
 * @example setGuards([{routes: /profile/, redirect: () => isMobile ? '/desktop-required' : null}])
 */
export default function setGuards(guards: Array<Guard>): void {
  const handler = (nextRoute: string) => {
    const { route: currentRoute } = RouterSingleton;
    for (const guard of guards) {
      if (!isValidRoute(nextRoute, guard.routes)) {
        continue;
      }

      let redirectRoute: string = null;
      if (typeof guard.redirect === "string") {
        redirectRoute = guard.redirect;
      } else {
        redirectRoute = guard.redirect(nextRoute, currentRoute);
      }

      if (redirectRoute !== null) {
        void RouterSingleton.push(redirectRoute);
        break;
      }
    }
  };
  RouterSingleton.events.on("routeChangeStart", handler);
  handler(RouterSingleton.route);
}
