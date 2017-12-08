import {Store} from "../../../../src/core/class/Store";
import {Nsp} from "../../../../src/socketio";
import {expect} from "../../../tools";

describe("Nsp", () => {

    class Test {
    }

    before(() => {
        Nsp(Test, "test", 0);
        this.store = Store.from(Test);
    });

    it("should set metadata", () => {
        expect(this.store.get("socketIO")).to.deep.eq({
            "handlers": {
                "test": {
                    "parameters": {
                        "0": {
                            "filter": "nsp",
                            "mapIndex": undefined
                        }
                    }
                }
            }
        });
    });
});