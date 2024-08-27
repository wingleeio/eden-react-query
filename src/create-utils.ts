import { QueryClient, dehydrate } from "@tanstack/react-query";

import { EdenQueryUtils } from "./types";

/**
 * Creates utilities for fetching/prefetching data on the server.
 * */
export const createUtils = <T>(client: T, queryClient = new QueryClient()): EdenQueryUtils<T, true> => {
    const build = (props: string[], parameters: Record<string, string>): EdenQueryUtils<T> => {
        const fn = function () {
            return props;
        } as unknown as T & (() => string[]);

        return new Proxy(fn, {
            get: (_, prop) => {
                return build([...props, prop as string], parameters) as any;
            },
            apply: (_, __, args) => {
                switch (props[props.length - 1]) {
                    case "fetch": {
                        const options = args[0];
                        const queryProps = [...props];
                        queryProps[queryProps.length - 1] = "useQuery";
                        const queryKey = [
                            "eden",
                            ...queryProps,
                            JSON.stringify(options?.query) ?? "{}",
                            JSON.stringify(parameters),
                        ];
                        const method: any = props.slice(0, -1).reduce((acc, key) => {
                            if (parameters[key]) {
                                return (acc as any)[key](parameters[key]);
                            }
                            return (acc as any)[key];
                        }, client);
                        return queryClient.fetchQuery({
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
                    case "prefetch": {
                        const options = args[0];
                        const queryProps = [...props];
                        queryProps[queryProps.length - 1] = "useQuery";
                        const queryKey = [
                            "eden",
                            ...queryProps,
                            JSON.stringify(options?.query) ?? "{}",
                            JSON.stringify(parameters),
                        ];
                        const method: any = props.slice(0, -1).reduce((acc, key) => {
                            if (parameters[key]) {
                                return (acc as any)[key](parameters[key]);
                            }
                            return (acc as any)[key];
                        }, client);
                        return queryClient.prefetchQuery({
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
                    case "dehydrate": {
                        return dehydrate(queryClient);
                    }
                    default:
                        const newParameters = { ...parameters };
                        newParameters[props[props.length - 1]] = args[0];
                        return build(props, newParameters) as any;
                }
            },
        }) as unknown as EdenQueryUtils<T>;
    };

    return build([], {}) as EdenQueryUtils<T, true>;
};
