import websocket
import json

# Your new API token
API_TOKEN = "pd6LZRLx7KIQlO1"

# Define WebSocket handlers
def on_message(ws, message):
    response = json.loads(message)
    print("Received message:", json.dumps(response, indent=4))

def on_error(ws, error):
    print("Error:", error)

def on_close(ws, close_status_code, close_msg):
    print("Closed connection")

def on_open(ws):
    # Send the authorization request with correct syntax
    auth_message = {
        "authorize": API_TOKEN
    }
    ws.send(json.dumps(auth_message))
    print("Authorization request sent!")

# WebSocket connection to Deriv
ws = websocket.WebSocketApp(
    "wss://ws.binaryws.com/websockets/v3?app_id=1089",
    on_message=on_message,
    on_error=on_error,
    on_close=on_close
)
ws.on_open = on_open

# Run the WebSocket connection
ws.run_forever()
