import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";

import type { UseEdenInfiniteQuery } from "./use-eden-infinite-query";
import type { UseEdenMutation } from "./use-eden-mutation";
import type { UseEdenQuery } from "./use-eden-query";

type EdenQuery<T> = {
    [K in keyof T]: T[K] extends (...args: any) => any
        ? K extends "get"
            ? T[K] extends (options: infer Options) => Promise<infer Response>
                ? Options extends {
                      query: {
                          cursor: infer Cursor;
                      };
                  }
                    ? {
                          useQuery: UseEdenQuery<Omit<Options, "header" | "fetch">, Response>;
                          useInfiniteQuery: UseEdenInfiniteQuery<
                              Options,
                              Response extends { data: any; error: any } ? Response : { data: any; error: any },
                              Cursor
                          >;
                      }
                    : {
                          useQuery: UseEdenQuery<Omit<Options, "header" | "fetch">, Response>;
                      }
                : never
            : T[K] extends (body: infer Body) => Promise<infer Response>
            ? {
                  useMutation: UseEdenMutation<
                      Body,
                      Response extends { data: any; error: any } ? Response : { data: any; error: any }
                  >;
              }
            : never
        : EdenQuery<T[K]>;
};

/**
 * @deprecated This method is replaced with `createQueryClient`
 */
export const pact = <T extends any>(eden: T): EdenQuery<T> => {
    const build = (props: string[]) => {
        const fn = function () {
            return props;
        } as unknown as T & (() => string[]);

        return new Proxy(fn, {
            get: (_, prop) => {
                if (prop === "useQuery") {
                    return (options: any) => {
                        const queryKey = ["eden", ...props, JSON.stringify(options.query)];
                        const query = useQuery({
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
                            ...options,
                        });
                        return query;
                    };
                }

                if (prop === "useMutation") {
                    return (options: any) => {
                        return useMutation({
                            mutationFn: async (body) => {
                                const method: any = props.reduce((acc, key) => (acc as any)[key], eden);
                                const { data, error } = await method(body, {
                                    headers: options.headers,
                                    query: options.query,
                                    fetch: options.fetch,
                                });
                                if (error) {
                                    return Promise.reject(error);
                                }
                                return data;
                            },
                            ...options,
                        });
                    };
                }

                if (prop === "useInfiniteQuery") {
                    return (options: any) => {
                        const queryKey = ["eden", ...props, JSON.stringify(options.query)];
                        const query = useInfiniteQuery({
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
                            ...options,
                        });
                        return query;
                    };
                }

                return build([...props, prop as string]);
            },
        });
    };
    return build([]) as unknown as EdenQuery<T>;
};
