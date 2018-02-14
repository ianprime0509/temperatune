# Temperatune

This is a WIP tuner app that runs in the browser.  Its key distinguishing
feature from the myriad of other online tuners is its support for
*[temperaments](https://en.wikipedia.org/wiki/Musical_temperament)*, which
makes it much more useful for people who want to play [early
music](https://en.wikipedia.org/wiki/Early_music) in period style or music
which does not originate in the traditional Western style (such as [Arabic
music](https://en.wikipedia.org/wiki/Arabic_music)).  Of course, Temperatune
doesn't have built-in support for all these types of music; instead, it allows
the user to define temperaments as JSON files that Temperatune understands.

However, at this stage of the project, not all of that is implemented...

## Installation

To build and run Temperatune on your own machine, you should have
[Node.js](https://nodejs.org/en/) and [NPM](https://www.npmjs.com/) installed
(NPM comes bundled with Node.js).  Then, to run the development version in a
local web browser:

```shell
$ npm start
```

To build an optimized production version:

```shell
$ npm run build
```

You will find the resulting files in the `build` directory.

## License

This is free software, distributed under the [MIT
license](https://opensource.org/licenses/MIT).
