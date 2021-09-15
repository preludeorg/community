from concurrent import futures

import grpc
import argparse
import requests

import beacon_pb2
import beacon_pb2_grpc


class Handler(beacon_pb2_grpc.BeaconServicer):

    def __init__(self, operator):
        self.operator = operator

    def Handle(self, request, context):
        res = requests.post(self.operator, data=request.Beacon)
        if res.text:
            res.encoding = 'utf-8'
            return beacon_pb2.BeaconOutgoing(Beacon=res.text)


if __name__ == '__main__':
    parser = argparse.ArgumentParser('GRPC server')
    parser.add_argument('-O', '--operator', required=False, default='http://localhost:3391')
    parser.add_argument('-P', '--port', required=False, default='50051')
    args = parser.parse_args()

    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    beacon_pb2_grpc.add_BeaconServicer_to_server(Handler(args.operator), server)
    server.add_insecure_port('[::]:%s' % args.port)
    print('[*] Server now ready')
    server.start()
    server.wait_for_termination()
