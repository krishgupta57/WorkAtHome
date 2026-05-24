import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        from .models import Message  # Lazy import to avoid circular dependency
        text_data_json = json.loads(text_data)
        message_text = text_data_json.get('message', '')
        sender_id = text_data_json.get('sender_id')
        receiver_id = text_data_json.get('receiver_id')

        if sender_id and receiver_id and message_text:
            # Save message to database
            await self.save_message(sender_id, receiver_id, message_text)

            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message_text,
                    'sender_id': sender_id,
                    'receiver_id': receiver_id,
                }
            )

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']
        sender_id = event['sender_id']
        receiver_id = event['receiver_id']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'sender_id': sender_id,
            'receiver_id': receiver_id
        }))

    @database_sync_to_async
    def save_message(self, sender_id, receiver_id, message_text):
        from .models import Message
        try:
            sender = User.objects.get(id=sender_id)
            receiver = User.objects.get(id=receiver_id)
            return Message.objects.create(
                sender=sender,
                receiver=receiver,
                content=message_text
            )
        except Exception as e:
            print("WebSocket Chat Save Error:", e)
            return None


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Add to general notifications or user-specific group
        self.user = self.scope.get('user')
        
        # We can also read a query parameter for userId if auth is handled on client side
        query_string = self.scope.get('query_string', b'').decode('utf-8')
        user_id = None
        if 'user_id=' in query_string:
            user_id = query_string.split('user_id=')[-1].split('&')[0]

        if user_id:
            self.group_name = f'user_{user_id}'
        elif self.user and self.user.is_authenticated:
            self.group_name = f'user_{self.user.id}'
        else:
            self.group_name = 'broadcast_notifications'

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    # Receive event from channel layer
    async def send_notification(self, event):
        notification = event['notification']
        await self.send(text_data=json.dumps({
            'notification': notification
        }))
