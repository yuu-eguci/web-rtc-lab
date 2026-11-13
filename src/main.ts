import {
  VIDEO_CONSTRAINTS,
  capturePhoto,
  describeSupportedConstraints,
  shareStream,
  startCamera,
  stopVideos,
} from './camera.js';

// id と selector は index.html にある要素を指します。
const byId = <E extends HTMLElement>(id: string) => document.getElementById(id) as E;
const all = <E extends Element>(selector: string) => [...document.querySelectorAll<E>(selector)];

const actions = {
  supportedConstraints: () => {
    byId('supported-constraints').textContent = describeSupportedConstraints(navigator.mediaDevices);
  },
  startUser: () => startCamera(navigator.mediaDevices, byId<HTMLVideoElement>('video1'), VIDEO_CONSTRAINTS.user),
  takePhoto: () => {
    const dataUrl = capturePhoto(document, byId<HTMLVideoElement>('video1'));
    if (dataUrl) {
      byId<HTMLImageElement>('image-for-video1').src = dataUrl;
    }
  },
  shareUser: () => shareStream(byId<HTMLVideoElement>('video1'), all<HTMLVideoElement>('video.video1-clone')),
  startEnvironment: () =>
    startCamera(navigator.mediaDevices, byId<HTMLVideoElement>('video2'), VIDEO_CONSTRAINTS.environment),
  shareEnvironment: () => shareStream(byId<HTMLVideoElement>('video2'), all<HTMLVideoElement>('video.video2-clone')),
  startExperiment: () =>
    startCamera(navigator.mediaDevices, byId<HTMLVideoElement>('video3'), VIDEO_CONSTRAINTS.experiment),
  stop: () => stopVideos(all<HTMLVideoElement>('video')),
};

for (const button of all<HTMLButtonElement>('button[data-action]')) {
  button.addEventListener('click', async () => {
    try {
      await actions[button.dataset.action as keyof typeof actions]();
    } catch (err) {
      alert(err);
    }
  });
}
