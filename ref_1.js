import define1 from "./ref_6.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([
    ["HeadRoomTheDepartmentofChemistryGlassblowingShop.mp4.mp4",new URL("./files/HeadRoom",import.meta.url)],
    ["chromium@1.png",new URL("./files/chromium@1",import.meta.url)],
    ["firefox@1.png",new URL("./files/firefox@1",import.meta.url)],
    ["t-rex-roar.mp3",new URL("./files/t-rex-roar",import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){return(
md`# Detached video controls

An input to play, pause and change the current time of a video.

> Browsers provide controls to play, pause, or move into a video, but they are embedded into the video object. When a video is used as a texture for a 2D or 3D canvas (through a HTMLVideoElement object), you don't have access to these controls. With \`videoControls\`, you can remotely control the video behavior.

Use:

~~~js
import { videoControls } from '@severo/detached-video-controls'
~~~

`
)});
  main.variable(observer("viewof currentTime")).define("viewof currentTime", ["videoControls","video"], function(videoControls,video){return(
videoControls(video)
)});
  main.variable(observer("currentTime")).define("currentTime", ["Generators", "viewof currentTime"], (G, _) => G.input(_));
  main.variable(observer()).define(["md"], function(md){return(
md`## Examples`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Create a video element, and pass it as an argument to videoControls. The native video controls and the videoControls element are synchronized.`
)});
  main.variable(observer("video")).define("video", ["md","videoUrl"], function(md,videoUrl){return(
md`<video src=${videoUrl} height=300 controls />`
)});
  main.variable(observer()).define(["videoControls","video"], function(videoControls,video){return(
videoControls(video)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Note that two controls are bound to the same video.

The value is updated on every \`currentTime\` event of the video.`
)});
  main.variable(observer()).define(["currentTime"], function(currentTime){return(
currentTime
)});
  main.variable(observer()).define(["md"], function(md){return(
md`The flying cinema demo uses an internal video element, with no control to pause, play or change the time. With an external videoControls elements, you get access to these actions.`
)});
  main.variable(observer()).define(["flyingCinema"], function(flyingCinema){return(
flyingCinema
)});
  main.variable(observer()).define(["videoControls","flyingCinema"], function(videoControls,flyingCinema){return(
videoControls(flyingCinema.querySelector('video'))
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Note that despite its name, videoControls works with any [HTMLMediaElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement) object. For example, listen to the sound of a T-Rex:`
)});
  main.variable(observer("audio")).define("audio", ["html","audioUrl"], function(html,audioUrl){return(
html`<audio controls src="${audioUrl}">`
)});
  main.variable(observer()).define(["videoControls","audio"], function(videoControls,audio){return(
videoControls(audio)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Secondary media elements can also be controlled (and approximately synchronized).`
)});
  main.variable(observer()).define(["videoControls","video","flyingCinema"], function(videoControls,video,flyingCinema){return(
videoControls(video, {
  secondaryMediaElements: [
    { mediaElement: flyingCinema.querySelector('video'), timeOffset: 3 }
  ]
})
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## A note on native video controls

The HTML \`<video>\` element natively comes with embedded controls to play, pause, or move to a given time. 

Controls are hidden by default if the \`controls\` attribute has not been set.

`
)});
  main.variable(observer()).define(["md","FileAttachment"], async function(md,FileAttachment){return(
md`The controls implementation depends on the browser.

<figure>
    <img src="${await FileAttachment("firefox@1.png").url()}"
         width="1080"
         alt="Screenshot of the video controls in Firefox">
    <figcaption>Video controls in Firefox</figcaption>
</figure>
<figure>
    <img src="${await FileAttachment("chromium@1.png").url()}"
         width="1080"
         alt="Screenshot of the video controls in Chromium">
    <figcaption>Video controls in Chromium</figcaption>
</figure>
`
)});


  main.variable(observer()).define(["md"], function(md){return(
md`### Changelog

- 2021/03/14: add a .dispose() method to free resources and detach the videoControls from the media elements
- 2020/11/15: add secondary media elements
- 2020/11/04: creation

### TODO

- Maybe extract the "secondary media elements", and instead create a "one way bind" function. Beware the loops.
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`### Data`
)});
  main.variable(observer("videoUrl")).define("videoUrl", ["FileAttachment"], async function(FileAttachment){return(
await FileAttachment(
  "HeadRoomTheDepartmentofChemistryGlassblowingShop.mp4.mp4"
).url()
)});
  main.variable(observer("audioUrl")).define("audioUrl", ["FileAttachment"], async function(FileAttachment){return(
await FileAttachment("t-rex-roar.mp3").url()
)});
  const child1 = runtime.module(define1);
  main.import("flyingCinema", child1);
  main.variable(observer()).define(["md"], function(md){return(
md`### Code`
)});
  main.variable(observer("videoControls")).define("videoControls", ["html","formatTime"], function(html,formatTime){return(
function videoControls(mediaElement, { secondaryMediaElements = [] } = {}) {
  // --- Options
  const sliderWidth = 180;
  const sliderStep = 0.01; // in seconds

  // --- DOM

  // Control
  const control = html`<form style="font: 12px var(--sans-serif); font-variant-numeric: tabular-nums; display: flex; height: 33px; align-items: center;">`;

  // Button
  const buttonName = 'play';
  const button = html`<button name=${buttonName} type=button style="margin-right: 0.4em; width: 5em;"></button>`;
  control.appendChild(button);

  // Slider and output
  const sliderInput = html`<input name=i type=range min=0 max=${mediaElement.duration} value=${mediaElement.currentTime} step=${sliderStep} style="width: ${sliderWidth}px;">`;
  const sliderOutput = html`<output name=o style="margin-left: 0.4em;">`;
  const sliderLabel = html`<label style="display: flex; align-items: center;">`;
  sliderLabel.appendChild(sliderInput);
  sliderLabel.appendChild(sliderOutput);
  control.appendChild(sliderLabel);

  // --- State
  // the state is managed by mediaElement (the video)

  Object.defineProperty(control, 'value', {
    enumerable: true,
    configurable: false,
    get: () => mediaElement.currentTime,
    set: value => {
      mediaElement.pause();
      mediaElement.currentTime = value;
      onTimeUpdate();
    }
  });

  // --- Callback functions
  function onPlayPause() {
    control.play.innerText = mediaElement.paused ? 'Play' : 'Pause';
  }

  function synchronizeTime() {
    const t = mediaElement.currentTime;
    secondaryMediaElements.forEach(d => {
      d.mediaElement.currentTime = t + d.timeOffset;
    });
  }

  function onTimeUpdate() {
    const t = mediaElement.currentTime;
    if (mediaElement.paused) {
      synchronizeTime();
    }
    control.i.valueAsNumber = t;
    sliderOutput.value = `${formatTime(t)} / ${formatTime(control.i.max)}`;
    control.dispatchEvent(new CustomEvent("input", { bubbles: true }));
  }

  function onDurationChange() {
    control.i.max = "" + mediaElement.duration;
    onTimeUpdate();
  }

  function onPlayButton() {
    if (mediaElement.paused) {
      synchronizeTime();
      mediaElement.play();
      secondaryMediaElements.map(d => d.mediaElement.play());
    } else {
      mediaElement.pause();
      secondaryMediaElements.map(d => d.mediaElement.pause());
    }
    onPlayPause();
  }

  function onSliderChange() {
    mediaElement.currentTime = control.i.valueAsNumber;
  }

  // --- Events
  mediaElement.addEventListener('timeupdate', onTimeUpdate);
  mediaElement.addEventListener('durationchange', onDurationChange);
  mediaElement.addEventListener('pause', onPlayPause);
  mediaElement.addEventListener('play', onPlayPause);
  control.play.addEventListener('click', onPlayButton);
  control.i.addEventListener('input', onSliderChange);

  // --- Init
  onPlayPause();
  onDurationChange();

  // --- Clean
  control.dispose = () => {
    mediaElement.removeEventListener('timeupdate', onTimeUpdate);
    mediaElement.removeEventListener('durationchange', onDurationChange);
    mediaElement.removeEventListener('pause', onPlayPause);
    mediaElement.removeEventListener('play', onPlayPause);
    control.play.removeEventListener('click', onPlayButton);
    control.i.removeEventListener('input', onSliderChange);
  };

  return control;
}
)});
  main.variable(observer("formatTime")).define("formatTime", function(){return(
seconds => {
  const isNegative = seconds < 0;
  const sign = isNegative ? '-' : '';

  const s = Math.floor(Math.abs(seconds));

  const m = Math.floor(s / 60);
  const ss = s - m * 60;

  const h = Math.floor(m / 60);
  const mm = m - h * 60;

  if (h === 0) {
    return `${sign}${mm}:${String(ss).padStart(2, 0)}`;
  } else {
    return `${sign}${h}:${String(mm).padStart(2, 0)}:${String(ss).padStart(
      2,
      0
    )}`;
  }
}
)});
  return main;
}
