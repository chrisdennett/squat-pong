//https://css-tricks.com/converting-color-spaces-in-javascript/

export function rgbObjToHSL({ r, g, b }) {
  // Then to HSL
  let red = (r /= 255);
  let green = (g /= 255);
  let blue = (b /= 255);

  let cmin = Math.min(red, green, blue);
  let cmax = Math.max(red, green, blue);
  let delta = cmax - cmin;

  let h = 0;
  let s = 0;
  let l = 0;

  if (delta == 0) h = 0;
  else if (cmax == red) h = ((green - blue) / delta) % 6;
  else if (cmax == green) h = (blue - red) / delta + 2;
  else h = (red - green) / delta + 4;

  h = Math.round(h * 60);

  if (h < 0) {
    h += 360;
  }

  l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  //   return "hsl(" + h + "," + s + "%," + l + "%)";
  return { h, s, l };
}

export function hexToHSL(H) {
  // Convert hex to RGB first
  let r = 0;
  let g = 0;
  let b = 0;

  if (H.length == 4) {
    r = "0x" + H[1] + H[1];
    g = "0x" + H[2] + H[2];
    b = "0x" + H[3] + H[3];
  } else if (H.length == 7) {
    r = "0x" + H[1] + H[2];
    g = "0x" + H[3] + H[4];
    b = "0x" + H[5] + H[6];
  }
  // Then to HSL
  r /= 255;
  g /= 255;
  b /= 255;

  let cmin = Math.min(r, g, b);
  let cmax = Math.max(r, g, b);
  let delta = cmax - cmin;

  let h = 0;
  let s = 0;
  let l = 0;

  if (delta == 0) h = 0;
  else if (cmax == r) h = ((g - b) / delta) % 6;
  else if (cmax == g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  if (h < 0) {
    h += 360;
  }

  l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return { h, s, l };
  //   return "hsl(" + h + "," + s + "%," + l + "%)";
}

// function hexToRGB(h) {
//   let r = 0,
//     g = 0,
//     b = 0;

//   // 3 digits
//   if (h.length == 4) {
//     r = "0x" + h[1] + h[1];
//     g = "0x" + h[2] + h[2];
//     b = "0x" + h[3] + h[3];

//     // 6 digits
//   } else if (h.length == 7) {
//     r = "0x" + h[1] + h[2];
//     g = "0x" + h[3] + h[4];
//     b = "0x" + h[5] + h[6];
//   }

//   return "rgb(" + +r + "," + +g + "," + +b + ")";
// }

// function RGBToHex(rgb) {
//   // Choose correct separator
//   let sep = rgb.indexOf(",") > -1 ? "," : " ";
//   // Turn "rgb(r,g,b)" into [r,g,b]
//   rgb = rgb.substr(4).split(")")[0].split(sep);

//   let r = (+rgb[0]).toString(16),
//     g = (+rgb[1]).toString(16),
//     b = (+rgb[2]).toString(16);

//   if (r.length == 1) r = "0" + r;
//   if (g.length == 1) g = "0" + g;
//   if (b.length == 1) b = "0" + b;

//   return "#" + r + g + b;
// }

// function RGBAToHexA(rgba) {
//   let sep = rgba.indexOf(",") > -1 ? "," : " ";
//   rgba = rgba.substr(5).split(")")[0].split(sep);

//   // Strip the slash if using space-separated syntax
//   if (rgba.indexOf("/") > -1) rgba.splice(3, 1);

//   for (let R in rgba) {
//     let r = rgba[R];
//     if (r.indexOf("%") > -1) {
//       let p = r.substr(0, r.length - 1) / 100;

//       if (R < 3) {
//         rgba[R] = Math.round(p * 255);
//       } else {
//         rgba[R] = p;
//       }
//     }
//   }
// }
