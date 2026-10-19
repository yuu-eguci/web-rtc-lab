import {
  VIDEO_CONSTRAINTS,
  capturePhoto,
  describeSupportedConstraints,
  shareStream,
  startCamera,
  stopVideos,
} from './camera.js';

const byId = (id) => document.getElementById(id);
const all = (selector) => [...document.querySelectorAll(selector)];

const actions = {
  supportedConstraints: () => {
    byId('supported-constraints').textContent = describeSupportedConstraints(navigator.mediaDevices);
  },
  startUser: () => startCamera(navigator.mediaDevices, byId('video1'), VIDEO_CONSTRAINTS.user),
  takePhoto: () => {
    const dataUrl = capturePhoto(document, byId('video1'));
    if (dataUrl) {
      byId('image-for-video1').src = dataUrl;
    }
  },
  shareUser: () => shareStream(byId('video1'), all('video.video1-clone')),
  startEnvironment: () => startCamera(navigator.mediaDevices, byId('video2'), VIDEO_CONSTRAINTS.environment),
  shareEnvironment: () => shareStream(byId('video2'), all('video.video2-clone')),
  startExperiment: () => startCamera(navigator.mediaDevices, byId('video3'), VIDEO_CONSTRAINTS.experiment),
  stop: () => stopVideos(all('video')),
};

for (const button of all('button[data-action]')) {
  button.addEventListener('click', async () => {
    try {
      await actions[button.dataset.action]();
    } catch (err) {
      alert(err);
    }
  });
}
