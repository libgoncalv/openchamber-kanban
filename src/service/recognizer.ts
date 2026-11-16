// Lazy wrapper around the local sherpa-onnx offline recognizer. The native
// module and the ~0.6 GB int8 model are loaded on the first transcribe request
// only (they are never loaded at spawn, so /health stays instant and the
// service costs nothing when dictation is never used). All paths are
// read-only; the model is not shipped with the package.
import fs from 'node:fs';
import path from 'node:path';

export type Transcriber = {
  transcribe: (samples: Float32Array, sampleRate: number) => Promise<string>;
};

/** An error whose message is safe and useful to show the user. */
export class TranscriptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TranscriptionError';
  }
}

/** Local model: NVIDIA Parakeet TDT 0.6B v2 (NeMo transducer), int8, offline. */
const MODEL_DIR = path.join(
  process.env.HOME ?? '',
  '.config', 'openchamber', 'speech-models', 'sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8',
);
const MODEL_FILES = ['encoder.int8.onnx', 'decoder.int8.onnx', 'joiner.int8.onnx', 'tokens.txt'] as const;

/** Samples below this are silence; still worth answering, but no model load. */
const MIN_SAMPLES = 1600;

type RecognizerLike = {
  createStream: () => {
    acceptWaveform: (wave: { sampleRate: number; samples: Float32Array }) => void;
  };
  decode: (stream: unknown) => void;
  getResult: (stream: unknown) => { text?: string };
};

/**
 * Builds the real sherpa-onnx transcriber. Kept behind the factory so tests
 * (and error paths) never touch the native addon: `createSherpaTranscriber`
 * resolves `sherpa-onnx-node` lazily, only when a transcribe first happens.
 */
export const createSherpaTranscriber = (
  modelDir: string = MODEL_DIR,
  loadModule: () => Promise<unknown> = async () => {
    // CommonJS package; under ESM its exports land on `.default`.
    const mod = await import('sherpa-onnx-node');
    return mod.default ?? mod;
  },
): Transcriber => {
  let recognizer: RecognizerLike | null = null;

  const modelMissing = (): string | null => {
    if (!fs.existsSync(modelDir)) return `Speech model not found: ${modelDir}`;
    const missing = MODEL_FILES.filter((file) => !fs.existsSync(path.join(modelDir, file)));
    return missing.length > 0 ? `Speech model is incomplete, missing ${missing.join(', ')} in ${modelDir}` : null;
  };

  const ensureRecognizer = async (): Promise<RecognizerLike> => {
    if (recognizer) return recognizer;
    const missing = modelMissing();
    if (missing) throw new TranscriptionError(`${missing} — voice dictation cannot start.`);
    try {
      // The module shape matches src/service/sherpa-onnx-node.d.ts.
      const sherpa = (await loadModule()) as { OfflineRecognizer: new (config: unknown) => RecognizerLike };
      recognizer = new sherpa.OfflineRecognizer({
        featConfig: { sampleRate: 16000, featureDim: 80 },
        modelConfig: {
          transducer: {
            encoder: path.join(modelDir, 'encoder.int8.onnx'),
            decoder: path.join(modelDir, 'decoder.int8.onnx'),
            joiner: path.join(modelDir, 'joiner.int8.onnx'),
          },
          tokens: path.join(modelDir, 'tokens.txt'),
          numThreads: 2,
          provider: 'cpu',
          debug: 0,
          modelType: 'nemo_transducer',
        },
      });
      return recognizer;
    } catch (error) {
      throw new TranscriptionError(`Could not start the speech model: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return {
    async transcribe(samples: Float32Array, sampleRate: number) {
      if (samples.length < MIN_SAMPLES) return '';
      const session = await ensureRecognizer();
      try {
        const stream = session.createStream();
        stream.acceptWaveform({ sampleRate, samples });
        session.decode(stream);
        return session.getResult(stream).text ?? '';
      } catch (error) {
        throw new TranscriptionError(`Transcription failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
  };
};
