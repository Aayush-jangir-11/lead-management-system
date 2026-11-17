import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';

const normalizeInvalidateKeys = (keys) => {
  if (!keys) return [];
  if (!Array.isArray(keys)) return [[keys]];
  if (keys.length === 0) return [];

  // If first item is an array, assume it's already an array of query keys
  if (Array.isArray(keys[0])) {
    return keys;
  }
  // Otherwise treat the whole array as one query key
  return [keys];
};


// Helper to trigger invalidations across the QueryClient

const triggerInvalidations = (queryClient, keys) => {
  const normalized = normalizeInvalidateKeys(keys);
  normalized.forEach((key) => {
    queryClient.invalidateQueries({
      queryKey: Array.isArray(key) ? key : [key],
      exact: false,
    });
  });
};


// Hook for GET requests using TanStack useQuery
export function useGet(queryKey, url, options = {}) {
  const { params, axiosConfig = {}, ...queryOptions } = options;
  const normalizedKey = Array.isArray(queryKey) ? queryKey : [queryKey];

  return useQuery({
    queryKey: normalizedKey,
    queryFn: async ({ signal }) => {
      const endpoint = typeof url === 'function' ? url() : url;
      const response = await api.get(endpoint, {
        params,
        signal,
        ...axiosConfig,
      });
      return response.data;
    },
    ...queryOptions,
  });
}

// Hook for POST requests using TanStack useMutation
export function usePost(url, options = {}) {
  const queryClient = useQueryClient();
  const {
    invalidateKeys,
    onSuccess,
    onError,
    onSettled,
    axiosConfig = {},
    ...mutationOptions
  } = options;

  return useMutation({
    mutationFn: async (variables) => {
      let endpoint = url;
      let payload = variables;

      if (typeof url === 'function') {
        endpoint = url(variables);
      } else if (
        variables &&
        typeof variables === 'object' &&
        'url' in variables &&
        'data' in variables
      ) {
        endpoint = variables.url;
        payload = variables.data;
      }

      const response = await api.post(endpoint, payload, axiosConfig);
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      if (invalidateKeys) {
        triggerInvalidations(queryClient, invalidateKeys);
      }
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      onError?.(error, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      onSettled?.(data, error, variables, context);
    },
    ...mutationOptions,
  });
}

// Hook for UPDATE (PUT/PATCH) requests using TanStack useMutation
export function useUpdate(url, options = {}) {
  const queryClient = useQueryClient();
  const {
    method = 'put',
    invalidateKeys,
    onSuccess,
    onError,
    onSettled,
    axiosConfig = {},
    ...mutationOptions
  } = options;

  return useMutation({
    mutationFn: async (variables = {}) => {
      // 1. Dynamic Function ho ya String ho (auto ID support ke sath)
      const endpoint =
        typeof url === 'function'
          ? url(variables)
          : variables?.id
            ? `${String(url).replace(/\/+$/, '')}/${variables.id}`
            : url;

      // 2. Safe Payload (agar data alag se na ho toh id aur method ko body se alag kar do)
      let payload = variables?.data;
      if (payload === undefined) {
        if (variables && typeof variables === 'object') {
          const { id, method: _m, ...rest } = variables;
          payload = rest;
        } else {
          payload = variables;
        }
      }

      // 3. Safe HTTP method call (default 'put', but supports 'patch' via option or variable)
      const httpMethod = (variables?.method || method).toLowerCase();
      const response = await api[httpMethod](endpoint, payload, axiosConfig);
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      if (invalidateKeys) {
        triggerInvalidations(queryClient, invalidateKeys);
      }
      onSuccess?.(data, variables, context);
    },
    onError,
    onSettled,
    ...mutationOptions,
  });
}


// Hook for DELETE requests using TanStack useMutation
export function useDelete(url, options = {}) {
  const queryClient = useQueryClient();
  const {
    invalidateKeys,
    onSuccess,
    onError,
    onSettled,
    axiosConfig = {},
    ...mutationOptions
  } = options;

  return useMutation({
    mutationFn: async (variables) => {
      let endpoint = url;
      let config = { ...axiosConfig };

      if (typeof url === 'function') {
        endpoint = url(variables);
      } else if (typeof variables === 'string' || typeof variables === 'number') {
        const base = String(endpoint).endsWith('/')
          ? String(endpoint).slice(0, -1)
          : endpoint;
        endpoint = `${base}/${variables}`;
      } else if (variables && typeof variables === 'object') {
        if ('url' in variables) {
          endpoint = variables.url;
        } else if ('id' in variables) {
          const base = String(endpoint).endsWith('/')
            ? String(endpoint).slice(0, -1)
            : endpoint;
          endpoint = `${base}/${variables.id}`;
        }
        if ('data' in variables) {
          config.data = variables.data;
        }
        if ('params' in variables) {
          config.params = variables.params;
        }
      }

      const response = await api.delete(endpoint, config);
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      if (invalidateKeys) {
        triggerInvalidations(queryClient, invalidateKeys);
      }
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      onError?.(error, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      onSettled?.(data, error, variables, context);
    },
    ...mutationOptions,
  });
}

/**
 * Hook to manually invalidate queries from anywhere in the app
 *
 * @returns {Function} `(queryKey) => Promise<void>`
 *
 * @example
 * const invalidate = useInvalidate();
 * invalidate(['leads']);
 */
export function useInvalidate() {
  const queryClient = useQueryClient();
  return (queryKey) => {
    return queryClient.invalidateQueries({
      queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    });
  };
}

export default {
  useGet,
  usePost,
  useUpdate,
  useDelete,
  useInvalidate,
};

