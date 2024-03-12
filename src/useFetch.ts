import { useCallback, useEffect, useRef, useState } from "react";
import type { AxiosRequestConfig } from "axios";
import api from "./api";

type UseFetchOptions = {
  enabled?: boolean;
  select?: (data: any) => any;
};

export const useFetch = (url: string, options: UseFetchOptions = {}) => {
  const loadingRef = useRef(false);
  const [data, setData] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>();
  const controllerRef = useRef<AbortController | undefined>();

  const fetchData = async () => {
    if (loadingRef.current) {
      return;
    }

    loadingRef.current = true;
    setIsError(false);
    setError(undefined);
    setIsLoading(true);

    try {
      const controller = new AbortController();
      controllerRef.current = controller;
      const response = await api.get(url, { signal: controller.signal });
      const data = options.select
        ? options.select(response.data)
        : response.data;

      setData(data);
    } catch (error) {
      setIsError(true);
      setError(error);
    }

    setIsLoading(false);
    loadingRef.current = false;
  };

  useEffect(() => {
    if (options.enabled !== false) {
      fetchData();
    }
  }, [options.enabled]);

  const refetch = useCallback(() => {
    loadingRef.current = false;
    controllerRef.current?.abort();

    fetchData();
  }, [fetchData]);

  return { data, isLoading, isError, error, refetch };
};

type UseMutateOptions = AxiosRequestConfig & {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
};

export const useMutate = (url: string, options: UseMutateOptions = {}) => {
  const loadingRef = useRef(false);
  const [data, setData] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>();

  const mutate = async (data?: any) => {
    if (loadingRef.current) {
      return;
    }

    loadingRef.current = true;
    setData(undefined);
    setIsError(false);
    setError(undefined);
    setIsLoading(true);

    const { onSuccess, onError, ...restOptions } = options;

    try {
      const response = await api(url, {
        ...restOptions,
        method: options.method || "POST",
        data,
      });
      setData(response.data);

      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      setIsError(true);
      setError(error);

      if (onError) {
        onError(error);
      }
    }

    setIsLoading(false);
    loadingRef.current = false;
  };

  return { data, isLoading, isError, error, mutate };
};
