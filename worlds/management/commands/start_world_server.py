import socket
import sys
import json
import time
import numpy as np
from threading import Thread
from queue import Queue, Empty

from django.core.management.base import BaseCommand, CommandError
from django.core.cache import cache

from worlds.worlds import World
from worlds.models import World as WorldModel


class Command(BaseCommand):
    help = 'Starts UDP World server for Unreal'
    server_hertz = 60

    def setup_socket(self, host, port):
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.socket.bind((host, port))

    def server_worker(self):
        print('Socket Ready... Listening for messages...')
        while True:
            message, address = self.socket.recvfrom(2097152)
            data = str(message, "utf-8")
            self.queue.put((data, address))

    def cache_worker(self):
        print('Going to check for messages from the cache')
        while True:
            update_request = cache.get('terrain_update', None)
            if update_request is not None:
                cache.delete('terrain_update')
                for address in self.addresses:
                    self.cache_queue.put((update_request, address))

    def handle(self, *args, **options):
        #self.items_to_process()
        self.queue = Queue()
        self.cache_queue = Queue()
        world_db_obj = WorldModel.objects.get(uuid='82122fb8-c7bb-4191-bb64-960887d8cd97')
        self.setup_socket('0.0.0.0', 3001)
        self.world = World(world_db_obj.world_x_cols,
                           world_db_obj.world_y_rows, world_uuid=world_db_obj.uuid)
        terrain_mask = np.array(world_db_obj.world_layers_list).reshape(
            world_db_obj.world_x_cols,
            world_db_obj.world_y_rows)
        # because of UE coord system differences we need to rotate the grid
        print(terrain_mask)
        self.world.layers[0, :, :] = terrain_mask
        world_array = self.world.build_coords()
        running = True
        # this is the main loop that holds the connection open
        
        self.socket_thread = Thread(target=self.server_worker, daemon=True)
        self.cache_thread = Thread(target=self.cache_worker, daemon=True)
        self.socket_thread.start()
        self.cache_thread.start()

        self.addresses = []
        while running:
            start = time.time()
            # ... do stuff that might take significant time
            try:
                message_packet = self.queue.get_nowait()
            except Empty:
                message_packet = None

            try:
                cache_message = self.cache_queue.get_nowait()
            except Empty:
                cache_message = None

            if message_packet:
                request, address = message_packet
                if address not in self.addresses:
                    self.addresses.append(address)
                print("{} wrote:".format(address))
                print(request)
                response = self.process_request(request)
                if response is not None:
                    self.socket.sendto(bytes(response, "utf-8"), address)

            if cache_message:
                response, address = cache_message
                self.socket.sendto(bytes(json.dumps(response), "utf-8"), address)

            time.sleep(max(1./self.server_hertz - (time.time() - start), 0))

    def process_request(self, request):
        response = None
        if request == 'ready':
            world_array = self.world.build_coords()
            response = {'type': 'ready_response', 'payload':[float(i) for i in world_array.shape]}

        if request == 'terrain_request':
            world_db_obj = WorldModel.objects.get(uuid='82122fb8-c7bb-4191-bb64-960887d8cd97')
            terrain_mask = np.array(world_db_obj.world_layers_list).reshape(
                world_db_obj.world_x_cols,
                world_db_obj.world_y_rows)
            self.world.layers[0, :, :] = terrain_mask
            response = {'type': 'terrain_response', 'payload': self.world.get_packet_world_payload()}

        if request == 'wall_request':
            response = {'type': 'wall_response', 'payload': ''}

        if response is None:
            return None
        return json.dumps(response)