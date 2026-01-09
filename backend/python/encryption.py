from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding
import os
import sys
import json
import base64

def encrypt_image(image_path, key):
    """
    Encrypts an image using AES-256 encryption
    """
    try:
        # Generate a random IV
        iv = os.urandom(16)
        
        # Create cipher
        cipher = Cipher(
            algorithms.AES(key.encode()[:32].ljust(32, b'0')),
            modes.CBC(iv),
            backend=default_backend()
        )
        
        # Read image file
        with open(image_path, 'rb') as f:
            image_data = f.read()
        
        # Pad the data
        padder = padding.PKCS7(128).padder()
        padded_data = padder.update(image_data) + padder.finalize()
        
        # Encrypt
        encryptor = cipher.encryptor()
        encrypted_data = encryptor.update(padded_data) + encryptor.finalize()
        
        # Combine IV and encrypted data
        result = iv + encrypted_data
        
        # Save encrypted file
        encrypted_path = image_path.replace('.', '_encrypted.')
        with open(encrypted_path, 'wb') as f:
            f.write(result)
        
        return {
            'success': True,
            'encrypted_path': encrypted_path,
            'iv': base64.b64encode(iv).decode('utf-8')
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def decrypt_image(encrypted_path, key, output_path):
    """
    Decrypts an encrypted image using AES-256 decryption
    """
    try:
        # Read encrypted file
        with open(encrypted_path, 'rb') as f:
            encrypted_data = f.read()
        
        # Extract IV and encrypted content
        iv = encrypted_data[:16]
        encrypted_content = encrypted_data[16:]
        
        # Create cipher
        cipher = Cipher(
            algorithms.AES(key.encode()[:32].ljust(32, b'0')),
            modes.CBC(iv),
            backend=default_backend()
        )
        
        # Decrypt
        decryptor = cipher.decryptor()
        decrypted_padded = decryptor.update(encrypted_content) + decryptor.finalize()
        
        # Unpad the data
        unpadder = padding.PKCS7(128).unpadder()
        decrypted_data = unpadder.update(decrypted_padded) + unpadder.finalize()
        
        # Save decrypted file
        with open(output_path, 'wb') as f:
            f.write(decrypted_data)
        
        return {
            'success': True,
            'decrypted_path': output_path
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

if __name__ == '__main__':
    if len(sys.argv) < 4:
        print(json.dumps({'success': False, 'error': 'Invalid arguments'}))
        sys.exit(1)
    
    operation = sys.argv[1]
    
    if operation == 'encrypt':
        image_path = sys.argv[2]
        key = sys.argv[3]
        result = encrypt_image(image_path, key)
        print(json.dumps(result))
    
    elif operation == 'decrypt':
        encrypted_path = sys.argv[2]
        key = sys.argv[3]
        output_path = sys.argv[4]
        result = decrypt_image(encrypted_path, key, output_path)
        print(json.dumps(result))
    
    else:
        print(json.dumps({'success': False, 'error': 'Invalid operation'}))
