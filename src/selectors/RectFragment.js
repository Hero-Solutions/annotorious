import { SVG_NAMESPACE } from '../util/SVG';

/** 
 * Parses a W3C Web Annotation FragmentSelector conforming
 * to the Media Fragments spec. This (currently) naive 
 * implementation can only deal with well-formed xywh=pixel
 * fragments. 
 */
export const parseRectFragment = annotation => {
  const selector = annotation.selector('FragmentSelector');
  if (selector?.conformsTo.startsWith('http://www.w3.org/TR/media-frags')) {
    const { value } = selector;
    const format = value.includes(':') ? value.substring(value.indexOf('=') + 1, value.indexOf(':')) : 'pixel';

    const coords = value.includes(':') ? value.substring(value.indexOf(':') + 1) : value.substring(value.indexOf('=') + 1); 
    const [ x, y, w, h ] = coords.split(',').map(parseFloat)

    return { x, y, w, h, format };
  }
}

/** Serializes a (x, y, w, h)-tuple as Media Fragment selector **/

export const toRectFragment = (x, y, w, h, styleClass, image) => {
  if(styleClass) {
    return {
      source: image.src,
      styleClass: styleClass,
      selector: {
        type: "FragmentSelector",
        conformsTo: "http://www.w3.org/TR/media-frags/",
        value: `xywh=pixel:${x},${y},${w},${h}`
      }
    }
  } else {
    return {
      source: image.src,
      selector: {
        type: "FragmentSelector",
        conformsTo: "http://www.w3.org/TR/media-frags/",
        value: `xywh=pixel:${x},${y},${w},${h}`
      }
    }
  }
}

/** Shorthand to apply the given (x, y, w, h) to the SVG shape **/
const setXYWH = (shape, x, y, w, h) => {
  shape.setAttribute('x', x);
  shape.setAttribute('y', y);
  shape.setAttribute('width', w);
  shape.setAttribute('height',  h);
}

export const drawRectMask = (imageDimensions, x, y, w, h) => {
  const mask = document.createElementNS(SVG_NAMESPACE, 'path');
  mask.setAttribute('fill-rule', 'evenodd');
  
  const { naturalWidth, naturalHeight } = imageDimensions;
  mask.setAttribute('d', `M0 0 h${naturalWidth} v${naturalHeight} h-${naturalWidth} z M${x} ${y} h${w} v${h} h-${w} z`);

  return mask;
}

export const setRectMaskSize = (mask, imageDimensions, x, y, w, h) => {
  const { naturalWidth, naturalHeight } = imageDimensions;
  mask.setAttribute('d', `M0 0 h${naturalWidth} v${naturalHeight} h-${naturalWidth} z M${x} ${y} h${w} v${h} h-${w} z`);
}

/** 
 * Draws an SVG rectangle, either from an annotation, or an
 * (x, y, w, h)-tuple.
 */
export const drawRect = (arg1, arg2, arg3, arg4) => {
  const { x, y, w, h } = arg1.type === 'Annotation' || arg1.type === 'Selection' ?
    parseRectFragment(arg1) : { x: arg1, y: arg2, w: arg3, h: arg4 };

  const g = document.createElementNS(SVG_NAMESPACE, 'g');

  const outerRect  = document.createElementNS(SVG_NAMESPACE, 'rect');
  outerRect.setAttribute('class', 'a9s-outer');
  setXYWH(outerRect, x, y, w, h);
  g.appendChild(outerRect);

  if(annotation.target.styleClass) {
    var classes = [];
    switch(annotation.target.styleClass) {
      case 'condition-red-green':
        classes = [
          'condition-two-strokes condition-stroke-red',
          'condition-two-strokes condition-stroke-green condition-stroke-two'
        ];
        break;
      case 'condition-red-blue':
        classes = [
          'condition-two-strokes condition-stroke-red',
          'condition-two-strokes condition-stroke-blue condition-stroke-two'
        ];
        break;
      case 'condition-green-blue':
        classes = [
          'condition-two-strokes condition-stroke-green',
          'condition-two-strokes condition-stroke-blue condition-stroke-two'
        ];
        break;
      case 'condition-red-green-blue':
        classes = [
          'condition-three-strokes condition-stroke-red',
          'condition-three-strokes condition-stroke-green condition-stroke-two'
          'condition-three-strokes condition-stroke-blue condition-stroke-three'
        ];
        break;
    }
    for(var i = 0; i < classes.length; i++) {
      const outer  = document.createElementNS(SVG_NAMESPACE, 'rect');
      outer.setAttribute('class', 'a9s-outer ' + classes[i]);
      setXYWH(outer, x, y, w, h);
      g.appendChild(outer);
    }
  }

  return g;
}

/** Gets the (x, y, w, h)-values from the attributes of the SVG group **/
export const getRectSize = g => {
  const outerRect = g.querySelector('.a9s-outer');
  
  const x = parseFloat(outerRect.getAttribute('x'));
  const y = parseFloat(outerRect.getAttribute('y'));
  const w = parseFloat(outerRect.getAttribute('width'));
  const h = parseFloat(outerRect.getAttribute('height'));

  return { x, y, w, h };
}

/** Applies the (x, y, w, h)-values to the rects in the SVG group **/
export const setRectSize = (g, x, y, w, h) => {
  const outerRects = g.querySelectorAll('.a9s-outer');
  for(var i = 0; i < outerRects.length; i++) {
    setXYWH(outerRects[i], x, y, w, h);
  }
}

/** 
 * Shorthand to get the area (rectangle w x h) from the 
 * annotation's fragment selector. 
 */
export const rectArea = annotation => {
  const { w, h } = parseRectFragment(annotation);
  return w * h;
}

