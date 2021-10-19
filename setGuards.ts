import RouterSingleton from "next/router";

export interface GuardsConfig {
  debug: boolean;
}

/**
 * Whether or not the route guard should redirect.
 * `true` -> Block route change
 * `string` -> The route it should redirect to.
 * `false` or `void` -> do nothing
 */
export type Redirect = string | boolean | void;
/**
 * A function that takes the next and previous route and spits out the route
 * it should redirect to, false if the route should be canceled, (or null if the redirection should not occur).
 * @param nextRoute The route the user is going to visit
 * @param currentRoute The route the user is currently visiting
 */
export type GuardMiddleware = (
  nextRoute?: string,
  currentRoute?: string
) => Redirect;

export interface Guard {
  routes: RegExp | Array<RegExp>;
  middleware: GuardMiddleware;
  /** Whether the guard should run as soon as `setGuards` runs. Defaults to `true` */
  runImmediately?: boolean;
  /** Used to identify guard when debugging */
  id?: string;
}

function isValidRoute(route: string, matcher: Guard["routes"]): boolean {
  const isArray = Array.isArray(matcher);
  if (isArray && matcher.some((r) => r.test(route))) {
    return true;
  }
  return !isArray && matcher.test(route);
}

function handleError({ r }: { r: boolean | string }) {
  if (typeof r === "boolean") {
    return;
  }
  void RouterSingleton.router.push(r);
}

/**
 * Receives a series of guard rules which will be applied every time a route changes.
 * @example setGuards([{routes: /profile/, redirect: () => isMobile ? '/desktop-required' : null}])
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
export default function setGuards(
  guards: Array<Guard>,
  config?: GuardsConfig
): void {
  const isDebug = config?.debug ?? false;

  const handler = (nextRoute: string, { firstRun } = { firstRun: false }) => {
    const { route: currentRoute } = RouterSingleton;
    for (const guard of guards) {
      if (
        !isValidRoute(nextRoute, guard.routes) ||
        (firstRun && !(guard.runImmediately ?? true))
      ) {
        continue;
      }

      const r = guard.middleware(nextRoute, currentRoute);

      if (r) {
        const message = "Route cancelled";
        if (isDebug) {
          // eslint-disable-next-line no-console
          console.log({
            nextRoute,
            prevRoute: currentRoute,
            message:
              typeof r === "string"
                ? `Route change has been redirected to ${r}.`
                : "Route change has been blocked.",
            guardId: guard.id,
          });
        }
        RouterSingleton.events.emit("routeChangeError", { message, r });
        throw message;
      }
    }
    if (isDebug) {
      // eslint-disable-next-line no-console
      console.log({
        nextRoute,
        prevRoute: currentRoute,
        message: "Route change successful.",
      });
    }
  };

  RouterSingleton.events.on("beforeHistoryChange", handler);
  RouterSingleton.events.on("routeChangeError", handleError);

  try {
    handler(RouterSingleton.route, { firstRun: true });
  } catch {
    return;
  }
}
