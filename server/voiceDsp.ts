/**
 * Clean server-side PCM WAV Pitch, Formant & Timbre DSP for So‘zApp.
 * Uses Waveform Similarity Overlap-Add (WSOLA) + 4-point Catmull-Rom cubic
 * resampling + biquad timbre shaping so both child voice profiles maintain
 * natural 1.0x speaking speed while sounding like two genuinely distinct
 * young children ("Mitti bola" vs "Kichik qizaloq").
 */

export type ChildVoiceDspProfile = 'child_boy' | 'child_girl';

interface ParsedWav {
  sampleRate: number;
  samples: Float32Array;
}

function parsePcmWav(buf: Buffer): ParsedWav | null {
  if (buf.length < 44) return null;
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') {
    return null;
  }

  let sampleRate = 24000;
  let numChannels = 1;
  let bitsPerSample = 16;
  let dataOffset = -1;
  let dataSize = 0;

  let offset = 12;
  while (offset + 8 <= buf.length) {
    const chunkId = buf.toString('ascii', offset, offset + 4);
    const chunkSize = buf.readUInt32LE(offset + 4);
    const bodyStart = offset + 8;

    if (chunkId === 'fmt ' && bodyStart + 16 <= buf.length) {
      const audioFormat = buf.readUInt16LE(bodyStart);
      if (audioFormat !== 1) return null; // Only uncompressed PCM
      numChannels = Math.max(1, buf.readUInt16LE(bodyStart + 2));
      sampleRate = buf.readUInt32LE(bodyStart + 4);
      bitsPerSample = buf.readUInt16LE(bodyStart + 14);
    } else if (chunkId === 'data') {
      dataOffset = bodyStart;
      dataSize = Math.min(chunkSize, buf.length - bodyStart);
      break;
    }

    offset = bodyStart + chunkSize + (chunkSize % 2);
  }

  if (dataOffset < 0 || bitsPerSample !== 16 || dataSize < 4) {
    return null;
  }

  const totalFrames = Math.floor(dataSize / (2 * numChannels));
  const samples = new Float32Array(totalFrames);

  for (let i = 0; i < totalFrames; i++) {
    let sum = 0;
    for (let ch = 0; ch < numChannels; ch++) {
      const bytePos = dataOffset + (i * numChannels + ch) * 2;
      sum += buf.readInt16LE(bytePos) / 32768;
    }
    samples[i] = sum / numChannels;
  }

  return { sampleRate, samples };
}

function encodePcmWav(samples: Float32Array, sampleRate: number): Buffer {
  const dataBytes = samples.length * 2;
  const out = Buffer.allocUnsafe(44 + dataBytes);

  out.write('RIFF', 0, 'ascii');
  out.writeUInt32LE(36 + dataBytes, 4);
  out.write('WAVE', 8, 'ascii');
  out.write('fmt ', 12, 'ascii');
  out.writeUInt32LE(16, 16); // PCM fmt chunk size
  out.writeUInt16LE(1, 20); // PCM format
  out.writeUInt16LE(1, 22); // mono
  out.writeUInt32LE(sampleRate, 24);
  out.writeUInt32LE(sampleRate * 2, 28); // byteRate
  out.writeUInt16LE(2, 32); // blockAlign
  out.writeUInt16LE(16, 34); // bitsPerSample
  out.write('data', 36, 'ascii');
  out.writeUInt32LE(dataBytes, 40);

  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    out.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }

  return out;
}

/**
 * Waveform Similarity Overlap-Add (WSOLA) time-scaler.
 * Scales audio duration by `stretch` (> 1 = longer, < 1 = shorter) without altering pitch.
 */
