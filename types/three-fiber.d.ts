/// <reference types="@react-three/fiber" />

/**
 * Augment React's JSX namespace so that React Three Fiber's
 * intrinsic elements (mesh, group, boxGeometry, etc.) are
 * recognised by TypeScript under the react-jsx transform.
 */
import type { ThreeElements } from "@react-three/fiber";

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
