import socket
import sys
import json
import time
import numpy as np

from worlds.worlds import World

w = World(10, 10, world_uuid='test')
w.build_coords()
print(w.build_coords())


# class UDPRequestHandler:

#     def handle(self, data):
#         if data == 'ready':
#             response = 
        
#         return response


# HOST = ''
# RECV_PORT = 3001

# try:
#     recv_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
#     #socket.setblocking(false)
#     print("Socket Created")
# except:
#     print("Failed to create socket.")
#     sys.exit()

# # Bind socket to local host and port
# try:
#     recv_socket.bind((HOST, RECV_PORT))
# except:
#     print("Bind failed.")
#     sys.exit()

# running = True
# while running:

#     # Receive data from client (data, addr)
#     message, address = recv_socket.recvfrom(2097152)
#     data = str(message, "utf-8")
#     # Print to the server who made a connection.
#     print("{} wrote:".format(address))
#     print(data)

#     # if data == 'ready' and not send_response:
#     #     send_socket.bind((HOST, SEND_PORT))
#     #     send_response = True

#     # if send_response:
#     #     send_socket.sendto(bytes('aweosme', "utf-8"), address)
#     #     send_response = False
        
#     # # Now have our UDP handler handle the data
#     # myUDPHandler = UDPRequestHandler()
#     # myResponse = myUDPHandler.handle(data)

#     # # Respond back
#     # print(myResponse)
#     recv_socket.sendto(bytes('forward', "utf-8"), address)
#     time.sleep(.2)
#     recv_socket.sendto(bytes('stop', "utf-8"), address)
    
# recv_socket.close()
# # send_socket.close()

# # thoughts on the server
# # - udp connection says world connection is setup and requests world