function wsolaTimeStretch(
  input: Float32Array,
  sampleRate: number,
  stretch: number
): Float32Array {
  if (Math.abs(stretch - 1) < 0.02 || input.length < 2048) {
    return input;
  }

  const winLen = Math.round(sampleRate * 0.042); // ~1008 samples @ 24kHz
  const hopOut = Math.max(64, Math.floor(winLen / 4)); // 75% overlap
  const hopIn = hopOut / stretch;
  const searchRadius = Math.round(sampleRate * 0.0085); // ±8.5ms search

  const hann = new Float32Array(winLen);
  for (let i = 0; i < winLen; i++) {
    hann[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / winLen));
  }

  const outLen = Math.max(winLen, Math.round(input.length * stretch));
  const out = new Float32Array(outLen);
  const norm = new Float32Array(outLen);

  // Place first frame verbatim
  for (let i = 0; i < winLen && i < input.length && i < outLen; i++) {
    out[i] += input[i] * hann[i];
    norm[i] += hann[i];
  }

  let outPos = hopOut;
  let frameIdx = 1;
  let prevAnalysisStart = 0;

  while (outPos + winLen < outLen) {
    const nominalIn = Math.round(frameIdx * hopIn);
    if (nominalIn + winLen >= input.length) break;

    // Natural continuation point from the previous placed window
    const naturalStart = Math.min(
      input.length - winLen - 1,
      Math.max(0, prevAnalysisStart + hopOut)
    );

    // Check RMS energy of nominal frame; skip NCC during silence
    let energy = 0;
    for (let i = 0; i < winLen; i += 4) {
      const v = input[nominalIn + i];
      energy += v * v;
    }
    const approxRms = Math.sqrt(energy / (winLen / 4));

    let bestStart = nominalIn;
    if (approxRms > 0.01) {
      let bestCorr = -Infinity;
      const minStart = Math.max(0, nominalIn - searchRadius);
      const maxStart = Math.min(input.length - winLen - 1, nominalIn + searchRadius);

      // Compare the overlapping first half of the candidate frame against naturalStart
      const cmpLen = Math.min(hopOut * 2, winLen);
      for (let cand = minStart; cand <= maxStart; cand += 2) {
        let num = 0;
        let d1 = 0;
        let d2 = 0;
        for (let k = 0; k < cmpLen; k += 2) {
          const a = input[naturalStart + k];
          const b = input[cand + k];
          num += a * b;
          d1 += a * a;
          d2 += b * b;
        }
        const corr = num / Math.sqrt(d1 * d2 + 1e-10);
        if (corr > bestCorr) {
          bestCorr = corr;
          bestStart = cand;
        }
      }
    }

    for (let i = 0; i < winLen; i++) {
      const w = hann[i];
      out[outPos + i] += input[bestStart + i] * w;
      norm[outPos + i] += w;
    }

    prevAnalysisStart = bestStart;
    outPos += hopOut;
    frameIdx += 1;
  }

  for (let i = 0; i < outLen; i++) {
    if (norm[i] > 1e-5) {
      out[i] /= norm[i];
    }
  }

  return out;
}

/**
 * 4-point Catmull-Rom cubic resampler.
 * Reading at step `ratio > 1` raises pitch & formants by `ratio` and shortens duration by `1/ratio`.
 */
