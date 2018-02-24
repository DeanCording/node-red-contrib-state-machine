var should = require('should');
var helper = require('node-red-node-test-helper');
var stateMachineNode = require('./state-machine.js');
var catchNode = require('node-red/nodes/core/core/25-catch.js');

var util = require('util');

var flow1 = [
    { id:"f1", type:"tab", label:"Flow 1"},
    {
        id: "c1",
        type: "catch",
        name: "",
        z: "f1",
        scope: ["n1"],
        wires: [["h1"]]
    },
    {
        id: "n1",
        type: "state-machine",
        name: "Test",
        z: "f1",
        triggerProperty: "topic",
        triggerPropertyType: "msg",
        stateProperty: "state",
        statePropertyType: "msg",
        outputStateChangeOnly: false,
        throwException: false,
        states: ["start", "state1", "state2", "state3"],
        transitions: [
            {name: "t1", from: "start", to: "state1"},
            {name: "t2", from: "state1", to: "state2"},
            {name: "t3", from: "state2", to: "state3"},
            {name: "t4", from: "state3", to: "state1"},
            {name: "r", from: "*", to: "start"}
        ],
        wires: [["h1"]]
    },
    {
        id: "h1",
        z: "f1",
        type: "helper"
    }
];

var flow1a = [
    { id:"f1", type:"tab", label:"Flow 1"},
    {
        id: "c1",
        type: "catch",
        name: "",
        z: "f1",
        scope: ["n1"],
        wires: [["h1"]]
    },
    {
        id: "n1",
        type: "state-machine",
        name: "Test",
        z: "f1",
        triggerProperty: "topic",
        triggerPropertyType: "msg",
        stateProperty: "state",
        statePropertyType: "msg",
        outputStateChangeOnly: false,
        states: ["start", "state1", "state2", "state3"],
        transitions: [
            {name: "t1", from: "start", to: "state1"},
            {name: "t2", from: "state1", to: "state2"},
            {name: "t3", from: "state2", to: "state3"},
            {name: "t4", from: "state3", to: "state1"},
            {name: "r", from: "*", to: "start"}
        ],
        wires: [["h1"]]
    },
    {
        id: "h1",
        z: "f1",
        type: "helper"
    }
];

var flow2 = [
    { id:"f1", type :"tab", label:"Flow 1"},
    {
        id: "c1",
        type: "catch",
        name: "",
        z: "f1",
        scope: ["n1"],
        wires: [["h1"]]
    },
    {
        id: "n1",
        type: "state-machine",
        name: "Test",
        z: "f1",
        triggerProperty: "topic",
        triggerPropertyType: "msg",
        stateProperty: "state",
        statePropertyType: "msg",
        outputStateChangeOnly: true,
        throwException: false,
        states: ["start","state1","state2","state3"],
        transitions: [
            {name: "t1", from: "start", to: "state1"},
            {name: "t2", from: "state1", to: "state2"},
            {name: "t3", from: "state2", to: "state3"},
            {name: "t4", from: "state3", to: "state1"},
            {name: "r", from: "*", to: "start"}
        ],
        wires: [["h1"]]
    },
    {
        id: "h1",
        z: "f1",
        type: "helper"
    }
];

var flow3 = [
    { id:"f1", type:"tab", label:"Flow 1"},
    {
        id: "c1",
        type: "catch",
        name: "",
        z: "f1",
        scope: ["n1"],
        wires: [["h1"]]
    },
    {
        id: "n1",
        type: "state-machine",
        name: "Test",
        z: "f1",
        triggerProperty: "topic",
        triggerPropertyType: "msg",
        stateProperty: "state",
        statePropertyType: "msg",
        outputStateChangeOnly: false,
        throwException: true,
        states: ["start","state1","state2","state3"],
        transitions: [
            {name: "t1", from: "start", to: "state1"},
            {name: "t2", from: "state1", to: "state2"},
            {name: "t3", from: "state2", to: "state3"},
            {name: "t4", from: "state3", to: "state1"},
            {name: "r", from: "*", to: "start"}
        ],
        wires: [["h1"]]
    },
    {
        id: "h1",
        z: "f1",
        type: "helper"
    }
];


