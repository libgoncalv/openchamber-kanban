// Voice dictation for the description field, fully local: the host captures
// the microphone (frames are sandboxed and cannot call getUserMedia
// themselves), the guest accumulates the samples, then downsamples to 16 kHz
// Int16 PCM and streams base64 chunks to the local service, which runs the
// Parakeet STT model with sherpa-onnx. Nothing leaves the machine.
//
// State machine: idle → recording → transcribing → idle. The second mic tap
// stops the capture — the host's red "using your microphone" indicator goes
// away at that instant — and starts transcription. A separate discard path
// drops the partial audio. Work abandoned mid-flight (discard, dispose) never
// publishes: a generation counter makes stale continuations inert.
import type { GuestMicrophone, GuestMicrophoneEndReason, HostClient } from '@openchamber/sdk';
import { MAX_CLIP_SECONDS, TARGET_SAMPLE_RATE, prepareClipChunks } from '../ui/speech.ts';

export type DictationState = 'idle' | 'recording' | 'transcribing';

export type DictationView = {
  state: DictationState;
  /** Seconds recorded so far (only meaningful while recording). */
  seconds: number;
};

export type DictationHandlers = {
  onView: (view: DictationView) => void;
  /** Recognized text; '' is possible (silence). */
  onText: (text: string) => void;
  onNotice: (body: string, kind: 'info' | 'error') => void;
};

export type DictationHost = Pick<HostClient, 'openMicrophone' | 'serviceRequest'>;

export type DictationController = {
  readonly state: DictationState;
  /** Begin recording (idle) or stop recording and transcribe (recording). */
  toggle: (handlers: DictationHandlers) => void;
  /** Drop whatever is in progress and close the microphone. */
  discard: () => void;
  dispose: () => void;
};

const friendlyMicrophoneError = (error: unknown): string => {
  if (error instanceof Error && 'code' in error) {
    const code = (error as { code?: string }).code;
    if (code === 'DENIED') return 'Microphone access was denied. Allow it when OpenChamber asks again.';
    if (code === 'UNSUPPORTED') return 'This OpenChamber host cannot share the microphone with extensions.';
    if (code === 'NOT_FOUND') return 'No input microphone was found on this device.';
  }
  return `Could not start the microphone: ${error instanceof Error ? error.message : String(error)}`;
};

/** Why the host stopped a capture it started (grant withdrawn, device gone). */
const END_MESSAGES: Record<GuestMicrophoneEndReason, string> = {
  'revoked': 'Microphone access was withdrawn; recording stopped.',
  'device-lost': 'The microphone went away; recording stopped.',
};

type ServiceAnswer = { status: number; body: string };

