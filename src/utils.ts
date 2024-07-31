export type MergeObjects<T> = (T extends any ? (k: T) => void : never) extends (k: infer I) => void
    ? { [K in keyof I]: I[K] }
    : never;
