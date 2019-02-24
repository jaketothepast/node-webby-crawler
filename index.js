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
        if (queue.length !== 0) {
            worker.send(queue.pop())
            console.log("queueing");
        }
    }
}


/**
 * Crawl a site
 * @param {String} site A site that we are crawling
 */
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
            let links = $("a")
            links.each((i, link) => {
                process.send({site: $(link).attr('href')})
            })
        })
        .catch((err) => {
            console.log(err)
        })
}


if (cluster.isMaster) {
    // Push all command line argument to the queue.
    process.argv.forEach((arg, index) => {
        if (index > 1)
            queue.unshift(arg)
    })

    // Fork the cluster.
    var worker = cluster.fork();

    // Register an event listener on the cluster worker (the child.)
    worker.on("message", msg => {
        if (msg.site) {
            console.log("YAY")
        }
        console.log("Received message " + msg + " from worker.")
        queue.unshift(msg.site)
    })

    // Register an exit handler with the master.
    cluster.on("exit", (worker, code, signal) => {
        console.log("Worker died.");
    })

    startQueueing(worker)
    console.log("GOT HERE")
} else {
    process.on('message', message => {
        console.log("Received message from master. " + message)
        visitSite(message)
    })
}

