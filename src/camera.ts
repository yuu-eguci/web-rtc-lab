// Camera helpers. They take mediaDevices, elements and document as arguments so they can be unit tested.

export const VIDEO_CONSTRAINTS = {
  user: { facingMode: 'user' },
  environment: { aspectRatio: 1.777777, facingMode: 'environment' },
  // iOS Safari での実験メモです (2020-11 時点。その後は再確認していません)。
  // aspectRatio: 1.77 と facingMode: 'user' の指定では env のカメラが使われました。
  // exact: 'user' では黒い部分が出ましたが、インカメラを使えました。
  experiment: { aspectRatio: { exact: 1.777777 }, facingMode: { exact: 'user' } },
} satisfies Record<string, MediaTrackConstraints>;

// srcObject を持つ要素です。このページでは MediaStream だけを付けます。
type StreamTarget = Pick<HTMLVideoElement, 'srcObject'>;

export const startCamera = async (
  mediaDevices: Pick<MediaDevices, 'getUserMedia'>,
  video: StreamTarget,
  videoConstraints: MediaTrackConstraints,
): Promise<boolean> => {
  if (video.srcObject !== null) {
    return false;
  }
  const stream = await mediaDevices.getUserMedia({ audio: false, video: videoConstraints });
  // 待機中に別のストリームが付いた場合は、新しいストリームを止めます。
  if (video.srcObject !== null) {
    stopTracks(stream);
    return false;
  }
  video.srcObject = stream;
  return true;
};

const stopTracks = (stream: MediaStream): void => {
  for (const track of stream.getTracks()) {
    track.stop();
  }
};

export const shareStream = (source: StreamTarget, targets: StreamTarget[]): void => {
  for (const target of targets) {
    target.srcObject = source.srcObject;
  }
};

export const stopVideos = (videos: StreamTarget[]): void => {
  const streams = new Set(
    videos.map((video) => video.srcObject as MediaStream | null).filter((stream) => stream !== null),
  );
  for (const stream of streams) {
    stopTracks(stream);
  }
  for (const video of videos) {
    video.srcObject = null;
  }
};

// canvas に video のフレームを描画し、 base64 の data URL として取り出します。
// base64 の prefix は dataUrl.replace(/^data:\w+\/\w+;base64,/, '') で削除できます。
export const capturePhoto = (doc: Pick<Document, 'createElement'>, video: HTMLVideoElement): string | null => {
  const { videoWidth: width, videoHeight: height } = video;
  if (!width || !height) {
    return null;
  }
  const canvas = doc.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')!.drawImage(video, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg');
};

export const describeSupportedConstraints = (mediaDevices: Pick<MediaDevices, 'getSupportedConstraints'>): string =>
  JSON.stringify(mediaDevices.getSupportedConstraints());
