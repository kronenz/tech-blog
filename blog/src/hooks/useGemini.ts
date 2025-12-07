/**
 * useGemini Hook - Gemini AI 기능 관리
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { AIResponse } from '../types/editor';
import {
  initializeGemini,
  isGeminiInitialized,
  generateAnimFlowYaml,
  generateDraft,
  suggestTags,
  cleanupGemini,
} from '../services/gemini';

export interface UseGeminiReturn {
  /** AI 초기화 여부 */
  isInitialized: boolean;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 마지막 응답 */
  lastResponse: AIResponse | null;
  /** 마지막 에러 */
  error: string | null;
  /** API Key로 초기화 */
  initialize: (apiKey: string) => void;
  /** AnimFlow YAML 생성 */
  generateAnimFlow: (description: string) => Promise<AIResponse>;
  /** 블로그 초안 생성 */
  generateBlogDraft: (topic: string) => Promise<AIResponse>;
  /** 태그 추천 */
  suggestTagsForContent: (content: string) => Promise<AIResponse>;
  /** 요청 취소 */
  cancel: () => void;
  /** 상태 초기화 */
  reset: () => void;
}

export function useGemini(apiKey?: string | null): UseGeminiReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // AbortController for cancellation
  const abortControllerRef = useRef<AbortController | null>(null);
  const isCancelledRef = useRef(false);

  // API Key가 변경되면 자동으로 초기화
  useEffect(() => {
    if (apiKey) {
      try {
        initializeGemini(apiKey);
        setIsInitialized(true);
        setError(null);
      } catch (err) {
        setError((err as Error).message);
        setIsInitialized(false);
      }
    } else {
      // API Key가 없으면 정리
      cleanupGemini();
      setIsInitialized(false);
    }
  }, [apiKey]);

  // 초기화 함수
  const initialize = useCallback((key: string) => {
    try {
      initializeGemini(key);
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setIsInitialized(false);
    }
  }, []);

  // 요청 취소
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    isCancelledRef.current = true;
    setIsLoading(false);
  }, []);

  // 상태 초기화
  const reset = useCallback(() => {
    setLastResponse(null);
    setError(null);
    setIsLoading(false);
    isCancelledRef.current = false;
  }, []);

  // AnimFlow YAML 생성
  const generateAnimFlow = useCallback(async (description: string): Promise<AIResponse> => {
    if (!isGeminiInitialized() && !apiKey) {
      const response: AIResponse = {
        success: false,
        error: 'Gemini API not initialized. Please set your API key.',
        errorCode: 'API_KEY_MISSING',
        timestamp: Date.now(),
      };
      setLastResponse(response);
      setError(response.error || null);
      return response;
    }

    isCancelledRef.current = false;
    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const response = await generateAnimFlowYaml(description, apiKey || undefined);

      // 취소된 경우 무시
      if (isCancelledRef.current) {
        return {
          success: false,
          error: 'Request cancelled',
          errorCode: 'AI_REQUEST_CANCELLED',
          timestamp: Date.now(),
        };
      }

      setLastResponse(response);
      if (!response.success) {
        setError(response.error || null);
      }
      return response;
    } catch (err) {
      const errorMessage = (err as Error).message;
      const response: AIResponse = {
        success: false,
        error: errorMessage,
        errorCode: 'AI_REQUEST_FAILED',
        timestamp: Date.now(),
      };
      setLastResponse(response);
      setError(errorMessage);
      return response;
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [apiKey]);

  // 블로그 초안 생성
  const generateBlogDraft = useCallback(async (topic: string): Promise<AIResponse> => {
    if (!isGeminiInitialized() && !apiKey) {
      const response: AIResponse = {
        success: false,
        error: 'Gemini API not initialized. Please set your API key.',
        errorCode: 'API_KEY_MISSING',
        timestamp: Date.now(),
      };
      setLastResponse(response);
      setError(response.error || null);
      return response;
    }

    isCancelledRef.current = false;
    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const response = await generateDraft(topic, apiKey || undefined);

      if (isCancelledRef.current) {
        return {
          success: false,
          error: 'Request cancelled',
          errorCode: 'AI_REQUEST_CANCELLED',
          timestamp: Date.now(),
        };
      }

      setLastResponse(response);
      if (!response.success) {
        setError(response.error || null);
      }
      return response;
    } catch (err) {
      const errorMessage = (err as Error).message;
      const response: AIResponse = {
        success: false,
        error: errorMessage,
        errorCode: 'AI_REQUEST_FAILED',
        timestamp: Date.now(),
      };
      setLastResponse(response);
      setError(errorMessage);
      return response;
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [apiKey]);

  // 태그 추천
  const suggestTagsForContent = useCallback(async (content: string): Promise<AIResponse> => {
    if (!isGeminiInitialized() && !apiKey) {
      const response: AIResponse = {
        success: false,
        error: 'Gemini API not initialized. Please set your API key.',
        errorCode: 'API_KEY_MISSING',
        timestamp: Date.now(),
      };
      setLastResponse(response);
      setError(response.error || null);
      return response;
    }

    isCancelledRef.current = false;
    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const response = await suggestTags(content, apiKey || undefined);

      if (isCancelledRef.current) {
        return {
          success: false,
          error: 'Request cancelled',
          errorCode: 'AI_REQUEST_CANCELLED',
          timestamp: Date.now(),
        };
      }

      setLastResponse(response);
      if (!response.success) {
        setError(response.error || null);
      }
      return response;
    } catch (err) {
      const errorMessage = (err as Error).message;
      const response: AIResponse = {
        success: false,
        error: errorMessage,
        errorCode: 'AI_REQUEST_FAILED',
        timestamp: Date.now(),
      };
      setLastResponse(response);
      setError(errorMessage);
      return response;
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [apiKey]);

  return {
    isInitialized,
    isLoading,
    lastResponse,
    error,
    initialize,
    generateAnimFlow,
    generateBlogDraft,
    suggestTagsForContent,
    cancel,
    reset,
  };
}
