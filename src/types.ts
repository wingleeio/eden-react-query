import {
    DehydratedState,
    FetchInfiniteQueryOptions,
    FetchQueryOptions,
    InfiniteData,
    UseInfiniteQueryOptions,
    UseInfiniteQueryResult,
    UseMutationOptions,
    UseMutationResult,
    UseQueryOptions,
    UseQueryResult,
    useMutation,
} from "@tanstack/react-query";

export type EdenFunction<TParameters extends any[], TResults> = (...args: TParameters) => TResults;

export type EdenAsyncFunction<TParameters extends any[], TResults> = (...args: TParameters) => Promise<TResults>;

export type UseEdenQueryOptions<TParameters extends any[] = any[], TData = any, TError = any> = Omit<
    UseQueryOptions<TData, TError>,
    "queryKey" | "queryFn"
> &
    IsOptional<TParameters[0]> extends true
    ? {
          query?: TParameters[0] extends EdenOptions<infer TQuery> ? TQuery : Record<string, any>;
      }
    : {
          query: TParameters[0] extends EdenOptions<infer TQuery> ? TQuery : Record<string, any>;
      };

export type UseEdenQueryResult<TData = any, TError = any> = Omit<UseQueryResult, "error" | "data"> &
    EdenResponse<TData, TError>;

export type UseEdenQuery<TParameters extends any[], TData, TError> = IsOptional<TParameters[0]> extends true
    ? (args?: UseEdenQueryOptions<TParameters, TData, TError>) => UseEdenQueryResult<TData, TError>
    : (args: UseEdenQueryOptions<TParameters, TData, TError>) => UseEdenQueryResult<TData, TError>;

export type IsEmptyObject<T> = keyof T extends never ? true : false;

export type UseEdenInfiniteQueryOptions<TQuery, TData, TError, TCursor> = IsEmptyObject<
    Omit<TQuery, "cursor">
> extends true
    ? Omit<UseInfiniteQueryOptions<TData, TError, unknown, unknown, string[], TCursor>, "queryKey" | "queryFn">
    : Omit<UseInfiniteQueryOptions<TData, TError, unknown, unknown, string[], TCursor>, "queryKey" | "queryFn"> & {
          query: Omit<TQuery, "cursor">;
      };

export type UseEdenInfiniteQueryResult<TData, TError, TCursor> = UseInfiniteQueryResult<
    InfiniteData<TData, TCursor>,
    TError
>;

export type UseEdenInfiniteQuery<
    TParameters extends any[],
    TData,
    TError,
    TCursor
> = TParameters[0] extends EdenOptions<infer TQuery>
    ? (
          args: UseEdenInfiniteQueryOptions<TQuery, TData, TError, TCursor>
      ) => UseEdenInfiniteQueryResult<TData, TError, TCursor>
    : never;

export type UseEdenMutation<
    TParameters extends any[] = any[],
    TData = any,
    TError = any
> = TParameters[1] extends EdenOptions<infer TQuery>
    ? TParameters[0] extends EdenBody
        ? (
              options: UseMutationOptions<TData, TError, TParameters[0]> & { query: TQuery }
          ) => UseMutationResult<TData, TError, TParameters[0]>
        : (
              options: UseMutationOptions<TData, TError, void> & { query: TQuery }
          ) => UseMutationResult<TData, TError, void>
    : TParameters[0] extends EdenBody
    ? (
          options?: UseMutationOptions<TData, TError, TParameters[0]> & { query?: Record<string, any> }
      ) => UseMutationResult<TData, TError, TParameters[0]>
    : (
          options?: UseMutationOptions<TData, TError, void> & { query?: Record<string, any> }
      ) => UseMutationResult<TData, TError, void>;

export type EdenOptions<TQuery = any> =
    | {
          query: TQuery;
      }
    | {
          query?: TQuery;
      };

export type EdenBody = string | number | object;

export type EdenResponse<TData, TError> = {
    data: TData;
    error: TError;
};
export type ExtractEdenResponseData<T> = T extends { data: infer U } ? U : never;
export type ExtractEdenResponseError<T> = T extends { error: infer U } ? U : never;

export type IsOptional<T> = undefined extends T ? true : false;

export type EdenQuery<
    TParameters extends any[],
    TResponse = EdenResponse<unknown, unknown>
> = TParameters[0] extends EdenOptions<{ cursor: infer TCursor }>
    ? {
          useQuery: TResponse extends EdenResponse<infer TData, infer TError>
              ? UseEdenQuery<TParameters, TData, TError>
              : never;
          useInfiniteQuery: UseEdenInfiniteQuery<
              TParameters,
              NonNullable<ExtractEdenResponseData<TResponse>>,
              NonNullable<ExtractEdenResponseError<TResponse>>,
              TCursor
          >;
      }
    : {
          useQuery: TResponse extends EdenResponse<infer TData, infer TError>
              ? UseEdenQuery<TParameters, TData, TError>
              : never;
      };

