/**
 * A multi-threaded nodejs web crawler utilizing a producer-consumer pattern.
 */

const cluster = require('cluster');

var queue = new Array()
queue.push("item.hello");
queue.push("Item.hi");
queue.push("another.site");

function messageWorkers(message) {
    Object.values(cluster.workers).map(worker => {
        worker.send(message)
    })
}

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
        // Fork the cluster.
        console.log("I am the master.")
        console.log("Here is my queue " + queue)
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