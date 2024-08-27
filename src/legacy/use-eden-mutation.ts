import type { useMutation } from "@tanstack/react-query";

export type UseEdenMutation<TBody, TResponse extends { data: any; error: any }> = typeof useMutation<
    NonNullable<TResponse["data"]>,
    NonNullable<TResponse["error"]>,
    TBody
>;
