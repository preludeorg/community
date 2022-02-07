
# How linking works

#### Connect procedures through dynamic link creation

---

Each executed TTP in Prelude is called a link and the full set of procedures run for an agent is known as its
chain. Prelude uses a dynamic way of chaining procedures together by linking the output of one to the input
of another through parsing TTP output for contextual Indicators of Compromise (IOC).

### Facts replace variables

---

As a TTP is executed, the output of the procedure is passed through a series of regex statements
where Prelude attempts to parse data out of the arbitrary text. These results are saved to the agent
which ran the TTP in the form of a key/value pair, called a fact. You can alternatively add your own facts to
an agent if you want to predefine knowledge. As the planner determines which TTP to run next, Operator replaces
variables inside each command (seen by the #{} syntax) with matching facts.

### Fact keys broken down

---

Fact keys have two parts: a type and a technique. The type is a tangible thing, such as "file" or "directory".
The technique can be any valid ATT&CK technique ID. Take this example fact key: file.T1005. When Prelude Operator is
given a TTP with this variable in its command, it will fill in files found (if any) from running a T1005 procedure.
If none are found, the TTP is skipped.

### OK. how can I use facts?

---

You can leverage facts by sprinkling variables throughout your procedure commands. For example, instead of
writing a procedure that looks like this:

```shell
cp /etc/hosts.conf /tmp
```

You could write it like this, which will copy any file found from running a T1005 procedure.

```shell
cp #{file.T1005} /tmp
```

### Types of facts

---

There are three types of facts in Operator:

- automatic: immutable key/value pairs tied to your app. Automatic fact keys either start with "operator" or "agent".
- discovered: these facts are parsed out of TTP responses in real time and used as input to other TTPs in your chain.
- custom: instead of relying on discovered facts, you can add custom key/value pairs to guide your chain.