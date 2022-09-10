import type { QueryKey } from 'react-query/types/core'
import {
  useQuery as useVueQuery,
  useMutation as useVueMutation,
  type UseMutationReturnType,
  type UseMutationOptions,
  type UseQueryOptions,
  type UseQueryReturnType,
} from 'vue-query'

const onError = (error: unknown) => {
  ElMessage.error((error as Error).message)
}

const DefaultQueryOptions = <
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  _ovveride: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>
): UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> => {
  return { onError, retry: false, ..._ovveride }
}

const DefaultMutationOptions = <
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown
>(
  _ovveride: UseMutationOptions<TData, TError, TVariables, TContext>
): UseMutationOptions<TData, TError, TVariables, TContext> => {
  return {
    onError,
    ..._ovveride,
  }
}

export const useQuery = <
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>
): UseQueryReturnType<TData, TError> => {
  return useVueQuery(DefaultQueryOptions(options))
}

export const useMutation = <
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>
): UseMutationReturnType<TData, TError, TVariables, TContext> => {
  return useVueMutation(DefaultMutationOptions(options))
}
