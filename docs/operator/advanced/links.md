# What links are

#### The atomic records of your attacks

---

When you run a chain, you're telling Operator to take the TTPs you want to run, and use whatever it's learned about your operation to generate specific requests, and execute them on an agent. One TTP can generate one, two, or up to hundreds of unique requests, based on how many ways it can fill in the open variables in each of your commands.

When run, each of those requests is captured by a `Link`: an independent unit of execution that, when in the context of the other `Links` of your operation, come together to form a `Chain`.

### Structure

---

When a request is executed by an agent, we capture as many contextual attributes about the command being run as we can, not just so we can extract data from each output, in order to sequence future TTPs in the chain currently being run, but so you can use that context try and make sense of what happened yourself, either by enriching the results you already see in your logs, SIEM, or defensive/observability platform of choice, with the inputs used to drive those results by Operator, or simply by reading over the results generated manually.

Some of these attributes are captured by the agent itself, and persisted immediately as it sends its results back to Operator (such as your raw results and execution timeline). Others are attached to the `Link` after the fact, augmented to the result by Operator, right before it gets published to your outpost (such as the tactic/technique/ttp and account information).

#### Attributes

- **unique**: every link has a unique identifier used to differentiate it from other executions, which may even share almost every other attribute in common.
- **operation**: every link belongs to an operation, which is the total set of every TTP, and all of the requests it generates, when when you decide to run a chain.
- **agent**: we collect the name of the agent that executed the command itself, if you have multiple agents all running on the same host, you can use this value to differentiate between which agent ran what, though you'll have to be careful about naming your agents appropriately to use this value in a way that makes sense.
- **account**: we collect the account details of the user originating each request, this is an object with the following attributes:
	- `tag`: the users' unique account tag.
	- `email`: the users' email.
	- `organization_id`: the organization id that the user belongs to.
	- `group`: the users' group inside the organization.
- **platform**: since each operation can span multiple machines each running a different operating system, it's important to store the platform to help you distinguish your results at the environment level.
- **executor**: since each TTP can be executed using a variety of different executors (ie: bash, powershell, python, etc.), we store the executor selected to run the individual instruction to help you distinguish that too.
- **payload**: if your TTP required a payload as part of its request, we store the specific payload name and version used.
- **request**: this is the raw command body that got executed by the agent's executor, after all open variables have been filled by Operator, as it determined how to run your chain.
- **response**: this is the result of running your command. if your command provides incremental results, you'll receive multiple links that belong to the same `operation` with the same `request` body, but have different `timelines` and responses. we capture:
	- `stdout`: the regular output stream of the request, which is where data gets parsed out of for downstream commands.
	- `stderr`: the error stream of the request, which is returned for diagnostic information, with no parsing and data extraction performed.
- **status**: the status code of the request.
- **pid**: the process ID of the executed task.
- **timeline**: if you're trying to correlate tasks that got executed by operator with the raw results you see in your logs, one of the most important heuristics you'll depend on is the time that each event was recorded to try to tell a story of what corresponds with what. however, since timestamps as a single moment don't capture the fact that instructions can take several milliseconds to hours to run, we capture each edge of the execution to give you a full window to relate your downstream events to:
	- `start`: the moment before the agent started executing your command.
	- `end`: the moment after the command has finished execution and the agent collects your results.
- **username**: this is the system level account that the agent used to execute the command: whether impersonated or not, this will help you determine, among other things, the privileges and access levels that the agent had access to when executing each command.
- **hostname**: this is the network hostname of the machine the agent is currently executing on, as of the moment the command ran.
- **ttp**: the TTP id of the attack being executed
- **tactic**: the TTP's tactic
- **technique**: the TTP's technique
- **facts**: after each command gets run, Operator will parse data out of it's standard output to incrementally learn more about the operation and sequence future TTPs as part of the chain being executed. we store two types of facts:
	- `input`: a list of all the facts (as key-value pairs) that were used to fill in the open variables when generating the request in question
	- `output`: a list of all the facts (also as key-value pairs) that were learned from running the command after it got executed.
- **metadata**: though we try to be exhaustive and capture as much as we can about each execution, there may be extra information that you'll want to store with each `link` for doing analysis of your own. for instance, some users may want to correlate requests by the MAC address or internal IP of the host the agent is running on, rather than the hostname, while others may wish to tag each request with a vector clock determined by some external oracle that they have a custom agent integrated to work with. all of these use cases and more can be supported by having agents that write custom attributes to each links' metadata, which will be seamlessly passed through by Operator to your outpost/publisher of choice.