declare module 'edmonds-blossom' {
  export default function blossom(
    edges: [number, number, number][],
    maxcardinality?: boolean
  ): number[];
}