function cubicResample(input: Float32Array, ratio: number): Float32Array {
  if (Math.abs(ratio - 1) < 0.005 || input.length < 8) {
    return input;
  }
  const outLen = Math.max(8, Math.floor((input.length - 4) / ratio));
  const out = new Float32Array(outLen);

  for (let i = 0; i < outLen; i++) {
    const pos = i * ratio;
    const idx = Math.floor(pos);
    const t = pos - idx;

    const p0 = input[Math.max(0, idx - 1)];
    const p1 = input[Math.min(input.length - 1, idx)];
    const p2 = input[Math.min(input.length - 1, idx + 1)];
    const p3 = input[Math.min(input.length - 1, idx + 2)];

    const t2 = t * t;
    const t3 = t2 * t;
    out[i] =
      0.5 *
      (2 * p1 +
        (-p0 + p2) * t +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
        (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
  }

  return out;
}

function applyBiquad(
  samples: Float32Array,
  b0: number,
  b1: number,
  b2: number,
  a0: number,
  a1: number,
  a2: number
): Float32Array {
  const out = new Float32Array(samples.length);
  const invA0 = 1 / a0;
  const nb0 = b0 * invA0;
  const nb1 = b1 * invA0;
  const nb2 = b2 * invA0;
  const na1 = a1 * invA0;
  const na2 = a2 * invA0;

  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;

  for (let i = 0; i < samples.length; i++) {
    const x0 = samples[i];
    const y0 = nb0 * x0 + nb1 * x1 + nb2 * x2 - na1 * y1 - na2 * y2;
    out[i] = y0;
    x2 = x1;
    x1 = x0;
    y2 = y1;
    y1 = y0;
  }
  return out;
}

function highPass(samples: Float32Array, sr: number, freq: number, q = 0.707): Float32Array {
  const w0 = (2 * Math.PI * freq) / sr;
  const cos = Math.cos(w0);
  const alpha = Math.sin(w0) / (2 * q);
  return applyBiquad(
    samples,
    (1 + cos) / 2,
    -(1 + cos),
    (1 + cos) / 2,
    1 + alpha,
    -2 * cos,
    1 - alpha
  );
}

function peakingEq(
  samples: Float32Array,
  sr: number,
  freq: number,
  gainDb: number,
  q = 1.0
): Float32Array {
  const A = Math.pow(10, gainDb / 40);
  const w0 = (2 * Math.PI * freq) / sr;
  const cos = Math.cos(w0);
  const alpha = Math.sin(w0) / (2 * q);
  return applyBiquad(
    samples,
    1 + alpha * A,
    -2 * cos,
    1 - alpha * A,
    1 + alpha / A,
    -2 * cos,
    1 - alpha / A
  );
}

function normalizePeak(samples: Float32Array, targetPeak = 0.86): Float32Array {
  let maxAbs = 0;
  for (let i = 0; i < samples.length; i++) {
    const a = Math.abs(samples[i]);
    if (a > maxAbs) maxAbs = a;
  }
  if (maxAbs < 1e-4) return samples;
  const gain = Math.min(2.2, targetPeak / maxAbs);
  const out = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    out[i] = Math.max(-0.98, Math.min(0.98, samples[i] * gain));
  }
  return out;
}

/**
 * Shapes a raw Gemini TTS WAV buffer into one of two unmistakably distinct
 * young child voices:
 * - child_boy ("Mitti bola"): sourced from warm male voice -> shifted up ~1.62x
 *   in pitch & vocal-tract formants with WSOLA tempo restoration and sturdy ~520Hz
 *   boyish warmth (~225-245 Hz child boy voice, clearly boyish & non-adult).
 * - child_girl ("Kichik qizaloq"): sourced from light female voice -> shifted up ~1.28x
 *   in pitch & vocal-tract formants with WSOLA tempo restoration and gentle ~2.9kHz
 *   sweet child sparkle (~310-330 Hz soft innocent little girl voice).
 */
export function shapeChildVoiceWav(
  base64Wav: string,
  profile: ChildVoiceDspProfile
): string {
  try {
    const rawBuf = Buffer.from(base64Wav, 'base64');
    const parsed = parsePcmWav(rawBuf);
    if (!parsed || parsed.samples.length < 1024) {
      return base64Wav;
    }

    const { sampleRate, samples } = parsed;

    // Parameters tuned for unmistakable separation between Little Boy and Little Girl:
    // - child_boy: Charon deep male base (~105Hz) shifted up 2.15x -> ~225-248Hz playful 6yo little boy
    // - child_girl: Zephyr light female base (~220Hz) shifted up 1.48x -> ~318-350Hz sweet 6yo little girl
    const pitchShiftRatio = profile === 'child_boy' ? 2.15 : 1.48;
    // Keep calm, easy-to-follow child cadence
    const targetTempo = profile === 'child_boy' ? 0.90 : 0.96;
    const wsolaStretch = pitchShiftRatio / targetTempo;

    const stretched = wsolaTimeStretch(samples, sampleRate, wsolaStretch);
    let shifted = cubicResample(stretched, pitchShiftRatio);

    if (profile === 'child_boy') {
      // Preserve sturdy boyish chest-mid (~440Hz) while removing low adult boom
      shifted = highPass(shifted, sampleRate, 145);
      shifted = peakingEq(shifted, sampleRate, 440, 3.2, 1.0);
      shifted = peakingEq(shifted, sampleRate, 2100, 1.2, 0.9);
      shifted = peakingEq(shifted, sampleRate, 5400, -2.5, 0.8);
    } else {
      // Soft, airy, sweet 5-year-old little girl resonance
      shifted = highPass(shifted, sampleRate, 220);
      shifted = peakingEq(shifted, sampleRate, 420, -2.2, 0.9);
      shifted = peakingEq(shifted, sampleRate, 3200, 3.0, 0.9);
    }

    const finalSamples = normalizePeak(shifted, 0.86);
    const outBuf = encodePcmWav(finalSamples, sampleRate);
    return outBuf.toString('base64');
  } catch {
    return base64Wav;
  }
}
