var assert = require("assert");

// load appropriate npool module
var nPool = null;
try {
    nPool = require(__dirname + '/../build/Release/npool');
}
catch (e) {
    nPool = require(__dirname + '/../build/Debug/npool');
}

describe("[ queueWork() - Tests ]", function() {
    it("OK", function() {
        assert.notEqual(nPool, undefined);
    });
});

describe("queueWork() shall execute without throwing an exception when a single valid unit of work is queued.", function() {

    before(function() {
        nPool.loadFile(1, __dirname + '/resources/helloWorld.js');
        nPool.createThreadPool(2);
    });

    after(function() {
        nPool.destroyThreadPool();
        nPool.removeFile(1);
    });

    it("Executed without throwing an exception and returned valid results.", function(done) {
        var thrownException = null;
        var resultObject = null;
        var resultId = null;

        var unitOfWork = {
            workId: 1,
            fileKey: 1,
            workFunction: "sayHelloWorld",
            workParam: {
                testString: '- queueWork() - Test In Progress'
            },

            callbackFunction: function(callbackObject, workId, exceptionObject) {
                try {
                    assert.equal(thrownException, null);
                    assert.equal(callbackObject.resultString, 'Hello World - queueWork() - Test In Progress');
                    assert.equal(workId, 1);
                    assert.equal(exceptionObject, null);
                    done();
                }
                catch(exception) {
                    done(exception);
                }
            },
            callbackContext: this
        };

        try
        {
            nPool.queueWork(unitOfWork);
        }
        catch (exception) {
            thrownException = exception;
        }
    });
});

describe("queueWork() shall execute without throwing an exception when multiple valid units of work are queued.", function() {

    before(function() {
        nPool.loadFile(1, __dirname + '/resources/fibonacciModule.js');
        nPool.createThreadPool(2);
    });

    after(function() {
        nPool.destroyThreadPool();
        nPool.removeFile(1);
    });

    it("Executed all units of work without throwing an exception and returned valid results.", function(done) {
        var totalExecutions = 0;
        var thrownException = null;
        var resultObject = null;
        var resultId = null;
        var assertionException = null;

        // test for total execution count
        var executionIterations = 10;

        // make sure test ends within 5 sec
        this.timeout(5000);

        // execute the tests
        for(var i = 0; i < executionIterations; i++) {

            var unitOfWork = {
                workId: 1,
                fileKey: 1,
                workFunction: "calcFibonacciNumber",
                workParam: {
                    fibNumber: 10
                },

                callbackFunction: function(callbackObject, workId, exceptionObject) {
                    try {
                        assert.equal(thrownException, null);
                        assert.equal(callbackObject.fibCalcResult, 55);
                        assert.equal(workId, 1);
                        assert.equal(exceptionObject, null);
                    }
                    catch(exception) {
                        assertionException = exception;
                    }

                    // wait until all executions occur
                    if(++totalExecutions == 10) {
                        done(assertionException);
                    }
                },
                callbackContext: this
            };

            try
            {
                nPool.queueWork(unitOfWork);
            }
            catch (exception) {
                thrownException = exception;
            }
        }
    });
});

describe("queueWork() shall execute without throwing an exception when a using sub-modules.", function() {

    before(function() {
        nPool.loadFile(1, __dirname + '/resources/subModuleWorker.js');
        nPool.createThreadPool(2);
    });

    after(function() {
        nPool.destroyThreadPool();
        nPool.removeFile(1);
    });

    it("Executed without throwing an exception and returned valid results with a constructor sub-module.", function(done) {
        var thrownException = null;
        var resultObject = null;
        var resultId = null;

        var unitOfWork = {
            workId: 1,
            fileKey: 1,
            workFunction: "executeSubModuleFunction",
            workParam: {
                fruitArray: [
                    {
                        name: "apple",
                        color: "red"
                    },
                    {
                        name: "strawberry",
                        color: "red"
                    },
                    {
                        name: "banana",
                        color: "yellow"
                    }
                ]
            },

            callbackFunction: function(callbackObject, workId, exceptionObject) {
                try {
                    assert.equal(exceptionObject, null);
                    assert.equal(thrownException, null);
                    assert.equal(Array.isArray(callbackObject.origFruitArray), true);
                    assert.equal(Array.isArray(callbackObject.fruitNames), true);
                    assert.equal(callbackObject.fruitCount, 3);
                    assert.equal(workId, 1);
                    done();
                }
                catch(exception) {
                    done(exception);
                }
            },
            callbackContext: this
        };

        try
        {
            nPool.queueWork(unitOfWork);
        }
        catch (exception) {
            thrownException = exception;
        }
    });

    it("Executed without throwing an exception and returned valid results with a non-constructor sub-module.", function(done) {
        var thrownException = null;
        var resultObject = null;
        var resultId = null;

        var unitOfWork = {
            workId: 1,
            fileKey: 1,
            workFunction: "executeNotConstructorSubModuleFunction",
            workParam: {},

            callbackFunction: function(callbackObject, workId, exceptionObject) {
                try {
                    assert.equal(exceptionObject, null);
                    assert.equal(thrownException, null);
                    assert.equal(callbackObject.resultString, "Test function successfully called!");
                    assert.equal(workId, 1);
                    done();
                }
                catch(exception) {
                    done(exception);
                }
            },
            callbackContext: this
        };

        try
        {
            nPool.queueWork(unitOfWork);
        }
        catch (exception) {
            thrownException = exception;
        }
    });
});
