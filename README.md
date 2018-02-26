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

## User-defined temperaments

You can define your own temperaments using JSON files of a particular
structure.  The exact structure is verified by the [JSON
schema](http://json-schema.org/) located in `src/temperaments/schema.json`;
each item in the schema is annotated with a `description` key that explains its
purpose.

Here is an example of a temperament file describing equal temperament:

```json
{
  "name": "Equal temperament",
  "referenceName": "A",
  "referencePitch": 440,
  "referenceOctave": 4,
  "octaveBaseName": "C",
  "notes": {
    "C": ["C", 0],
    "C{sharp}": ["C", 100],
    "D": ["C{sharp}", 100],
    "E{flat}": ["D", 100],
    "E": ["E{flat}", 100],
    "F": ["E", 100],
    "F{sharp}": ["F", 100],
    "G": ["F{sharp}", 100],
    "G{sharp}": ["G", 100],
    "A": ["G{sharp}", 100],
    "B{flat}": ["A", 100],
    "B": ["B{flat}", 100]
  }
}
```

All the keys used in the above example are required.  The first key (and the
one whose purpose is most obvious) is the `name`; each temperament must have a
name, and the name must not conflict with any of the other temperaments
currently loaded into Temperatune.  For example, you could not use the above
temperament verbatim in Temperatune, since there is already a built-in
temperament named "Equal temperament".

The next three keys describe the reference note.  The reference note is
commonly the one used as a tuning pitch in an ensemble: in Western music, it is
typically A-4.  The `referenceName` key gives the name of the reference note,
which must correspond to a key in the `notes` object, and the `referenceOctave`
key specifies the octave number of the reference note.  Finally, the
`referencePitch` is the default value (in Hz) of the reference note's pitch.
The reference pitch is configurable in Temperatune, but you should provide a
reasonable default that corresponds to common usage.  For example, the
reference pitch is specified above as 440 since most modern players tune to a
reference of 440 Hz.

The `octaveBaseName` is the name of the note that should be at the bottom of
each octave, and is used for octave numbering.  The value of `octaveBaseName`
must correspond to a key in the `notes` object.  In the example above, the
`octaveBaseName` is C, so the highest C below the reference pitch will be
labelled as C-4 and the lowest C above the reference pitch will be labelled as
C-5.

Finally, the bulk of the temperament is described in the `notes` object.  The
keys in this object are note names, and the corresponding values define the
each note in terms of an offset (in
[cents](https://en.wikipedia.org/wiki/Cent_(music))) from some other note.  For
example, the entry `"F": ["E", 100]` above means that the note labelled F is
100 cents above the note labelled E.  To avoid giving redundant information,
the entry `"C": ["C", 0]` ensures that note labelled C is defined, but does not
provide any information about its pitch since that information can be derived
from the other notes.  In general, your temperament definition should have
exactly one note that is not defined relative to another note.

Conceptually, you can imagine the note information being used to deduce the
pitch of each note by starting at the reference pitch (which is already known)
and working outwards.  For example, if we have the pitch of the reference note
A, then we can immediately deduce the pitches of B♭ (100 cents above) and G♯
(100 cents below).  We can then continue this process to deduce the pitches of
B and G, and so on.

A note on octaves: an octave is defined to be 1200 cents, or a pitch ratio of
2:1.  The notes that you specify in the `notes` object are assumed to fill a
*single octave*, meaning that the definition `"C{sharp}": ["C", 1300]` is
equivalent to the one given in the example above for C♯, since 1300 - 1200
is 100.

### Note name shortcuts

For your convenience, certain special characters in note names can be replaced
by sequences enclosed in curly braces which Temperatune will convert to symbols
when displaying the name.  Currently, only `{sharp}` (corresponding to ♯) and
`{flat}` (corresponding to ♭) are recognized.  For example, the note name
`B{flat}` used in the sample above will be displayed as B♭.  Of course, it is
also possible to simply type the Unicode characters directly into the
temperament file.

## License

This is free software, distributed under the [MIT
license](https://opensource.org/licenses/MIT).
