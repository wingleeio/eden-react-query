import { FetchInfiniteQueryOptions, FetchQueryOptions, QueryClient } from "@tanstack/react-query";

type FetchWithQuery<TQuery, TData = unknown, TError = unknown> = (
    options: Omit<FetchQueryOptions<TData, TError>, "queryKey"> & { query: TQuery }
) => Promise<void>;

type FetchWithoutQuery<TData = unknown, TError = unknown> = (
    options?: Omit<FetchQueryOptions<TData, TError>, "queryKey">
) => Promise<void>;

type Fetch<TQuery, TData = unknown, TError = unknown> = TQuery extends void
    ? FetchWithoutQuery<TData, TError>
    : FetchWithQuery<TQuery, TData, TError>;

type FetchInfinite<TQuery, TCursor, TData = unknown, TError = unknown> = (
    options: Omit<FetchInfiniteQueryOptions<TData, TError, unknown, any, TCursor>, "queryKey"> & { query: TQuery }
) => Promise<void>;

type EdenQueryServerHelper<T> = {
    [K in keyof T]: T[K] extends (...args: any) => any
        ? K extends "get"
            ? T[K] extends (options: infer Options) => Promise<infer Response>
                ? Response extends { data: any; error: any }
                    ? Options extends {
                          query: infer Query;
                      }
                        ? Query extends {
                              cursor: infer Cursor;
                          }
                            ? {
                                  fetch: Fetch<Query, Response["data"], Response["error"]>;
                                  fetchInfinite: FetchInfinite<Query, Cursor, Response["data"], Response["error"]>;
                                  prefetch: Fetch<Query, Response["data"], Response["error"]>;
                                  prefetchInfinite: FetchInfinite<Query, Cursor, Response["data"], Response["error"]>;
                              }
                            : {
                                  prefetch: Fetch<Query, Response["data"], Response["error"]>;
                              }
                        : never
                    : never
                : never
            : never
        : EdenQueryServerHelper<T[K]>;
};

export const createServerHelper = <T>(eden: T): EdenQueryServerHelper<T> => {
    const queryClient = new QueryClient();

    const build = (props: string[]) => {
        const fn = function () {
            return props;
        } as unknown as T & (() => string[]);

        return new Proxy(fn, {
            get: (_, prop) => {
                if (prop === "fetch") {
                    return (options: any) => {
                        const queryKey = ["eden", props.join("."), JSON.stringify(options?.query)];
                        return queryClient.fetchQuery({
                            ...options,
                            queryKey,
                            queryFn: async () => {
                                const method: any = props.reduce((acc, key) => (acc as any)[key], eden);
                                const { data, error } = await method({
                                    query: options.query,
                                });
                                if (error) {
                                    return Promise.reject(error);
                                }
                                return data;
                            },
                        });
                    };
                }

                if (prop === "prefetch") {
                    return (options: any) => {
                        const queryKey = ["eden", props.join("."), JSON.stringify(options?.query)];
                        return queryClient.prefetchQuery({
                            ...options,
                            queryKey,
                            queryFn: async () => {
                                const method: any = props.reduce((acc, key) => (acc as any)[key], eden);
                                const { data, error } = await method({
                                    query: options.query,
                                });
                                if (error) {
                                    return Promise.reject(error);
                                }
                                return data;
                            },
                        });
                    };
                }

                if (prop === "fetchInfinite") {
                    return (options: any) => {
                        const queryKey = ["eden", props.join("."), JSON.stringify(options?.query)];
                        return queryClient.fetchInfiniteQuery({
                            ...options,
                            queryKey,
                            queryFn: async ({ pageParam }) => {
                                const method: any = props.reduce((acc, key) => (acc as any)[key], eden);
                                const { data, error } = await method({
                                    query: Object.assign({}, options.query, { cursor: pageParam }),
                                });
                                if (error) {
                                    return Promise.reject(error);
                                }
                                return data;
                            },
                        });
                    };
                }

                if (prop === "prefetchInfinite") {
                    return (options: any) => {
                        const queryKey = ["eden", props.join("."), JSON.stringify(options?.query)];
                        return queryClient.prefetchInfiniteQuery({
                            ...options,
                            queryKey,
                            queryFn: async ({ pageParam }) => {
                                const method: any = props.reduce((acc, key) => (acc as any)[key], eden);
                                const { data, error } = await method({
                                    query: Object.assign({}, options.query, { cursor: pageParam }),
                                });
                                if (error) {
                                    return Promise.reject(error);
                                }
                                return data;
                            },
                        });
                    };
                }

                return build([...props, prop as string]);
            },
        });
    };

    return build([]) as unknown as EdenQueryServerHelper<T>;
};
