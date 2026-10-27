import type { ComponentPrefix, TokenOptions, TokenVariants } from "nice-styles"

/** Turns a union of object types into their intersection. */
type UnionToIntersection<U> = (U extends unknown ? (union: U) => void : never) extends (
  intersection: infer I
) => void
  ? I
  : never

/** A component key's groups, addressed under that component: `{ button: { size } }` → `"button.size"`. */
type ComponentGroups<M> = {
  [C in keyof M & ComponentPrefix]: {
    [G in keyof M[C] & string as `${C}.${G}`]: keyof M[C][G] & string
  }
}[keyof M & ComponentPrefix]

/** Every other key is a group, under the call's prefix when one is given; `breakpoints` registers none. */
type FlatGroups<M, P extends string> = {
  [G in Exclude<keyof M, "breakpoints" | ComponentPrefix> & string as [P] extends [never]
    ? G
    : `${P}.${G}`]: keyof M[G] & string
}

/** Variants a `setTokens` map registers, keyed by address group — mirrors how `generateTokenCSS` registers it. */
type MapVariants<M, P extends string> = FlatGroups<M, P> & UnionToIntersection<ComponentGroups<M>>

/**
 * The core variants plus a map's, merged per group: a map can add groups and add variants
 * to existing groups (`brandColor: { mint }`).
 */
export type SetTokensVariants<M, P extends string> = {
  [G in keyof TokenVariants | keyof MapVariants<M, P>]:
    | (G extends keyof TokenVariants ? TokenVariants[G] : never)
    | (G extends keyof MapVariants<M, P> ? MapVariants<M, P>[G] : never)
}

/** Every `group:variant` address of a variant map, plus the bare group where it has a base variant. */
type TypedTokenAddress<V> = {
  [G in keyof V & string]: `${G}:${V[G] & string}` | ("base" extends V[G] ? G : never)
}[keyof V & string]

/**
 * `getToken`, typed for the core tokens plus the tokens a `setTokens` map registered. Same
 * function at runtime; only the accepted names and variants differ.
 */
export interface TypedGetToken<V> {
  (address: TypedTokenAddress<V>, options?: TokenOptions): string
  <G extends keyof V & string>(
    name: G,
    ...args: "base" extends V[G]
      ? [variant?: V[G], options?: TokenOptions]
      : [variant: V[G], options?: TokenOptions]
  ): string
}
