# Snappet

**Snap a pet, read the signals.**

An Expo (React Native) iOS app — Expo Go today, EAS / App Store when you are ready. You snap or pick a photo. Snappet guesses **cat / dog / other** from the image, then pages through species, vibe, biometric-style signals, and one witty caption. It is **not** mind-reading and **not** a veterinary diagnosis.

## Core loop

1. Open the app. No species picker — just the shutter, Photo Library, or a sample.
2. A brief “Reading the face” moment.
3. Four cards, one at a time: **species** (with confidence) → **vibe** → **signals** (comfort, calm, energy, social ease) → **funny line**.
4. Science citations and the vet disclaimer live behind **About the science**.
5. Recents stay on-device.

High discomfort cues still suggest a professional check. Other / unknown animals use a shared-mammal fallback with lower confidence.

The four signals are **estimated from facial cues**, not a wearable. The caption is playful and separate from the science.

## Run it

```bash
npm install
npx expo start
```

Then:

- Scan the QR code with **Expo Go** on an iPhone (store Expo Go can lag SDK 57; use a [development build](https://docs.expo.dev/develop/development-builds/introduction/) if needed).
- Press `w` for web (library + samples work; camera is best on a device).
- `i` / `a` for simulator / emulator when those toolchains are installed.

```bash
npm run typecheck
npm test
npm run web
```

Offline **demo mode always works**. It detects species from the photo key (and tokens like `cat`, `dog`, `relaxed`, `pain`) and scores grimace-scale features deterministically. Samples on Snap: Sunbeam (relaxed cat), Tucked in (uncomfortable cat), Ready (alert dog), Low key (discomfort-cue dog).

## Optional cloud vision

No API keys belong in this repo. Copy `.env.example` to `.env`:

```bash
EXPO_PUBLIC_VISION_ENDPOINT=https://example.com/snappet/vision
```

Snappet `POST`s `{ imageKey, imageUri? }` and expects:

```json
{
  "species": "cat",
  "speciesConfidence": 0.82,
  "features": [
    { "id": "earPosition", "rawScore": 0, "evidence": "ears facing forward" }
  ]
}
```

`rawScore` is grimace-scale intensity **0–2**. If the env var is unset or the request fails, demo mode is used.

## Science grounding

In-app: **About the science** (not the main stage). Outputs stay **signals consistent with** published scales.

### Cats — Feline Grimace Scale (FGS)

Evangelista et al. (2019): ear position, orbital tightening, muzzle tension, whisker change, head position (each 0–2, total 0–10). Literature often discusses ~4/10 as clinically interesting.

### Dogs — facial discomfort cues

Holden et al. and the Glasgow CMPS “pain face” item: orbital tightening, ear carriage, muzzle / commissure tension, eye aperture. Less standardized than FGS, so confidence is lower.

### Other / unknown

Shared mammalian grimace features with an explicit fallback.

### Sources

- Evangelista MC et al. (2019). Facial expressions of pain in cats: the development and validation of a Feline Grimace Scale. *Scientific Reports* 9:19128. https://doi.org/10.1038/s41598-019-55693-8
- Evangelista MC et al. (2020). Clinical applicability of the Feline Grimace Scale. *BMC Veterinary Research* 16:90. https://doi.org/10.1186/s12917-020-02314-6
- Steagall PV et al. (2022). ISFM Consensus Guidelines on the Management of Acute Pain in Cats. *JFMS*. https://doi.org/10.1177/1098612X211066268
- Holden E et al. (2014). Evaluation of facial expression in acute pain… *Veterinary Record*. https://doi.org/10.1136/vr.102215
- Reid J et al. (2007). Development of the short-form Glasgow Composite Measure Pain Scale (CMPS-SF). *Animal Welfare* 16(S):97–104.
- Descovich KA et al. (2017). Facial expression: An under-utilized tool for the assessment of welfare in mammals. *ALTEX*. https://doi.org/10.14573/altex.1607161

## Disclaimer

Snappet reads published facial-expression and grimace-scale signals from a still photo. It is **not a veterinary diagnosis**, does not detect internal disease, and cannot replace a hands-on exam. If cues look high, or you are worried, check with a veterinarian.

## App Store path (EAS)

Paperwork is out of scope for v0. The build path:

```bash
npm i -g eas-cli && eas login
eas init
eas build --profile development --platform ios
eas build --profile preview --platform ios
eas build --profile production --platform ios
eas submit --platform ios --profile production
```

Bundle identifier: `app.snappet.ios`. Camera and photo-library usage strings are in `app.json`. Fill `eas.json` `ascAppId` before submit.

## Out of scope for v0

Real-time talking-pet video, App Store Connect paperwork, clinical diagnostic claims.

## Project layout

```
src/app/(tabs)     Snap + Recents
src/app/camera.tsx Fullscreen camera
src/app/result.tsx Analyzing + paged cards
src/app/science.tsx Modal: citations + disclaimer
src/analysis       Auto species, grimace scores, signals, caption
```
