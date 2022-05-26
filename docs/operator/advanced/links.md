# What links are

#### The atomic records of your attacks

---

When you run a chain, you're telling Operator to take the TTPs you want to run, and use whatever it's learned about your operation to generate specific requests, and execute them on an agent. One TTP can generate one, two, or up to hundreds of unique requests, based on how many ways it can fill in the open variables in each of your commands.

When run, each of those requests is captured by a `Link`: an independent unit of execution that, when in the context of the other `Links` of your operation, come together to form a `Chain`.

### Structure

---

When a request is executed by an agent, we capture as many contextual attributes about the command being run as we can, not just so we can extract data from each output, in order to sequence future TTPs in the chain currently being run, but so you can use that context try and make sense of what happened yourself, either by enriching the results you already see in your logs, SIEM, or defensive/observability platform of choice, with the inputs used to drive those results by Operator, or simply by reading over the results generated manually.

Some of these attributes are captured by the agent itself, and persisted immediately as it sends its results back to Operator (such as your raw results and the start and finish timestamps of the execution timeline). Others are attached to the `Link` after the fact, augmented to the result by Operator and HQ, right before it gets published to your outpost (such as the tactic/technique/ttp and account information).

#### Attributes

- `id`: every link has a unique id used to differentiate it from other executions, which may even share almost every other attribute in common. *(source: Operator)*
- `tag`: the users' unique account tag. *(source: Operator)*
- `operation`: every link belongs to an operation, which is the total set of every TTP, and all of the requests it generates, when when you decide to run a chain. this is the id of the operation itself. *(source: Operator)*
- `ttp`: the TTP id of the attack being executed. *(source: Operator)*
- `agent`:
    - `name`: the unique name of the agent *(source: Operator)*
    - `platform`: this is the platform agent is currently executing on, as of the moment the command ran. *(source: Agent)*
    - `metadata`: this is a generic dictionary of optional params passed from the agent to operator at the top level of its beacon. some default parameters include the username and hostname of the machine the agent is currently running on. *(source: Agent)*
- `request`: the actual request that got executed.
    - `executor`: since each TTP can be executed using a variety of different executors (ie: bash, powershell, python, etc.), we store the executor selected to run the individual instruction to help you distinguish that too. *(source: Operator)*
    - `command`: this is the raw command body that got executed by the agent's executor, after all open variables have been filled by Operator, as it determined how to run your chain. *(source: Operator)*
    - `payload`: if your TTP required a payload as part of its request, we store the specific payload name and version used. *(source: Operator)*
- `response`: this is the result of running your command. if your command provides incremental results, you'll receive multiple links that belong to the same `operation` with the same `request` body, but have different `timelines` and responses. we capture:
    - `output`: the regular output stream (stdout) of the request, which is where data gets parsed out of for downstream commands. *(source: Agent)*
    - `error`: the error stream (stderr) of the request, which is returned for diagnostic information, with no parsing and data extraction performed. *(source: Agent)*
    - `status`: the status code of the request. *(source: Agent)*
- `process`: the process ID and parent of the executed task.
    - `id`: the raw process ID. *(source: Agent)*
    - `guid`: the guid of the process (if supported, otherwise a unique identifier). *(source: Agent)*
- `timeline`: if you're trying to correlate tasks that got executed by operator with the raw results you see in your logs, one of the most important heuristics you'll depend on is the time that each event was recorded to try to tell a story of what corresponds with what. however, since timestamps as a single moment don't capture the fact that instructions can take several milliseconds to hours to run, we capture each edge of the execution to give you a full window to relate your downstream events to:
    - `generated`: the moment the command was generated in queue by Operator (relative to Operator's local time). *(source: Operator)*
    - `sent`: the moment the command was sent from Operator to the agent (relative to Operator's local time). *(source: Operator)*
    - `started`: the moment before the agent started executing your command (relative to the Agent's local time). *(source: Agent)*
    - `finished`: the moment after the command has finished execution and the agent collects your results (relative to the Agent's local time). *(source: Agent)*
    - `received`: the moment the results were received by Operator from the agent (relative to Operator's local time). *(source: Operator)*
- `facts`: after each command gets run, Operator will parse data out of it's standard output to incrementally learn more about the operation and sequence future TTPs as part of the chain being executed. we store two types of facts:
    - `input`: a list of all the facts (as key-value pairs) that were used to fill in the open variables when generating the request in question
    - `output`: a list of all the facts (also as key-value pairs) that were learned from running the command after it got executed.
- `metadata`: though we try to be exhaustive and capture as much as we can about each execution, there may be extra information that you'll want to store with each `link` for doing analysis of your own. for instance, some users may want to correlate requests by some other network interface than the one captured by default, rather than the hostname, while others may wish to tag each request with a vector clock determined by some external oracle that they have a custom agent integrated to work with, or the status of an endpoint side detection via EDR, etc. all of these use cases and more can be supported by having agents that write custom attributes to each links' metadata, which will be seamlessly passed through by Operator to your outpost/publisher of choice.