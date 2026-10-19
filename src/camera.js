// Camera helpers. They take mediaDevices, elements and document as arguments so they can be unit tested.

// NOTE: iOS Safari では……
// aspectRatio: 1.77 だと env のカメラが使われてしまう。
// exact: 'user' を使うと黒いところが出るもののインカメラが使える。
export const VIDEO_CONSTRAINTS = {
  user: { facingMode: 'user' },
  environment: { aspectRatio: 1.777777, facingMode: 'environment' },
  experiment: { aspectRatio: { exact: 1.777777 }, facingMode: { exact: 'user' } },
};

export const startCamera = async (mediaDevices, video, videoConstraints) => {
  if (video.srcObject !== null) {
    return false;
  }
  const stream = await mediaDevices.getUserMedia({ audio: false, video: videoConstraints });
  // 待っている間に別のストリームが付いていたら (ボタンの連打など) 、カメラを点けっぱなしにしないよう止める。
  if (video.srcObject !== null) {
    stopTracks(stream);
    return false;
  }
  video.srcObject = stream;
  return true;
};

const stopTracks = (stream) => {
  for (const track of stream.getTracks()) {
    track.stop();
  }
};

export const shareStream = (source, targets) => {
  for (const target of targets) {
    target.srcObject = source.srcObject;
  }
};

export const stopVideos = (videos) => {
  const streams = new Set(videos.map((video) => video.srcObject).filter(Boolean));
  for (const stream of streams) {
    stopTracks(stream);
  }
  for (const video of videos) {
    video.srcObject = null;
  }
};

// canvas に video のフレームを貼り付けて、 base64 の data URL として取り出す。
// base64 の prefix を削除するなら dataUrl.replace(/^data:\w+\/\w+;base64,/, '')
export const capturePhoto = (doc, video) => {
  const { videoWidth: width, videoHeight: height } = video;
  if (!width || !height) {
    return null;
  }
  const canvas = doc.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(video, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg');
};

export const describeSupportedConstraints = (mediaDevices) =>
  JSON.stringify(mediaDevices.getSupportedConstraints());
