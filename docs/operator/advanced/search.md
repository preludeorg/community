# Advanced filtering

---

Inside Operator's Launch Chain section there's a search bar to find TTPs or chains that exist inside your
application. By default, the search will only look at each TTP or chain name. However, there are advanced
filtering options available to help you discover attacks more effectively.

Two notes before we get started:
1. All searches will return a combination of TTPs and chains. Each result is tagged with which it is.
2. Each search value can only be one word. For example, you can search for "python" but not "python is great". However, you can use as multiple advanced filters.

#### Special characters

---

There are two special characters in the search: colons and spaces. 

- Colons are used to filter by property.
- Spaces will tokenize the search into "and" conditionals

### TTP search

---

When searching for TTPs, you can use the following filters:
- tactic
- technique
- author
- platform
- name
- description
- id
- command

For example, this search will return all TTPs which have a tactic=discovery and use the fact file.T1005:
```
tactic:discovery command:#{file.T1005}
```
This search will find all TTPs which were written by MITRE and that will run on MacOS:
```
author:MITRE platform:darwin
```

### Chain search

---

When searching for chains, you can use the following filters:
- id
- name
- description
