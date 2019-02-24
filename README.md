# Node Web Crawler

This project is a tool I intend to use for another personal project to collect some data. The web crawler is based on the simple concept of the producer/consumer pattern. The master process will crawl sites and pass responses to the worker process, and the worker process will do the work of running whatever analysis/collection library I plug in and pop the site from the queue.

# Plans

I have an additional library, Readability.js, which I have forked and will use to aid in the information collection process. the library will allow me to quickly gather document data, specifically articles

# TODO

1. ~~queueing~~
2. Setup a datastore -- Probably will use docker for this, some sort of docker-compose setup/
3. Tests -- Probably with Jest.
4. Docker Compose - Set up a dev environment (or environment in general) using Docker compose.
    - Services: MongoDB