import RouterSingleton from "next/router";

/**
 * Whether or not the route guard should redirect.
 * `null` -> Do not redirect.
 * `false` -> Do not redirect, but stop route change.
 * `string` -> The route it should redirect to.
 */
export type Redirect = string | false;
/**
 * A function that takes the next and previous route and spits out the route
 * it should redirect to, false if the route should be canceled, (or null if the redirection should not occur).
 * @param nextRoute The route the user is going to visit
 * @param currentRoute The route the user is currently visiting
 */
export type GuardFunction = (
  nextRoute?: string,
  currentRoute?: string
) => Redirect;

export interface Guard {
  routes: RegExp | Array<RegExp>;
  redirect: Redirect | GuardFunction;
}

function isValidRoute(route: string, matcher: Guard["routes"]): boolean {
  const isArray = Array.isArray(matcher);
  if (isArray && matcher.some((r) => r.test(route))) {
    return true;
  }
  return !isArray && matcher.test(route);
}

function handleError({ r }: { r: Redirect }) {
  if (!r) {
    return;
  }
  void RouterSingleton.router.push(r);
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

      let r: Redirect = null;
      if (
        typeof guard.redirect === "string" ||
        typeof guard.redirect === "boolean"
      ) {
        r = guard.redirect;
      } else {
        r = guard.redirect(nextRoute, currentRoute);
      }

      if (r !== null) {
        const message = "Route cancelled";
        RouterSingleton.events.emit("routeChangeError", { message, r });
        throw message;
      }
    }
  };

  RouterSingleton.events.on("beforeHistoryChange", handler);
  RouterSingleton.events.on("routeChangeError", handleError);

  try {
    handler(RouterSingleton.route);
  } catch {
    return;
  }
}
