/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import React, { Component } from 'react';
import styled from 'styled-components/macro';

/** The FPS to use with the background animation. */
const FPS = 20;
/** The number of ripples to create each second. */
const RIPPLE_RATE = 1;

/** The rate (in alpha per frame) at which to make the ripples disappear. */
const DISAPPEAR_RATE = 0.025;
/** The rate (in pixels per frame) at which to make the ripples grow. */
const GROW_RATE = 1;

const Canvas = styled.canvas`
  /*
   * Don't show the canvas background on small screens where it won't be
   * visible.
   */
  display: none;
  left: 0;
  position: fixed;
  top: 0;
  z-index: -100;

  @media (min-width: 500px) {
    display: block;
  }
`;

interface BackgroundProps {
  appHeight: number;
  appWidth: number;
  isActive: boolean;
  wobbliness: number;
}

interface Ripple {
  size: number;
  alpha: number;
  wobbliness: number;
  t: number;
}

/** A nice canvas-based, animated background image. */
export default class Background extends Component<BackgroundProps> {
  static defaultProps = {
    wobbliness: 0,
  };

  private canvas: HTMLCanvasElement | null;
  private ripples: Ripple[];

  constructor(props: BackgroundProps) {
    super(props);
    this.canvas = null;
    this.ripples = [];
  }

  componentDidMount() {
    window.setInterval(() => this.updateCanvas(), 1000 / FPS);
    window.setInterval(() => this.ripple(), 1000 / RIPPLE_RATE);
  }

  render() {
    return <Canvas ref={(ref) => (this.canvas = ref)} aria-hidden="true" />;
  }

  /** Produce a new ripple. */
  private ripple() {
    if (this.props.isActive) {
      this.ripples.push({
        size: 0,
        alpha: 1,
        wobbliness: this.props.wobbliness,
        t: 0,
      });
    }
  }

  private updateCanvas() {
    // Just in case the canvas isn't actually there somehow (this has happened
    // at least in development), bail out if this.canvas is null
    if (!this.canvas) return;

    this.canvas.height = window.innerHeight;
    this.canvas.width = window.innerWidth;
    const ctx = this.canvas.getContext('2d')!;
    ctx.clearRect(0, 0, this.canvas.height, this.canvas.width);
    const appWidth = this.props.appWidth;
    const appHeight = this.props.appHeight;
    const x = this.canvas.width / 2 - appWidth / 2;
    const y = this.canvas.height / 2 - appHeight / 2;
    ctx.translate(x, y);

    for (const ripple of this.ripples) {
      const x = -ripple.size;
      const y = -ripple.size;
      const width = appWidth + 2 * ripple.size;
      const height = appHeight + 2 * ripple.size;
      ctx.strokeStyle = `hsla(0, 0%, 40%, ${ripple.alpha})`;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(
        x + width / 2,
        y + ripple.wobbliness * Math.sin(ripple.t),
        x + width,
        y
      );
      ctx.quadraticCurveTo(
        x + width + ripple.wobbliness * Math.sin(ripple.t),
        y + height / 2,
        x + width,
        y + height
      );
      ctx.quadraticCurveTo(
        x + width / 2,
        y + height - ripple.wobbliness * Math.sin(ripple.t),
        x,
        y + height
      );
      ctx.quadraticCurveTo(
        x - ripple.wobbliness * Math.sin(ripple.t),
        y + height / 2,
        x,
        y
      );
      ctx.stroke();
    }
    this.updateRipples();
  }

  private updateRipples() {
    this.ripples = this.ripples
      .map((ripple) =>
        Object.assign(ripple, {
          size: ripple.size + GROW_RATE,
          alpha: ripple.alpha - DISAPPEAR_RATE,
          wobbliness: ripple.wobbliness / 1.025,
          t: ripple.t + 1,
        })
      )
      .filter((ripple) => ripple.alpha > 0);
  }
}
