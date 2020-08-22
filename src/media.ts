import { useEffect, useState, RefObject } from "react";

export const largeScreen = "(min-height: 30rem) and (min-width: 25rem)";
export const smallLandscape =
  "(orientation: landscape) and (max-height: 20rem)";

/**
 * A hook to keep track of an element's dimensions. The dimensions are
 * recalculated whenever the window resizes.
 */
export const useDimensions = (
  element: RefObject<HTMLElement | null>
): { width: number; height: number } => {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (!element.current) return;

      const bounds = element.current.getBoundingClientRect();
      setWidth(bounds.width);
      setHeight(bounds.height);
    };

    // Call the function once to get the initial size
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [element]);

  return { width, height };
};
