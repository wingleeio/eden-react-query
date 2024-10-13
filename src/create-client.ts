import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";

import { EdenQueryClient } from "./types";

/**
 * Creates the eden react query hook client
 */
export const createClient = <T>(client: T): EdenQueryClient<T> => {
    const build = (props: string[], parameters: Record<string, string>): EdenQueryClient<T> => {
        const fn = function () {
            return props;
        } as unknown as T & (() => string[]);

        return new Proxy(fn, {
            get: (_, prop) => {
                return build([...props, prop as string], parameters) as any;
            },
            apply: (_, __, args) => {
                switch (props[props.length - 1]) {
                    case "useQuery": {
                        const options = args[0];
                        const queryKey = [
                            "eden",
                            ...props,
                            JSON.stringify(options?.query) ?? "{}",
                            JSON.stringify(parameters),
                        ];
                        const method: any = props.slice(0, -1).reduce((acc, key) => {
                            if (parameters[key]) {
                                return (acc as any)[key](parameters[key]);
                            }
                            return (acc as any)[key];
                        }, client);
                        return useQuery({
                            ...options,
                            queryKey,
                            queryFn: async () => {
                                const { data, error } = await method({ query: options?.query });

                                if (error) {
                                    throw error;
                                }
                                return data;
                            },
                        });
                    }
                    case "useInfiniteQuery": {
                        const options = args[0];
                        const queryKey = [
                            "eden",
                            ...props,
                            JSON.stringify(options?.query) ?? "{}",
                            JSON.stringify(parameters),
                        ];
                        const method: any = props.slice(0, -1).reduce((acc, key) => {
                            if (parameters[key]) {
                                return (acc as any)[key](parameters[key]);
                            }
                            return (acc as any)[key];
                        }, client);
                        return useInfiniteQuery({
                            ...options,
                            queryKey,
                            queryFn: async ({ pageParam }) => {
                                const { data, error } = await method({
                                    query: { ...options?.query, cursor: pageParam },
                                });
                                if (error) {
                                    throw error;
                                }
                                return data;
                            },
                        });
                    }
                    case "useMutation": {
                        const options = args[0];
                        const method: any = props.slice(0, -1).reduce((acc, key) => {
                            if (parameters[key]) {
                                return (acc as any)[key](parameters[key]);
                            }
                            return (acc as any)[key];
                        }, client);
                        return useMutation({
                            ...options,
                            mutationFn: async (body: any) => {
                                const { data, error } = await method(body);
                                if (error) {
                                    throw error;
                                }
                                return data;
                            },
                        });
                    }
                    default:
                        const newParameters = { ...parameters };
                        newParameters[props[props.length - 1]] = args[0];
                        return build(props, newParameters) as any;
                }
            },
        }) as unknown as EdenQueryClient<T>;
    };

    return build([], {});
};
