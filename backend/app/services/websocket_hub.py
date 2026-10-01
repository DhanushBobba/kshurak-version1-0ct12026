import json
from datetime import datetime, timezone
from typing import Dict, List, Set, Any
from fastapi import WebSocket

class WebSocketQueueHub:
    """
    Real-time WebSocket hub for broadcasting live queue states, chair transitions,
    and 5-minute customer arrival countdown alerts.
    """

    def __init__(self):
        # shop_id -> Set of active WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, shop_id: str, websocket: WebSocket):
        await websocket.accept()
        if shop_id not in self.active_connections:
            self.active_connections[shop_id] = set()
        self.active_connections[shop_id].add(websocket)

    def disconnect(self, shop_id: str, websocket: WebSocket):
        if shop_id in self.active_connections:
            self.active_connections[shop_id].discard(websocket)
            if not self.active_connections[shop_id]:
                del self.active_connections[shop_id]

    async def broadcast_to_shop(self, shop_id: str, event_type: str, data: Any):
        if shop_id not in self.active_connections:
            return

        message = {
            "event": event_type,
            "shopId": shop_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "payload": data,
        }
        serialized = json.dumps(message)

        dead_sockets = set()
        for ws in self.active_connections[shop_id]:
            try:
                await ws.send_text(serialized)
            except Exception:
                dead_sockets.add(ws)

        for ws in dead_sockets:
            self.disconnect(shop_id, ws)

queue_hub = WebSocketQueueHub()
