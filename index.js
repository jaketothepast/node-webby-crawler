/**
 * A multi-threaded nodejs web crawler utilizing a producer-consumer pattern.
 */

const cluster = require('cluster');

// Global queue for queueing sites.
var queue = new Array()

function startQueueing(worker) {
    while (true) {
        if (!(queue.length == 0))
            worker.send(queue.pop())
    }
}

function visitSite(site) {
    console.log("Child visiting site! " + site)
}

function startCrawler() {
    if (cluster.isMaster) {
        // Push all command line argument to the queue.
        process.argv.forEach((arg, index) => {
            if (index > 1)
                queue.unshift(arg)
        })
        
        // Fork the cluster.
        var worker = cluster.fork();

        // Register an event listener on the cluster worker (the child.)
        worker.on('message', message => {
            visitSite(message)
        })

        // Register an exit handler with the master.
        cluster.on("exit", (worker, code, signal) => {
            console.log("Worker died.");
        })

        startQueueing(worker)
    } else {
        process.on('message', message => visitSite(message))
    }
}

startCrawler()