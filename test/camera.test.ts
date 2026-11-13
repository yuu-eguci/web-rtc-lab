// Unit tests for src/camera.ts.
// These use fake streams and fake elements, so they prove the logic only, not real camera behavior.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  capturePhoto,
  describeSupportedConstraints,
  shareStream,
  startCamera,
  stopVideos,
} from '../src/camera.ts';

// 偽物は使う部分だけを実装するので、 DOM の型には as unknown as で合わせます。
type FakeTrack = { stopped: number; stop(): void };
type FakeStream = MediaStream & { tracks: FakeTrack[] };

const fakeTrack = (): FakeTrack => ({
  stopped: 0,
  stop() {
    this.stopped += 1;
  },
});

const fakeStream = (tracks = [fakeTrack()]) => ({ tracks, getTracks: () => tracks }) as unknown as FakeStream;

const fakeVideo = (props: Partial<HTMLVideoElement> = {}) => ({ srcObject: null, ...props }) as HTMLVideoElement;

const fakeMediaDevices = (props: Partial<MediaDevices>) => props as MediaDevices;

describe('startCamera', () => {
  it('requests a video-only stream and attaches it to the video', async () => {
    const stream = fakeStream();
    const calls: (MediaStreamConstraints | undefined)[] = [];
    const mediaDevices = fakeMediaDevices({
      getUserMedia: async (constraints) => {
        calls.push(constraints);
        return stream;
      },
    });
    const video = fakeVideo();

    const started = await startCamera(mediaDevices, video, { facingMode: 'user' });

    assert.equal(started, true);
    assert.equal(video.srcObject, stream);
    assert.deepEqual(calls, [{ audio: false, video: { facingMode: 'user' } }]);
  });

  it('does not open a second stream when the video is already playing one', async () => {
    const existing = fakeStream();
    const mediaDevices = fakeMediaDevices({
      getUserMedia: async () => assert.fail('getUserMedia must not be called'),
    });
    const video = fakeVideo({ srcObject: existing });

    const started = await startCamera(mediaDevices, video, { facingMode: 'user' });

    assert.equal(started, false);
    assert.equal(video.srcObject, existing);
  });

  it('stops the late stream when another one was attached while waiting, e.g. on a double click', async () => {
    const first = fakeStream();
    const second = fakeStream();
    const pending = [first, second];
    const mediaDevices = fakeMediaDevices({ getUserMedia: async () => pending.shift()! });
    const video = fakeVideo();

    const results = await Promise.all([
      startCamera(mediaDevices, video, {}),
      startCamera(mediaDevices, video, {}),
    ]);

    assert.deepEqual(results, [true, false]);
    assert.equal(video.srcObject, first);
    assert.equal(first.tracks[0].stopped, 0);
    assert.equal(second.tracks[0].stopped, 1);
  });

  it('propagates getUserMedia errors such as a denied permission', async () => {
    const mediaDevices = fakeMediaDevices({
      getUserMedia: async () => {
        throw new Error('NotAllowedError');
      },
    });
    const video = fakeVideo();

    await assert.rejects(startCamera(mediaDevices, video, {}), /NotAllowedError/);
    assert.equal(video.srcObject, null);
  });
});

describe('shareStream', () => {
  it('attaches the source stream to every target video', () => {
    const stream = fakeStream();
    const source = fakeVideo({ srcObject: stream });
    const targets = [fakeVideo(), fakeVideo()];

    shareStream(source, targets);

    assert.deepEqual(
      targets.map((video) => video.srcObject),
      [stream, stream],
    );
  });
});

describe('stopVideos', () => {
  it('stops every track once and detaches all videos, including clones', () => {
    const track = fakeTrack();
    const stream = fakeStream([track]);
    const videos = [fakeVideo({ srcObject: stream }), fakeVideo({ srcObject: stream }), fakeVideo()];

    stopVideos(videos);

    assert.equal(track.stopped, 1);
    assert.deepEqual(
      videos.map((video) => video.srcObject),
      [null, null, null],
    );
  });
});

describe('capturePhoto', () => {
  const fakeDocument = () => {
    const canvas = {
      width: 0,
      height: 0,
      drawn: null as unknown[] | null,
      getContext: () => ({
        drawImage: (...args: unknown[]) => {
          canvas.drawn = args;
        },
      }),
      toDataURL: (type: string) => `data:${type};base64,AAAA`,
    };
    return { canvas, createElement: () => canvas } as unknown as Document & { canvas: typeof canvas };
  };

  it('draws the frame at the intrinsic video size and returns a JPEG data URL', () => {
    const doc = fakeDocument();
    const video = fakeVideo({ srcObject: fakeStream(), videoWidth: 1280, videoHeight: 720 });

    const dataUrl = capturePhoto(doc, video);

    assert.equal(dataUrl, 'data:image/jpeg;base64,AAAA');
    assert.equal(doc.canvas.width, 1280);
    assert.equal(doc.canvas.height, 720);
    assert.deepEqual(doc.canvas.drawn, [video, 0, 0, 1280, 720]);
  });

  it('returns null when the video has no frame yet', () => {
    const doc = fakeDocument();
    const video = fakeVideo({ videoWidth: 0, videoHeight: 0 });

    assert.equal(capturePhoto(doc, video), null);
    assert.equal(doc.canvas.drawn, null);
  });
});

describe('describeSupportedConstraints', () => {
  it('formats the supported constraints as JSON', () => {
    const mediaDevices = fakeMediaDevices({
      getSupportedConstraints: () => ({ facingMode: true, aspectRatio: true }),
    });

    assert.equal(describeSupportedConstraints(mediaDevices), '{"facingMode":true,"aspectRatio":true}');
  });
});
