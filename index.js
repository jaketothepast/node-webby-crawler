/**
 * A multi-threaded nodejs web crawler utilizing a producer-consumer pattern.
 */
// TODO - setup winston.
const winston = require('winston');
const cluster = require('cluster');
const rp = require('request-promise');
const cheerio = require('cheerio');

// Global queue for queueing sites.
var queue = new Array()

function startQueueing(worker) {
    while (true) {
        if (!(queue.length == 0))
            worker.send(queue.pop())
    }
}

function visitSite(site) {
    let options = {
        method: 'GET',
        uri: site,
        // Add transform to this object to utilize cheerio.
        transform: function (body) {
            return cheerio.load(body);
        }
    }
    // Use request promise to return a promise that we process this bad boy.
    rp(options)
        .then(($) => {
            console.log($("a"))
        })
        .catch((err) => {
            console.log("An error occurred getting " + site);
        })
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