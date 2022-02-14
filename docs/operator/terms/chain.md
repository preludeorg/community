# What is a chain

#### Executing an organized attack

---

A chain is an unordered collection of procedures files. Think of a chain in video game terms; it is
an empty profile or shell, and it gets more powerful as you add specific abilities to it.

### TTP Tuesday

---

Every Tuesday, Prelude security engineers release a new chain in an event called TTP Tuesday. These chains
typically align to threat intelligence and are loaded into Operator automatically for Professional license 
holders. You can view past chains on our [chains website](https://chains.prelude.org).

### Build your own chain

---

You can build your own chains through the Launch Chain sidebar inside Operator. 
Design your chains on real-world threat actors (APT group) or detection rules you want to test.
Alternatively, you can build chains manually by applying a chain property to any TTP YML file manually.
Example below.

```yml
id: 4e707752-4abc-4799-9ff3-0caddc032bc2
metadata:
  license: community
  authors:
  - khyberspache
  tags: []
  chains:
  - My Custom Chain

...
```
