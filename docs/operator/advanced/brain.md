# How the planner works

#### Intelligent Decision-Making At Scale

---

The planner is a multi-level finite state machine which determines the TTP order when a chain is deployed. The
procedures inside a chain are naturally unordered. Once deployed, it looks at the planner for a decision
every time a decision is needed. The finite state algorithm organizes all TTPs into a *kill-chain* based by ATT&CK tactic and then again by technique. Then, it executes one tactic at a time until it exhausts
all TTP files in a given chain.

### Always learning

---

When a chain executes, it collects information which Operator can learn from. As this info is
processed, it is fed back into the planner, often opening up a previously closed state. For example, say the planner
is currently busy executing decisions for a chain, which has completed the first two tactical states above,
and it is executing procedures under Discovery. If the planner learns something which can unlock a "defense evasion"
procedure, it will instruct the chain to drop out of the discovery state and into the defense evasion one in
order to do the newly discovered action.

### Continued research

---

The planner is a deep area of research for the internal team. Currently, the team is developing
more intelligent planners, which consider more than order when exiting and entering states. If
you would like more details on this area, please reach out to us.
