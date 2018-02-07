/**
 * @file Internal temperament definition and logic.
 */
import Ajv from 'ajv';

import schema from './temperaments/schema.json';

const ajv = new Ajv();
const validate = ajv.compile(schema);

/** The size of an octave in cents. */
export const OCTAVE_SIZE = 1200;

/**
 * Contains a complete description of a musical temperament.
 *
 * Users should not modify any of a Temperament's members directly, as this may
 * cause it to behave unpredictably.
 */
export default class Temperament {
  /** Construct a new Temperament from the given description. */
  constructor(description) {
    if (!validate(description)) {
      throw new TypeError(`Incorrect temperament format: ${validate.errors}`);
    }
    this.name = description.name;
    this.octaveBaseName = description.octaveBaseName;
    this.referencePitch = description.referencePitch;
    this.referenceName = description.referenceName;
    this.referenceOctave = description.referenceOctave;
    this.offsets = computeOffsets(this, description.notes);
    // The noteNames member should always be sorted in increasing order of
    // offset from the octave base.
    this.noteNames = Array.from(this.offsets.keys());
    this.noteNames.sort((a, b) => this.offsets.get(a) - this.offsets.get(b));
  }

  /**
   * Return an array of the note names defined in the temperament.
   *
   * The returned array will be sorted in increasing order of pitch, starting
   * with the octave base.
   */
  getNoteNames() {
    // We need to make a copy of the array so that the internal one doesn't get
    // changed by the caller.
    return [...this.noteNames];
  }

  /** Return the offset of the given note (relative to the reference pitch). */
  getOffset(note, octave) {
    const offset = this.offsets.get(note);
    return offset !== undefined ?
      offset + (octave - this.referenceOctave) * OCTAVE_SIZE :
      undefined;
  }

  /** Return the pitch (in Hz) of the given note. */
  getPitch(note, octave) {
    return this.referencePitch *
      2 ** (this.getOffset(note, octave) / OCTAVE_SIZE);
  }
}

/**
 * Return the "pretty" version of the given note name.
 *
 * "Pretty" means replacing elements enclosed in curly braces ({}) by
 * corresponding Unicode symbols, provided that the element is recognized.  For
 * example, '{sharp}' will be replaced by '♯'.
 *
 * Note that this function is supposed to be simple.  Curly braces do not nest,
 * and an unclosed or unrecognized element sequence will be kept verbatim in
 * the output, but without the curly braces.  Currently, there is no way to
 * escape a curly brace, but this may change later.
 */
export function prettifyNoteName(name) {
  const replacements = new Map([
    ['sharp', '♯'],
    ['flat', '♭']
  ]);

  let pretty = '';
  let element = '';
  let inElement = false;

  for (let c of name) {
    if (inElement) {
      if (c === '}') {
        pretty += replacements.has(element) ?
          replacements.get(element) :
          element;
        inElement = false;
        element = '';
      } else {
        element += c;
      }
    } else {
      if (c === '{') {
        inElement = true;
      } else {
        pretty += c;
      }
    }
  }

  pretty += element;

  return pretty;
}

/**
 * Compute the offsets list for the given temperament, using the given note
 * definitions.
 *
 * This is a convenience function to make the Temperament constructor shorter
 * and more readable.
 *
 * @returns The computed list of offsets.
 */
function computeOffsets(temperament, notes) {
  let offsets = new Map([[temperament.referenceName, 0]]);
  // A queue of note names that still need to be processed.
  let todo = [temperament.referenceName];

  while (todo.length !== 0) {
    let currentName = todo[0];
    let currentOffset = offsets.get(currentName);

    // The first possibility is that the current 'todo' note is on the
    // left-hand side of a definition, so that the note on the
    // right-hand side can be deduced.
    //
    // Symbolically, this matches a property like
    //
    // currentName: [name, offset]
    //
    // in the notes object.
    if (notes.hasOwnProperty(currentName)) {
      let [name, offset] = notes[currentName];
      // We can now use the note on the right-hand side for deduction, provided
      // it hasn't already been used (which would result in an infinite loop).
      if (name !== currentName && !offsets.has(name)) {
        todo.push(name);
      }
      defineOffset(offsets, name, currentOffset - offset);
    }

    // The second possibility is that the current 'todo' note is on the
    // right-hand side of a definition, so that the note on the
    // left-hand side can be deduced.
    //
    // Symbolically:
    //
    // name: [currentName, offset]
    Object.keys(notes)
      .filter(name => notes[name][0] === currentName)
      .forEach(name => {
        let offset = notes[name][1];

        if (name !== currentName && !offsets.has(name)) {
          todo.push(name);
        }
        defineOffset(offsets, name, currentOffset + offset);
      });

    todo.shift();
  }

  // Make sure we have offset data for all notes.
  Object.keys(notes).forEach(name => {
    if (!offsets.has(name)) {
      throw new Error(`not able to determine the pitch of '${name}'`);
    }
  });

  // Adjust the offsets around the octave base.  To start, we need to adjust
  // the octave base note itself; it should be at or below the offset of the
  // reference note, and within one octave of it.
  if (!offsets.has(temperament.octaveBaseName)) {
    throw new Error('octave base not defined as a note');
  }
  let octaveBaseOffset = offsets.get(temperament.octaveBaseName) % OCTAVE_SIZE;
  if (octaveBaseOffset > 0) {
    octaveBaseOffset -= OCTAVE_SIZE;
  }
  offsets.set(temperament.octaveBaseName, octaveBaseOffset);
  // Now, we ensure that the rest of the offsets are within one octave of the
  // base, and are positioned above it.
  offsets.forEach((offset, name) => {
    let relative = offset - octaveBaseOffset;
    relative %= OCTAVE_SIZE;
    if (relative < 0) {
      relative += OCTAVE_SIZE;
    }
    offsets.set(name, octaveBaseOffset + relative);
  });

  return offsets;
}

/**
 * Attempt to define the offset of the given note in the given map.
 *
 * @throws Will throw an error if the given offset conflicts with an existing
 * one.
 */
function defineOffset(map, note, offset) {
  if (map.has(note) && map.get(note) !== offset) {
    throw new Error(`conflicting definition for '${note}' found`);
  }
  map.set(note, offset);
}
