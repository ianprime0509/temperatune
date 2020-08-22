# Temperatune

Temperatune is a simple tuner app that runs in the browser. Its key
distinguishing feature from the myriad of other online tuners is its support
for _[temperaments](https://en.wikipedia.org/wiki/Musical_temperament)_, which
makes it much more useful for people who want to play [early
music](https://en.wikipedia.org/wiki/Early_music) in period style or music
which does not originate in the traditional Western style (such as [Arabic
music](https://en.wikipedia.org/wiki/Arabic_music)). Of course, Temperatune
doesn't have built-in support for all these types of music; instead, it allows
the user to define temperaments as JSON files that Temperatune understands.

## Browser support

I currently test Temperatune in the browsers I have access to, namely, Firefox
and Chrome for Linux and Chrome for Android. However, it should work on any
modern browser (meaning anything except Internet Explorer), and I hope to
eventually find ways to test on more browsers.

## Installation

To build and run Temperatune on your own machine, you should have
[Node.js](https://nodejs.org/en/) and [NPM](https://www.npmjs.com/) installed
(NPM comes bundled with Node.js). Then, to run the development version in a
local web browser:

```shell
$ npm start
```

To build an optimized production version:

```shell
$ npm run build
```

You will find the resulting files in the `build` directory.

## User-defined temperaments

The part of Temperatune that handles temperament definitions is actually a
separate module, called simply
"[temperament](https://git.ianjohnson.xyz/temperament)". Please see its
[README](https://git.ianjohnson.xyz/temperament/tree/README.md) for detailed
usage on how to write your own temperaments or how to use the same backend in
your own project. For your reference, the JSON files corresponding to the
built-in temperaments can be found under the `src/temperaments` directory of
this project.

## License

This is free software, distributed under the [MIT
license](https://opensource.org/licenses/MIT).
