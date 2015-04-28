// load npool module
var nPool = null;
try {
    nPool = require('./../../build/Release/npool');
}
catch (e) {
    nPool = require('./../../build/Debug/npool');
}

// create thread pool and load xml parser
nPool.createThreadPool(2);
nPool.loadFile(1, './xmlParser.js');

 // for timing
var startTime = (new Date()).getTime();

// create the unit of work object
var unitOfWork = {
    workId: 1,
    fileKey: 1,
    workFunction: 'parseXmlData',
    workParam: {
        xmlData: "<note><script/><to>Tove</to><from>Jani</from><heading>Reminder</heading><body>Don't forget me this weekend!</body></note>"
    },

    callbackFunction: workCallback,
    callbackContext: this
};

// queue unit of work on thread pool
nPool.queueWork(unitOfWork);
unitOfWork.workId++;
nPool.queueWork(unitOfWork);
unitOfWork.workId++;
nPool.queueWork(unitOfWork);

// set continous timeout on main thread every 250ms
var startTime = (new Date()).getTime();
var count = 0;
(function spinForever () {
    var diffTime = (new Date()).getTime() - startTime;
    console.log("** Time since last timeout: " + diffTime + " ms");
    startTime = (new Date()).getTime();

    // continue for ~5 seconds
    if(count++ < 40) {
        setTimeout(spinForever, 250);
    }
    else {
        nPool.removeFile(1);
        nPool.destroyThreadPool();
    }
})();

// work function callback
function workCallback(parsedObject, workId, exceptionObject) {

    if(exceptionObject == null) {
        // time spent queueing work
        var totalTime = (new Date()).getTime() - startTime;
        console.log("[ Work Completed - " + totalTime + " ms ]");

        console.log('workCallback: ' + workId);
        console.log(parsedObject);    
    }
    else {
        console.log('exceptionObject:');
        console.log(exceptionObject.stackTrace);
    }
}