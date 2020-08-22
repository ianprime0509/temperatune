import React, { useEffect, useRef, FC } from "react";
import styled from "styled-components/macro";

import { largeScreen } from "./media";

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

  @media ${largeScreen} {
    display: block;
  }
`;

interface Ripple {
  size: number;
  alpha: number;
  wobbliness: number;
  t: number;
}

const updateCanvas = (
  canvas: HTMLCanvasElement,
  ripples: Ripple[],
  appWidth: number,
  appHeight: number
) => {
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.height, canvas.width);
  const x = canvas.width / 2 - appWidth / 2;
  const y = canvas.height / 2 - appHeight / 2;
  ctx.translate(x, y);

  for (const ripple of ripples) {
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
};

interface BackgroundProps {
  appHeight: number;
  appWidth: number;
  isActive: boolean;
  wobbliness?: number;
}

/** A nice canvas-based, animated background image. */
const Background: FC<BackgroundProps> = ({
  appHeight,
  appWidth,
  isActive,
  wobbliness = 0,
}) => {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const ripples = useRef<Ripple[]>([]);
  // This trick is to prevent the ripple update from having a dependency on the
  // wobbliness prop, since otherwise in analyser mode it would set and clear
  // the interval many times per second
  const latestWobbliness = useRef<number>(wobbliness);
  useEffect(() => {
    latestWobbliness.current = wobbliness;
  });

  useEffect(() => {
    if (!isActive) return;

    const interval = window.setInterval(() => {
      ripples.current.push({
        size: 0,
        alpha: 1,
        wobbliness: latestWobbliness.current,
        t: 0,
      });
    }, 1000 / RIPPLE_RATE);

    return () => window.clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    if (!isActive && ripples.current.length === 0) return;

    const interval = window.setInterval(() => {
      canvas.current &&
        updateCanvas(canvas.current, ripples.current, appWidth, appHeight);

      for (let i = ripples.current.length - 1; i >= 0; i--) {
        const ripple = ripples.current[i];
        ripple.size += GROW_RATE;
        ripple.alpha -= DISAPPEAR_RATE;
        ripple.wobbliness /= 1.025;
        ripple.t++;

        if (ripple.alpha <= 0) {
          ripples.current.splice(i, 1);
        }
      }
    }, 1000 / FPS);

    return () => window.clearInterval(interval);
  }, [isActive, appWidth, appHeight]);

  return <Canvas ref={canvas} aria-hidden="true" />;
};

export default Background;
