/*****

node-red-contrib-state-machine - A Node Red node to implement a state machine using javascript-state-machine

(https://www.npmjs.com/package/java-script-state-machine)

MIT License

Copyright (c) 2018 Dean Cording  <dean@cording.id.au>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without
limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial
portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// Core dependency
const StateMachine = require('javascript-state-machine');

const util = require('util');

function camelize(label) {

  if (label.length === 0)
    return label;

  var n, result, word, words = label.split(/[_-]/);

  // single word with first character already lowercase, return untouched
  if ((words.length === 1) && (words[0][0].toLowerCase() === words[0][0]))
    return label;

  result = words[0].toLowerCase();
  for(n = 1 ; n < words.length ; n++) {
    result = result + words[n].charAt(0).toUpperCase() + words[n].substring(1).toLowerCase();
  }

  return result;
}

module.exports = function(RED) {

    function StateMachineNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        node.triggerProperty = config.triggerProperty || 'topic';
        node.triggerPropertyType = config.triggerPropertyType || 'msg';
        node.stateProperty = config.stateProperty || 'topic';
        node.statePropertyType = config.statePropertyType || 'msg';
        node.outputStateChangeOnly = config.outputStateChangeOnly;
        node.throwException = config.throwException;

        if (node.outputStateChangeOnly == undefined) node.outputStateChangeOnly = false;
        if (node.throwException == undefined) node.throwException = false;

        var states = config.states || [];
        var transitions = config.transitions || [];

        try {
            node.fsm = new StateMachine({
                init: states[0],
                transitions: transitions
            });
        } catch (e) {
            node.status({fill:"red",shape:"dot",text: e.message});
            throw(e);
        }

        node.status({fill:"green",shape:"dot",text: states[0]});

        if (node.statePropertyType === 'flow') {
            node.context().flow.set(node.stateProperty,states[0]);
        } else if (node.statePropertyType === 'global') {
            node.context().global.set(node.stateProperty,states[0]);
        }

        node.startup = function(){
            if (node.statePropertyType === 'msg') {

                msg = {};
                RED.util.setMessageProperty(msg,node.stateProperty,node.fsm.state);

                node.send(msg);
            }
        }

        RED.events.on("nodes-started", node.startup);

        node.on('close', function() {
            RED.events.removeListener("nodes-started", node.startup);
        });

        node.on('input', function(msg) {

            var trigger = RED.util.evaluateNodeProperty(node.triggerProperty,
                                                            node.triggerPropertyType,node,msg);

            var transition = false;

            if (node.fsm.can(trigger)) {
                trigger = camelize(trigger);
                node.fsm[trigger]();
                transition = true;

            } else if (node.throwException) {
                node.error("Invalid transition", msg);
                return null;
            }

            if (transition || !node.outputStateChangeOnly) {
                if (node.statePropertyType === 'msg') {
                    RED.util.setMessageProperty(msg,node.stateProperty,node.fsm.state);
                } else if (node.statePropertyType === 'flow') {
                    node.context().flow.set(node.stateProperty,node.fsm.state);
                } else if (node.statePropertyType === 'global') {
                    node.context().global.set(node.stateProperty,node.fsm.state);
                }
                node.send(msg);

                node.status({fill:"green",shape:"dot",text: node.fsm.state});
            }

        });
    }
    RED.nodes.registerType("state-machine",StateMachineNode);
};