export type EdenMutation<TParameters extends any[], TResponse = EdenResponse<unknown, unknown>> = {
    useMutation: UseEdenMutation<
        TParameters,
        NonNullable<ExtractEdenResponseData<TResponse>>,
        NonNullable<ExtractEdenResponseError<TResponse>>
    >;
};

export type EdenQueryClient<T> = {
    [K in keyof T]: K extends "get"
        ? T[K] extends EdenAsyncFunction<infer TParameters, infer TResponse>
            ? EdenQuery<TParameters, TResponse>
            : never
        : T[K] extends EdenFunction<infer TParameters, infer TReturn>
        ? TReturn extends Promise<infer TResponse>
            ? EdenMutation<TParameters, TResponse>
            : T[K] extends { get: any }
            ? EdenQueryClient<TReturn & T[K]> & EdenFunction<TParameters, EdenQueryClient<TReturn>>
            : EdenFunction<TParameters, EdenQueryClient<TReturn>>
        : EdenQueryClient<T[K]>;
};

export type EdenFetchQueryOptions<TQuery, TData, TError> = FetchQueryOptions<TData, TError> &
    IsEmptyObject<TQuery> extends true
    ? {
          query: Record<string, any>;
      }
    : {
          query: TQuery;
      };

export type EdenFetchQuery<TParameters extends any[], TData, TError> = TParameters[0] extends
    | EdenOptions<infer TQuery>
    | undefined
    ? IsEmptyObject<TQuery> extends true
        ? (options?: EdenFetchQueryOptions<TQuery, TData, TError>) => Promise<TData>
        : (options: EdenFetchQueryOptions<TQuery, TData, TError>) => Promise<TData>
    : never;

export type EdenFetchInfiniteQueryOptions<TQuery, TData, TError, TCursor> = FetchInfiniteQueryOptions<
    TData,
    TError,
    unknown,
    string[],
    TCursor
> &
    IsEmptyObject<Omit<TQuery, "cursor">> extends true
    ? {}
    : { query: Omit<TQuery, "cursor"> };

export type EdenFetchInfiniteQuery<
    TParameters extends any[],
    TData,
    TError,
    TCursor
> = TParameters[0] extends EdenOptions<infer TQuery>
    ? IsEmptyObject<Omit<TQuery, "cursor">> extends true
        ? (
              options?: EdenFetchInfiniteQueryOptions<TQuery, TData, TError, TCursor>
          ) => Promise<InfiniteData<TData, TCursor>>
        : (
              options: EdenFetchInfiniteQueryOptions<TQuery, TData, TError, TCursor>
          ) => Promise<InfiniteData<TData, TCursor>>
    : never;

export type EdenFetch<
    TParameters extends any[],
    TResponse = EdenResponse<unknown, unknown>
> = TParameters[0] extends EdenOptions<{ cursor: infer TCursor }>
    ? {
          fetch: EdenFetchQuery<
              TParameters,
              NonNullable<ExtractEdenResponseData<TResponse>>,
              NonNullable<ExtractEdenResponseError<TResponse>>
          >;
          prefetch: EdenFetchQuery<TParameters, void, NonNullable<ExtractEdenResponseError<TResponse>>>;
          fetchInfinite: EdenFetchInfiniteQuery<
              TParameters,
              NonNullable<ExtractEdenResponseData<TResponse>>,
              NonNullable<ExtractEdenResponseError<TResponse>>,
              TCursor
          >;
          prefetchInfinite: EdenFetchInfiniteQuery<
              TParameters,
              void,
              NonNullable<ExtractEdenResponseError<TResponse>>,
              TCursor
          >;
      }
    : {
          fetch: EdenFetchQuery<
              TParameters,
              NonNullable<ExtractEdenResponseData<TResponse>>,
              NonNullable<ExtractEdenResponseError<TResponse>>
          >;
          prefetch: EdenFetchQuery<TParameters, void, NonNullable<ExtractEdenResponseError<TResponse>>>;
      };

export type EdenUtils<T> = {
    [K in keyof T]: K extends "get"
        ? T[K] extends EdenAsyncFunction<infer TParameters, infer TResponse>
            ? EdenFetch<TParameters, TResponse>
            : never
        : T[K] extends EdenFunction<infer TParameters, infer TReturn>
        ? T[K] extends { get: any }
            ? EdenUtils<TReturn & T[K]> & EdenFunction<TParameters, EdenUtils<TReturn>>
            : EdenFunction<TParameters, EdenUtils<TReturn>>
        : EdenUtils<T[K]>;
};

export type EdenQueryUtils<T, TRoot = false> = TRoot extends true
    ? EdenUtils<T> & { dehydrate: () => DehydratedState }
    : EdenUtils<T>;
