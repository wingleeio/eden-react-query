import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";

import { MergeObjects } from "./utils";

type UseQueryOptionsWithoutKey = Omit<UseQueryOptions, "queryKey">;
type UseQueryResultWithoutDataAndError<T> = Omit<UseQueryResult<T>, "data" | "error">;

type EdenQueryResult<TResponse> = TResponse extends null
    ? null
    : TResponse extends {
            data: infer TData;
            error: infer TError;
        }
      ? { data: TData; error: TError } & UseQueryResultWithoutDataAndError<TResponse>
      : never;

export type UseEdenQuery<TOptions, TResponse> = TOptions extends null
    ? null
    : (options: MergeObjects<UseQueryOptionsWithoutKey & TOptions>) => EdenQueryResult<TResponse>;
