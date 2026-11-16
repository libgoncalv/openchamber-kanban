// Minimal ambient types for `sherpa-onnx-node` 2.0.1 (the package ships
// JSDoc typedefs only). Only what this service uses: the offline recognizer,
// configured for the local NeMo-transducer (Parakeet) model.
declare module 'sherpa-onnx-node' {
  export type OfflineRecognizerLike = {
    createStream: () => {
      acceptWaveform: (wave: { sampleRate: number; samples: Float32Array }) => void;
    };
    decode: (stream: unknown) => void;
    getResult: (stream: unknown) => { text?: string };
  };
  const sherpa: {
    OfflineRecognizer: new (config: unknown) => OfflineRecognizerLike;
  };
  export default sherpa;
}
