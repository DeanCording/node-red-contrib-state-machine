# node-red-contrib-state-machine
A Node Red node that wraps around the [Javascript State Machine](https://www.npmjs.com/package/javascript-state-machine) to implement a [finite state machine](https://en.wikipedia.org/wiki/Finite-state_machine) for Node Red.

The node is configured with a number of states and triggers that will cause the node to transition from one
state to another.  At any time, the node can only be in one of the defined states and it will only transition
to another state when it receives a trigger defined for the current state.  The same trigger can be used to
cause transitions from more than one state.

Triggers that are not valid for the current state can either be ignored or cause an error to be throw that can
be caught by a Catch node..

The node will always start in the first state on the state list and will emit a message with the initial
state if the state output is set to a message property.

Global and flow context properties can be used as trigger inputs but state transitions will only occur when the node receives a message.

The current state can be set to a msg property or stored as a flow or global context property.  If the state
output is set to a msg property, that property is set in the original message and passed through, otherwise
no messages are output.

