import subprocess
from ruamel.yaml import YAML
from datetime import datetime


def update_ttp(filename):
    yaml = YAML()
    ttp = yaml.load(open(filename))
    ttp['metadata']['release_date'] = datetime.utcnow().date()
    yaml.dump(ttp, open(filename, 'w'))


if __name__ == '__main__':
    results = subprocess.run(['git', 'diff-tree', '--no-commit-id', '--name-only', '-r', 'HEAD'], cwd='./', capture_output=True)
    modified_files = results.stdout.decode('utf-8').rstrip().split('\n')
    for file in modified_files:
        print(file + '\n')
        if file.endswith('.yml') and file != '.travis.yml':
            update_ttp(filename=file)
