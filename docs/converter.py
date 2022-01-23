import glob
import os
import yaml


def strip_yml(path):
    if path and os.path.isfile(path):
        with open(path, encoding='utf-8') as seed:
            return next(yaml.load_all(seed, Loader=yaml.FullLoader))
    return ''


def build_markdown(data):
    try:
        mitre = next(iter(data['resources']['links'].items()))
    except:
        mitre = ('N/A', 'N/A')

    md = '''
# %s

---

#### Metadata

- *Prelude ID*: %s
- *MITRE Technique ID*: [%s](%s)

---
''' % (data['name'], data['id'], mitre[0], mitre[1])
    for (k, v) in data['blocks'].items():
        md += '''
### %s

---

%s
''' % (k, v.replace('\n', ''))
    return md


def convert():
    for filename in glob.iglob('%s/procedures/**/*.yml' % os.getcwd(), recursive=True):
        blob = build_markdown(strip_yml(filename))
        os.remove(filename)
        with open(filename.replace('.yml', '.md'), 'w+') as fd:
            fd.write(blob)


def update_names():
    for filename in glob.iglob('%s/procedures/**/*.md' % os.getcwd(), recursive=True):
        with open(filename, 'r+') as fd:
            data = fd.read()
            path = ('/Users/alex/Projects/professional/ttps/%s' % os.path.relpath(filename, '%s/procedures' % os.getcwd())).replace('.md', '.yml')
            if not os.path.isfile(path):
                path = path.replace('professional', 'community')

            if os.path.isfile(path):
                yml = strip_yml(path)
                data = data.replace('Auto-Generated', yml.get('name'))
                fd.seek(0)
                fd.write(data)
                fd.truncate()


def insert_hr(data):
    new_data = []
    for line in data:
        new_data.append(line)
        if line.startswith('# ') or line.startswith('### ') or line.startswith('- *MITRE'):
            new_data.append('\n---\n')
    return new_data


def add_lines():
    for filename in glob.iglob('%s/procedures/**/*.md' % os.getcwd(), recursive=True):
        with open(filename, 'r+') as fd:
            data = insert_hr(fd.readlines())
            fd.seek(0)
            fd.write(''.join(data))
            fd.truncate()


if __name__ == '__main__':
    #convert()
    #update_names()
    add_lines()