const callService = async (
  host: DictationHost,
  method: 'GET' | 'POST',
  path: string,
  body?: Record<string, unknown>,
): Promise<ServiceAnswer> => {
  // Every body stays far under the wire's GUEST_REQUEST_BODY_MAX (64 000
  // characters); see speech.ts PCM_CHUNK_BYTES. serviceRequest answers within
  // a 20 s host timeout — the local recognizer decodes a clip of the record
  // cap well under that once loaded (first use pays the model load).
  const result = await host.serviceRequest({
    method,
    path,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: result.status, body: result.body };
};

const parseJson = (body: string): Record<string, unknown> | null => {
  try {
    const parsed: unknown = JSON.parse(body);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
};

const requireOk = (answer: ServiceAnswer, what: string): Record<string, unknown> => {
  if (answer.status !== 200) {
    const detail = parseJson(answer.body)?.error;
    throw new Error(`${what}: ${typeof detail === 'string' ? detail : `service answered ${answer.status}`}`);
  }
  const parsed = parseJson(answer.body);
  if (!parsed) throw new Error(`${what}: service answered unusable JSON`);
  return parsed;
};

/** One active capture session, dropped on stop/discard/host-side end. */
type Capture = {
  mic: GuestMicrophone;
  context: AudioContext;
  source: MediaStreamAudioSourceNode;
  processor: ScriptProcessorNode;
  destination: MediaStreamAudioDestinationNode;
  startedAt: number;
  timer: ReturnType<typeof setInterval> | null;
  removeEnded: () => void;
};

/**
 * Builds one dictation controller per detail-dialog mount. `supported` comes
 * from the board's `ready.features.microphone`; when false the UI hides the
 * mic button entirely.
 */
export const createDictation = (host: DictationHost, options: { supported: boolean }): DictationController => {
  let generation = 0;
  let state: DictationState = 'idle';
  let handlers: DictationHandlers | null = null;
  let capture: Capture | null = null;
  let chunks: Float32Array[] = [];
  let transcribeClipId: string | null = null;

  const seconds = () => (capture === null ? 0 : Math.floor((Date.now() - capture.startedAt) / 1000));

  const publish = () => {
    handlers?.onView({ state, seconds: seconds() });
  };

  const setState = (next: DictationState) => {
    state = next;
    publish();
  };

  const stopCapture = () => {
    const active = capture;
    capture = null;
    chunks = [];
    if (!active) return;
    if (active.timer !== null) clearInterval(active.timer);
    active.processor.onaudioprocess = null;
    try {
      active.processor.disconnect();
      active.source.disconnect();
      active.destination.disconnect();
    } catch {
      // Nodes may already be gone with a closed context; not fatal.
    }
    // Stops host-side capture immediately: the red indicator goes away here.
    active.mic.close();
    active.removeEnded();
    void active.context.close().catch(() => undefined);
  };

  /** Concatenate the captured chunks, clamped to the record cap. */
  const collect = (sampleRate: number): Float32Array => {
    let total = 0;
    for (const chunk of chunks) total += chunk.length;
    const samples = new Float32Array(Math.min(total, Math.round(MAX_CLIP_SECONDS * sampleRate)));
    let offset = 0;
    for (const chunk of chunks) {
      if (offset >= samples.length) break;
      const take = Math.min(chunk.length, samples.length - offset);
      samples.set(chunk.subarray(0, take), offset);
      offset += take;
    }
    return samples;
  };

  const transcribe = async (clip: { samples: Float32Array; sampleRate: number }, mine: number): Promise<void> => {
    setState('transcribing');
    try {
      const { chunks: encoded, sampleRate } = prepareClipChunks(clip.samples, clip.sampleRate);
      if (encoded.length === 0) throw new Error('no audio captured');
      const begun = requireOk(await callService(host, 'POST', '/transcribe/begin', { sampleRate }), 'The dictation service refused to start');
      const id = begun.id;
      if (typeof id !== 'string') throw new Error('The dictation service answered no clip id');
      transcribeClipId = id;
      for (const pcm16 of encoded) {
        if (mine !== generation || state !== 'transcribing') return;
        requireOk(await callService(host, 'POST', '/transcribe/append', { id, pcm16 }), 'Uploading the recording failed');
      }
      if (mine !== generation || state !== 'transcribing') return;
      const finished = requireOk(await callService(host, 'POST', '/transcribe/finish', { id }), 'Transcription failed');
      if (mine !== generation || state !== 'transcribing') return;
      transcribeClipId = null;
      setState('idle');
      handlers?.onText(typeof finished.text === 'string' ? finished.text : '');
    } catch (error) {
      if (mine === generation && state === 'transcribing') setState('idle');
      handlers?.onNotice(error instanceof Error ? error.message : String(error), 'error');
    }
  };

  const finish = (noteTruncated: boolean): void => {
    const active = capture;
    if (!active || state !== 'recording') return;
    const mine = generation;
    const sampleRate = active.context.sampleRate;
    const raw = collect(sampleRate);
    const truncated = noteTruncated || raw.length >= Math.round(MAX_CLIP_SECONDS * sampleRate);
    stopCapture();
    if (noteTruncated || truncated) {
      handlers?.onNotice(`Recording hit the ${MAX_CLIP_SECONDS / 60}-minute limit; the tail was cut off.`, 'info');
    }
    if (raw.length < TARGET_SAMPLE_RATE / 4) {
      setState('idle');
      handlers?.onNotice('Nothing audible was recorded — try again a bit closer to the microphone.', 'info');
      return;
    }
    void transcribe({ samples: raw, sampleRate }, mine);
  };

  const discard = (): void => {
    generation += 1;
    stopCapture();
    if (transcribeClipId !== null) {
      // Best-effort: the service expires the clip on its own if this fails.
      const id = transcribeClipId;
      transcribeClipId = null;
      void host.serviceRequest({ method: 'POST', path: '/transcribe/cancel', body: JSON.stringify({ id }) }).catch(() => undefined);
    }
    if (state !== 'idle') setState('idle');
  };

  const dispose = (): void => {
    discard();
    handlers = null;
  };

  /** Builds the audio graph for an open microphone and owns it in `capture`. */
  const attach = (mic: GuestMicrophone, context: AudioContext): void => {
    const source = context.createMediaStreamSource(mic.stream);
    // ScriptProcessor is deprecated, but it is what the SDK itself uses for
    // exactly this purpose and works in every host this page runs on. Its
    // callbacks only fire while the node is connected to something, so it
    // feeds a silent MediaStreamDestination — never the speakers.
    const processor = context.createScriptProcessor(4096, 1, 1);
    const destination = context.createMediaStreamDestination();
    processor.onaudioprocess = (event) => {
      // Web Audio reuses the channel buffer, so a copy per callback. The
      // callback stops before any state transition clears `chunks`.
      chunks.push(new Float32Array(event.inputBuffer.getChannelData(0)));
    };
    source.connect(processor);
    processor.connect(destination);
    const removeEnded = mic.onEnded((reason) => {
      if (capture !== null && capture.mic === mic) {
        discard();
        handlers?.onNotice(END_MESSAGES[reason], 'error');
      }
    });
    capture = {
      mic,
      context,
      source,
      processor,
      destination,
      startedAt: Date.now(),
      removeEnded,
      timer: setInterval(() => {
        if (capture === null || state !== 'recording') return;
        if (seconds() >= MAX_CLIP_SECONDS) {
          finish(true);
          return;
        }
        publish();
      }, 1000),
    };
  };

  const toggle = (nextHandlers: DictationHandlers): void => {
    if (!options.supported || state === 'transcribing') return;
    handlers = nextHandlers;
    if (state === 'recording') {
      finish(false);
      return;
    }
    const mine = generation;
    // The AudioContext and openMicrophone must both be created inside the
    // click's synchronous call frame — the frame's audio graph needs the
    // user's gesture, and openMicrophone builds its own context before its
    // first await. Nothing may come between this call and the click.
    const context = new AudioContext();
    void (async () => {
      let mic: GuestMicrophone;
      try {
        mic = await host.openMicrophone();
      } catch (error) {
        void context.close().catch(() => undefined);
        // The permission prompt is host-owned; DENIED and friends surface as
        // an error with a friendly wording, never a stack trace.
        if (mine === generation) handlers?.onNotice(friendlyMicrophoneError(error), 'error');
        return;
      }
      if (mine !== generation) {
        // A discard or dispose happened while the prompt was open.
        mic.close();
        void context.close().catch(() => undefined);
        return;
      }
      attach(mic, context);
      setState('recording');
    })();
  };

  return {
    get state() {
      return state;
    },
    toggle,
    discard,
    dispose,
  };
};
