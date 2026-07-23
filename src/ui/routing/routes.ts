/**
 * RoutePaths — the single source of truth for route URLs. Mirrors the Flutter
 * `RoutePaths`. Collected here so screens and the nav grid reference the same
 * constants instead of string literals.
 */
export const RoutePaths = {
  home: '/',
  about: '/about',
  reactFundamentals: '/react-fundamentals',
  tsJsFundamentals: '/typescript-javascript-fundamentals',
  ui: '/ui',
  layoutStructure: '/ui/layout',
  css: '/ui/styling/css',
  bootstrap: '/ui/styling/bootstrap',
  tailwind: '/ui/styling/tailwind',
  interactive: '/ui/interactive',
  responsive: '/ui/responsive',
  designSystem: '/ui/design-system',
  lifecycle: '/lifecycle',
  navigation: '/navigation-routing',
  stateManagement: '/state-management',
  hooks: '/state-management/hooks',
  redux: '/state-management/redux',
  zustand: '/state-management/zustand',
  tanstackQuery: '/state-management/tanstack-query',
  apiHandling: '/api-handling',
  databaseHandling: '/database-handling',
  exceptionHandling: '/exception-handling',
  dependencyManagement: '/dependency-management',
  architecture: '/architecture',
  testing: '/testing',
  debugging: '/debugging',
  environments: '/environments',
  bestPractices: '/best-practices',
  pageNotFound: '*',
} as const;

export type RoutePath = (typeof RoutePaths)[keyof typeof RoutePaths];
