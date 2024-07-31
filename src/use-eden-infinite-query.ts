import { InfiniteData, UseInfiniteQueryOptions, UseInfiniteQueryResult } from "@tanstack/react-query";

import { MergeObjects } from "./utils";

type IsEmptyObject<T> = keyof T extends never ? true : false;

export type UseEdenInfiniteQuery<TOptions extends { query: any }, TResponse extends { data: any; error: any }, C> = (
    options: MergeObjects<
        IsEmptyObject<Omit<TOptions["query"], "cursor">> extends true
            ? Omit<
                  UseInfiniteQueryOptions<
                      NonNullable<TResponse["data"]>,
                      NonNullable<TResponse["error"]>,
                      unknown,
                      unknown,
                      unknown[],
                      C
                  >,
                  "queryKey" | "queryFn"
              >
            : Omit<
                  UseInfiniteQueryOptions<
                      NonNullable<TResponse["data"]>,
                      NonNullable<TResponse["error"]>,
                      unknown,
                      unknown,
                      unknown[],
                      C
                  >,
                  "queryKey" | "queryFn"
              > & {
                  input: Omit<TOptions["query"], "cursor">;
              }
    >
) => UseInfiniteQueryResult<InfiniteData<NonNullable<TResponse["data"]>>, NonNullable<TResponse["error"]>>;
