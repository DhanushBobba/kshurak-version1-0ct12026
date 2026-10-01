import { useEffect, useRef, useState, useCallback } from 'react';

export interface UseWebSocketOptions {
  shopId: string;
  onMessage?: (event: any) => void;
  reconnectInterval?: number;
}

export function useWebSocket({ shopId, onMessage, reconnectInterval = 3000 }: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    try {
      const url = `ws://localhost:8000/ws/queue/${shopId}`;
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          setLastMessage(parsed);
          if (onMessage) onMessage(parsed);
        } catch {
          // heartbeat ping/pong
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setTimeout(connect, reconnectInterval);
      };

      ws.onerror = () => {
        ws.close();
      };

      wsRef.current = ws;
    } catch {
      setIsConnected(false);
    }
  }, [shopId, onMessage, reconnectInterval]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  const send = (data: any) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  };

  return { isConnected, lastMessage, send };
}
