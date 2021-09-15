import argparse
import os
import io
import queue
import collections
import requests

from pyftpdlib.authorizers import DummyAuthorizer
from pyftpdlib.handlers import FTPHandler, FileProducer
from pyftpdlib.servers import FTPServer


if __name__ == '__main__':
    parser = argparse.ArgumentParser('FTP server')
    parser.add_argument('-O', '--operator', required=False, default='http://localhost:3391')
    parser.add_argument('-A', '--address', required=False, default='0.0.0.0')
    parser.add_argument('-U', '--user', required=False, default='user', help='Set a username')
    parser.add_argument('-P', '--password', required=False, default='password', help='Set a password')
    args = parser.parse_args()

    class Handler(FTPHandler):
        queue = collections.defaultdict(queue.SimpleQueue)

        def ftp_RETR(self, file):
            fd = io.BytesIO(self.queue[file].get(True).encode())
            setattr(fd, 'name', file)
            producer = FileProducer(fd, self._current_type)
            self.push_dtp_data(producer, isproducer=True, file=fd, cmd="RETR")
            return file

        def on_file_received(self, file):
            with self.fs.open(file, 'r') as beacon_file:
                beacon = beacon_file.read()
                res = requests.post(args.operator, data=beacon)
                res.encoding = 'utf-8'
                self.queue[file].put(res.text)

    # start server
    authorizer = DummyAuthorizer()
    authorizer.add_user(args.user, args.password, os.getcwd(), perm='rw')
    handler = Handler
    handler.authorizer = authorizer
    server = FTPServer((args.address, 21), handler)
    server.serve_forever()