describe('state-machine Node', function () {

  afterEach(function () {
    helper.unload();
  });

  it('should be loaded', function (done) {
    helper.load([stateMachineNode, catchNode], flow1, function () {
      var n1 = helper.getNode("n1");
      n1.should.have.property('name', 'Test');
      n1.should.have.property('triggerProperty', 'topic');
      n1.should.have.property('triggerPropertyType', 'msg');
      n1.should.have.property('stateProperty', 'state');
      n1.should.have.property('statePropertyType', 'msg');
      n1.should.have.property('outputStateChangeOnly', false);
      n1.should.have.property('throwException', false);
      n1.fsm._fsm.config.should.have.property('states').with.length(5);
      n1.fsm._fsm.config.should.have.property('transitions').with.length(6);
      done();
    });
  });

    it('backwards compatible', function (done) {
    helper.load([stateMachineNode, catchNode], flow1a, function () {
      var n1 = helper.getNode("n1");
      n1.should.have.property('name', 'Test');
      n1.should.have.property('triggerProperty', 'topic');
      n1.should.have.property('triggerPropertyType', 'msg');
      n1.should.have.property('stateProperty', 'state');
      n1.should.have.property('statePropertyType', 'msg');
      n1.should.have.property('outputStateChangeOnly', false);
      n1.should.have.property('throwException', false);
      n1.fsm._fsm.config.should.have.property('states').with.length(5);
      n1.fsm._fsm.config.should.have.property('transitions').with.length(6);
      done();
    });
  });

  it('state transitions - all output', function (done) {
    helper.load([stateMachineNode, catchNode], flow1, function () {
      var n1 = helper.getNode("n1");
      var h1 = helper.getNode("h1");

      var state;
      var outputCount = 0;
      var last = false;

      h1.on("input", function (msg) {
         msg.should.not.have.property('error');
         msg.should.have.property('state', state);
         outputCount++;
         if (last) {
            should.equal(outputCount, 22);
            done();
         }
      });

      n1.fsm.state.should.equal("start");

      state = "state1";
      n1.receive({ topic: "t1" });
      n1.fsm.state.should.equal("state1");

      n1.receive({ topic: "t1" });
      n1.fsm.state.should.equal("state1");

      n1.receive({ topic: "t3" });
      n1.fsm.state.should.equal("state1");

      n1.receive({ topic: "t4" });
      n1.fsm.state.should.equal("state1");

      n1.receive({ topic: "invalid" });
      n1.fsm.state.should.equal("state1");

      state = "state2";
      n1.receive({ topic: "t2" });
      n1.fsm.state.should.equal("state2");

      n1.receive({ topic: "t1" });
      n1.fsm.state.should.equal("state2");

      n1.receive({ topic: "t2" });
      n1.fsm.state.should.equal("state2");

      n1.receive({ topic: "t4" });
      n1.fsm.state.should.equal("state2");

      state = "state3";
      n1.receive({ topic: "t3" });
      n1.fsm.state.should.equal("state3");

      n1.receive({ topic: "t1" });
      n1.fsm.state.should.equal("state3");

      n1.receive({ topic: "t2" });
      n1.fsm.state.should.equal("state3");

      n1.receive({ topic: "t3" });
      n1.fsm.state.should.equal("state3");

      state = "state1";
      n1.receive({ topic: "t4" });
      n1.fsm.state.should.equal("state1");

      state = "start";
      n1.receive({ topic: "r" });
      n1.fsm.state.should.equal("start");

      state = "state1";
      n1.receive({ topic: "t1" });
      state = "state2";
      n1.receive({ topic: "t2" });
      n1.fsm.state.should.equal("state2");
      state = "start";
      n1.receive({ topic: "r" });
      n1.fsm.state.should.equal("start");

      state = "state1";
      n1.receive({ topic: "t1" });
      state = "state2";
      n1.receive({ topic: "t2" });
      state = "state3";
      n1.receive({ topic: "t3" });
      n1.fsm.state.should.equal("state3");
      state = "start";
      last = true;
      n1.receive({ topic: "r" });
      n1.fsm.state.should.equal("start");

    });
  });

  it('state transitions - output transition only', function (done) {
    helper.load([stateMachineNode, catchNode], flow2, function () {
      var n1 = helper.getNode("n1");
      var h1 = helper.getNode("h1");

      n1.should.have.property('outputStateChangeOnly', true);
      n1.should.have.property('throwException', false);

      var state;
      var outputCount = 0;
      var last = false;

      h1.on("input", function (msg) {
         msg.should.not.have.property('error');
         msg.should.have.property('state', state);
         outputCount++;

         if (last) {
            should.equal(outputCount, 12);
            done();
         }
    });

      n1.fsm.state.should.equal("start");

      state = "state1";
      n1.receive({ topic: "t1" });
      n1.fsm.state.should.equal("state1");

      n1.receive({ topic: "t1" });
      n1.fsm.state.should.equal("state1");

      n1.receive({ topic: "t3" });
      n1.fsm.state.should.equal("state1");

      n1.receive({ topic: "t4" });
      n1.fsm.state.should.equal("state1");

      state = "state2";
      n1.receive({ topic: "t2" });
      n1.fsm.state.should.equal("state2");

      n1.receive({ topic: "t1" });
      n1.fsm.state.should.equal("state2");

      n1.receive({ topic: "t2" });
      n1.fsm.state.should.equal("state2");

      n1.receive({ topic: "t4" });
      n1.fsm.state.should.equal("state2");

      state = "state3";
      n1.receive({ topic: "t3" });
      n1.fsm.state.should.equal("state3");

      n1.receive({ topic: "t1" });
      n1.fsm.state.should.equal("state3");

      n1.receive({ topic: "t2" });
      n1.fsm.state.should.equal("state3");

      n1.receive({ topic: "t3" });
      n1.fsm.state.should.equal("state3");

      state = "state1";
      n1.receive({ topic: "t4" });
      n1.fsm.state.should.equal("state1");

      state = "start";
      n1.receive({ topic: "r" });
      n1.fsm.state.should.equal("start");

      state = "state1";
      n1.receive({ topic: "t1" });
      state = "state2";
      n1.receive({ topic: "t2" });
      n1.fsm.state.should.equal("state2");
      state = "start";
      n1.receive({ topic: "r" });
      n1.fsm.state.should.equal("start");

      state = "state1";
      n1.receive({ topic: "t1" });
      state = "state2";
      n1.receive({ topic: "t2" });
      state = "state3";
      n1.receive({ topic: "t3" });
      n1.fsm.state.should.equal("state3");
      last = true;
      state = "start";
      n1.receive({ topic: "r" });
      n1.fsm.state.should.equal("start");


    });
  });



  it('invalid transition', function (done) {
    helper.load([stateMachineNode, catchNode], flow3, function () {
      var n1 = helper.getNode("n1");
      var h1 = helper.getNode("h1");

      var error;
      var last = false;

      n1.should.have.property('throwException', true);
      n1.should.have.property('outputStateChangeOnly', false);

      h1.on("input", function (msg) {

          if (error) {
              msg.should.have.property("error");
          } else {
              msg.should.not.have.property("error");
          }

          if (last) {
            done();
         }
      });

      n1.fsm.state.should.equal("start");

      error = false;
      n1.receive({ topic: "t1" });
      n1.fsm.state.should.equal("state1");

      error = true;
      last = true;
      n1.receive({ topic: "t1" });
      n1.fsm.state.should.equal("state1");
    });
  });


});
