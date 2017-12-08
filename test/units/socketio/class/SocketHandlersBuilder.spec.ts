import {SocketHandlersBuilder} from "../../../../src/socketio/class/SocketHandlersBuilder";
import {SocketFilters} from "../../../../src/socketio/interfaces/SocketFilters";
import {SocketReturnsTypes} from "../../../../src/socketio/interfaces/SocketReturnsTypes";
import {expect, Sinon} from "../../../tools";

describe("SocketHandlersBuilder", () => {
    describe("build()", () => {

        describe("when $onConnection hook exists", () => {
            before(() => {
                this.provider = {
                    store: {
                        get: Sinon.stub()
                    },
                    instance: {
                        $onConnection: Sinon.stub()
                    }
                };
                this.wsStub = {
                    on: Sinon.stub()
                };
                const builder: any = new SocketHandlersBuilder(this.provider);

                this.builderHandlersStub = Sinon.stub(builder, "buildHandlers");

                builder.build(this.wsStub);
                this.wsStub.on.getCall(0).args[1]("socket");
            });

            after(() => {
                this.builderHandlersStub.restore();
            });

            it("should call ws.on('connection') methode", () => {
                this.wsStub.on.should.have.been.calledWithExactly("connection", Sinon.match.func);
            });

            it("should call buildHandlers method", () => {
                this.builderHandlersStub.should.have.been.calledWithExactly("socket", this.wsStub);
            });

            it("should call $onConnection hook", () => {
                this.provider.instance.$onConnection.should.have.been.calledWithExactly("socket", this.wsStub);
            });
        });

        describe("when $onDisconnect hook exists", () => {
            before(() => {
                this.provider = {
                    store: {
                        get: Sinon.stub()
                    },
                    instance: {
                        $onDisconnect: Sinon.stub()
                    }
                };
                this.wsStub = {
                    on: Sinon.stub()
                };

                const builder: any = new SocketHandlersBuilder(this.provider);
                this.builderHandlersStub = Sinon.stub(builder, "buildHandlers");

                builder.build(this.wsStub);
                this.wsStub.on.getCall(1).args[1]("socket");
            });

            after(() => {
                this.builderHandlersStub.restore();
            });

            it("should call ws.on('connection') methode", () => {
                this.wsStub.on.should.have.been.calledWithExactly("connection", Sinon.match.func);
            });

            it("should call buildHandlers method", () => {
                this.builderHandlersStub.should.not.have.been.called;
            });

            it("should call $onDisconnect hook", () => {
                this.provider.instance.$onDisconnect.should.have.been.calledWithExactly("socket", this.wsStub);
            });
        });

    });

    describe("buildHandlers()", () => {
        before(() => {
            this.metadata = {
                handlers: {
                    testHandler: {
                        eventName: "eventName"
                    }
                }
            };
            this.provider = {
                store: {
                    get: Sinon.stub().returns(this.metadata)
                }
            };
            this.socketStub = {
                on: Sinon.stub()
            };
            const builder: any = new SocketHandlersBuilder(this.provider);
            this.invokeStub = Sinon.stub(builder, "invoke");

            builder.buildHandlers(this.socketStub, "ws");
            this.socketStub.on.getCall(0).args[1]("arg1");
        });

        it("should called socket.on() method", () => {
            this.socketStub.on.should.have.been.calledWithExactly("eventName", Sinon.match.func);
        });

        it("should called invoke method", () => {
            this.invokeStub.should.have.been.calledWithExactly(this.metadata.handlers.testHandler, ["arg1"], this.socketStub, "ws");
        });
    });

    describe("invoke()", () => {
        before(() => {
            this.metadata = {
                handlers: {
                    testHandler: {
                        methodClassName: "testHandler",
                        eventName: "eventName",
                        parameters: ["param"],
                        returns: {
                            eventName: "returnEventName",
                            type: "type"
                        }
                    }
                }
            };
            this.provider = {
                store: {
                    get: Sinon.stub().returns(this.metadata)
                },
                instance: {
                    testHandler: Sinon.stub().returns("response")
                }
            };

            const builder: any = new SocketHandlersBuilder(this.provider);
            this.buildParametersStub = Sinon.stub(builder, "buildParameters").returns(["argMapped"]);
            this.sendResponseStub = Sinon.stub(SocketHandlersBuilder as any, "sendResponse");

            builder.invoke(this.metadata.handlers.testHandler, ["arg1"], "socket", "ws");
        });
        after(() => {
            this.sendResponseStub.restore();
        });

        it("should call buildParameters", () => {
            this.buildParametersStub.should.have.been.calledWithExactly(["param"], {
                ws: "ws",
                socket: "socket",
                args: ["arg1"]
            });
        });

        it("should call the method instance", () => {
            this.provider.instance.testHandler.should.have.been.calledWithExactly("argMapped");
        });

        it("should call SocketHandlersBuilder.sendResponse method", () => {
            this.sendResponseStub.should.have.been.calledWithExactly("returnEventName", "type", "response", {
                ws: "ws",
                socket: "socket",
                args: ["arg1"]
            });
        });
    });

    describe("buildParameters()", () => {

        describe("when ARGS", () => {
            before(() => {
                this.provider = {
                    store: {
                        get: Sinon.stub().returns(this.metadata)
                    },
                    instance: {
                        testHandler: Sinon.stub().returns("response")
                    }
                };

                const builder: any = new SocketHandlersBuilder(this.provider);

                this.result = builder.buildParameters({
                    0: {
                        filter: SocketFilters.ARGS
                    }
                }, {args: ["mapValue"]});
            });

            it("should return a list of parameters", () => {
                expect(this.result).to.deep.eq([["mapValue"]]);
            });
        });

        describe("when ARGS with mapIndex", () => {
            before(() => {
                this.provider = {
                    store: {
                        get: Sinon.stub().returns(this.metadata)
                    },
                    instance: {
                        testHandler: Sinon.stub().returns("response")
                    }
                };

                const builder: any = new SocketHandlersBuilder(this.provider);

                this.result = builder.buildParameters({
                    0: {
                        filter: SocketFilters.ARGS,
                        mapIndex: 0
                    }
                }, {args: ["mapValue"]});
            });

            it("should return a list of parameters", () => {
                expect(this.result).to.deep.eq(["mapValue"]);
            });
        });

        describe("when Socket", () => {
            before(() => {
                this.provider = {
                    store: {
                        get: Sinon.stub().returns(this.metadata)
                    },
                    instance: {
                        testHandler: Sinon.stub().returns("response")
                    }
                };

                const builder: any = new SocketHandlersBuilder(this.provider);

                this.result = builder.buildParameters({
                    0: {
                        filter: SocketFilters.SOCKET
                    }
                }, {socket: "socket"});
            });

            it("should return a list of parameters", () => {
                expect(this.result).to.deep.eq(["socket"]);
            });
        });

        describe("when NSP", () => {
            before(() => {
                this.provider = {
                    store: {
                        get: Sinon.stub().returns(this.metadata)
                    },
                    instance: {
                        testHandler: Sinon.stub().returns("response")
                    }
                };

                const builder: any = new SocketHandlersBuilder(this.provider);

                this.result = builder.buildParameters({
                    0: {
                        filter: SocketFilters.NSP
                    }
                }, {ws: "nsp"});
            });

            it("should return a list of parameters", () => {
                expect(this.result).to.deep.eq(["nsp"]);
            });
        });

    });

    describe("sendResponse()", () => {
        describe("when BROADCAST", () => {
            before(() => {
                this.wsStub = {
                    emit: Sinon.stub()
                };

                (SocketHandlersBuilder as any).sendResponse(
                    "eventName",
                    SocketReturnsTypes.BROADCAST,
                    {response: "response"},
                    {ws: this.wsStub}
                );
            });
            it("should call the ws.emit method", () => {
                this.wsStub.emit.should.have.been.calledWithExactly("eventName", {response: "response"});
            });
        });
        describe("when BROADCAST_OTHERS", () => {
            before(() => {
                this.socketStub = {
                    broadcast: {
                        emit: Sinon.stub()
                    }
                };

                (SocketHandlersBuilder as any).sendResponse(
                    "eventName",
                    SocketReturnsTypes.BROADCAST_OTHERS,
                    {response: "response"},
                    {socket: this.socketStub}
                );
            });
            it("should call the socket.broadcast.emit method", () => {
                this.socketStub.broadcast.emit.should.have.been.calledWithExactly("eventName", {response: "response"});
            });
        });

        describe("when EMIT", () => {
            before(() => {
                this.socketStub = {
                    emit: Sinon.stub()
                };

                (SocketHandlersBuilder as any).sendResponse(
                    "eventName",
                    SocketReturnsTypes.EMIT,
                    {response: "response"},
                    {socket: this.socketStub}
                );
            });
            it("should call the socket.emit method", () => {
                this.socketStub.emit.should.have.been.calledWithExactly("eventName", {response: "response"});
            });
        });
    });
});