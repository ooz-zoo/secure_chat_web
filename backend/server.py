from flask import Flask, request, jsonify, url_for, redirect, session, send_from_directory
import firebase_admin
from flask_cors import CORS
from firebase_admin import auth, credentials, firestore, auth, initialize_app
from datetime import datetime
from Crypto.Cipher import AES
import base64
import secrets
import os
import requests
from Crypto.Util.Padding import pad, unpad


app = Flask(__name__, static_folder='static/build')

CORS(app, supports_credentials=True)  # Enable CORS for all routes

cred = credentials.Certificate(r'testingcreds.json')

firebase_admin.initialize_app(cred)
db = firestore.client()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# #ROOM-CREATION
@app.route('/create-room', methods=['POST'])
def create_room():
  data = request.get_json()
  room_name = data.get('name')
  room_description = data.get('description')

  # Validate data
  if not room_name or not room_description:
    return jsonify({'error': 'Invalid room details'}), 400

  # Prepare room data with timestamp
  new_room = {
      'name': room_name,
      'description': room_description,
      'created_at': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
  }

  # Save the room to Firestore
  try:
    doc_ref = db.collection('rooms').add(new_room)
    return (jsonify({'message': 'Room created successfully'}), 201) 
  except Exception as e:
    return jsonify({'error': str(e)}), 500
  

# @app.route('/create-room', methods=['GET'])
def handle_get_request():
    return jsonify({'error': 'Dashboard Page'}), 200

# #FETCHING ROOMS
@app.route('/fetch-rooms', methods=['GET'])
def fetch_rooms():
  try:
    rooms = []
    # Retrieve all rooms from Firestore
    room_data = db.collection('rooms').get()
    for doc in room_data:
      room_info = doc.to_dict()
      room_info['id'] = doc.id  # Add room id to room info
      rooms.append(room_info)
    return jsonify({'rooms': rooms}), 200
  except Exception as e:
    return jsonify({'error': str(e)}), 500


# #JOIN THE ROOM
@app.route('/join-room/<room_id>', methods=['GET'])
def join_room(room_id):
    # Implement logic for joining room
    # For now, let's redirect to a welcome page
    return redirect(url_for('send-message', room_id=room_id))

#WELCOME MESSAGE
@app.route('/welcome/<room_id>', methods=['GET'])
def welcome(room_id):
    # Render a welcome page or return a welcome message
    return jsonify({'message': f'Welcome to Room {room_id}'}), 200


# Send message endpoint
@app.route('/send-message/<room_id>', methods=['POST'])
def send_message(room_id):
    data = request.json
    message = data.get('message')
    sender = data.get('sender')

    try:
        if not message or not sender:
            return jsonify({'error': 'Message and sender are required'}), 400
        
        # Store message in Firestore
        message_data = {
            'message': message,
            'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'room_id': room_id,
            'sender': sender
        }

        # Call the function to send message to Firestore
        send_message_to_firestore(room_id, message_data)
        # For demonstration, let's just return the message data
        return jsonify({'message': message_data}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
# Function to send message to Firestore
def send_message_to_firestore(room_id, message):
    doc_ref = db.collection('rooms').document(room_id).collection('messages').add(message)

def fetch_messages_from_firestore(room_id):
    messages = []
    message_data = db.collection('rooms').document(room_id).collection('messages').order_by('timestamp', direction=firestore.Query.DESCENDING).get()
    for doc in message_data:
        message_info = doc.to_dict()
        message_info['id'] = doc.id

        
        messages.append(message_info)
    return messages
    

# # Fetch messages endpoint
@app.route('/fetch-messages/<room_id>', methods=['GET'])
def fetch_messages(room_id):
    try:
        messages = fetch_messages_from_firestore(room_id)
        return jsonify({'messages': messages}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

     
if __name__ == '__main__':
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() in ['true', '1', 't']
    app.run(debug=debug_mode)