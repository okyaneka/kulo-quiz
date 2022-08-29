import {
  useQuery as useVueQuery,
  useMutation as useVueMutation,
  type UseMutationReturnType,
  type UseMutationOptions,
  type UseQueryOptions,
} from 'vue-query'

const onError = (error: unknown) => {
  ElMessage.error((error as Error).message)
}

const DefaultQueryOptions = (_ovveride: UseQueryOptions) => {
  return { onError, ..._ovveride }
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

export function useQuery(options: UseQueryOptions) {
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
