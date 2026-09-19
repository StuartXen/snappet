# Snappet

**Snap a pet, read the signals.**

Snappet is an Expo (React Native) app for iOS — via Expo Go today, and an EAS / App Store build when you are ready. Take or pick a still photo of a cat, dog, or other pet. A structured feature → score pipeline maps facial cues to published grimace-scale science. It is **not** mystical mind-reading and **not** a veterinary diagnosis.

## Core loop

1. Choose species: **cat**, **dog**, or **other / unknown**.
2. Capture with the camera or pick a photo from the library (or run a bundled sample).
3. Analysis scores grimace-scale features from 0–2 and builds a low / medium / high comfort band.
4. Results show a playful mood line (clearly labeled optional), the science panel, confidence, citations, and a vet disclaimer.
5. Snaps stay in **local history** on the device.

High discomfort cues surface a professional-check suggestion. Other / unknown species use a shared-mammal fallback with lower confidence.

## Run it

```bash
npm install
npx expo start
```

Then:

- Scan the QR code with **Expo Go** on an iPhone (SDK on the store can lag; use a [development build](https://docs.expo.dev/develop/development-builds/introduction/) if the project SDK is newer).
- Press `w` for web (library pick + sample analysis work; camera is best on a device).
- `i` / `a` for iOS simulator / Android emulator when those toolchains are installed.

Useful scripts:

```bash
npm run typecheck
npm test
npm run web
```

Offline **demo mode always works**. It derives deterministic feature estimates from the photo key so the scoring pipeline stays testable without a vision backend. Sample tiles on the Snap tab (`relaxed` / `pain` tokens) produce stable low- and high-cue results.

## Optional cloud vision

No API keys belong in this repo.

Copy `.env.example` to `.env` if you want a backend:

```bash
EXPO_PUBLIC_VISION_ENDPOINT=https://example.com/snappet/vision
```

Snappet `POST`s `{ imageKey, species, imageUri? }` and expects:

```json
{
  "features": [
    { "id": "earPosition", "rawScore": 0, "evidence": "ears facing forward" }
  ]
}
```

`rawScore` is the grimace-scale intensity **0–2**. If the env var is unset or the request fails, demo mode is used. Never commit secrets.

## Science grounding

Outputs are labeled **signals consistent with** a published pattern. The playful mood line is a separate, optional layer.

### Cats — Feline Grimace Scale (FGS)

Evangelista et al. (2019) validated five action units, each 0 / 1 / 2 (total 0–10):

| Feature | Low (0) | High (2) |
| --- | --- | --- |
| Ear position | Facing forward | Flattened / rotated outward |
| Orbital tightening | Eyes open | Squinted / squeezed |
| Muzzle tension | Relaxed, rounded | Tense / elliptical |
| Whisker change | Loose, natural | Straight and forward |
| Head position | Level or above the shoulder | Lowered / tilted down |

Literature often discusses totals around **4/10** as clinically interesting. Snappet reports the combined total and our low / medium / high bands, and still tells you this is not a diagnosis.

### Dogs — facial discomfort cues

Dog facial scales are less standardized than FGS. Snappet uses cues reported in Holden et al. and the facial item of the Glasgow Composite Measure Pain Scale:

- Orbital tightening / narrowed eye aperture
- Ear carriage
- Muzzle tension
- Lip commissure tension

Confidence is lower because those instruments also use behavior and context a still photo cannot see.

### Other / unknown

Shared mammalian grimace features (ears, orbital tightening, muzzle, head position) with an explicit fallback flag.

### Sources (also listed in-app)

- Evangelista MC et al. (2019). Facial expressions of pain in cats: the development and validation of a Feline Grimace Scale. *Scientific Reports* 9:19128. https://doi.org/10.1038/s41598-019-55693-8
- Evangelista MC et al. (2020). Clinical applicability of the Feline Grimace Scale. *BMC Veterinary Research* 16:90. https://doi.org/10.1186/s12917-020-02314-6
- Steagall PV et al. (2022). ISFM Consensus Guidelines on the Management of Acute Pain in Cats. *JFMS*. https://doi.org/10.1177/1098612X211066268
- Holden E et al. (2014). Evaluation of facial expression in acute pain… *Veterinary Record*. https://doi.org/10.1136/vr.102215
- Reid J et al. (2007). Development of the short-form Glasgow Composite Measure Pain Scale (CMPS-SF). *Animal Welfare* 16(S):97–104.
- Descovich KA et al. (2017). Facial expression: An under-utilized tool for the assessment of welfare in mammals. *ALTEX*. https://doi.org/10.14573/altex.1607161

## Disclaimer

Snappet reads published facial-expression and grimace-scale signals from a still photo. It is **not a veterinary diagnosis**, does not detect internal disease, and cannot replace a hands-on exam. If cues look high, or you are worried, check with a veterinarian.

## App Store path (EAS)

Paperwork (Apple Developer account, App Store Connect listing, privacy nutrition labels, review notes) is out of scope for v0. The build path is ready:

1. Install EAS CLI and log in: `npm i -g eas-cli && eas login`
2. Create the Expo project once: `eas init`
3. Development client (recommended when Expo Go’s store SDK lags):

   ```bash
   eas build --profile development --platform ios
   ```

4. Internal preview:

   ```bash
   eas build --profile preview --platform ios
   ```

5. Production binary + submit (after you fill `eas.json` `ascAppId` and App Store Connect metadata):

   ```bash
   eas build --profile production --platform ios
   eas submit --platform ios --profile production
   ```

Bundle identifier is `app.snappet.ios`. Update it if that name is taken. Camera and photo-library usage strings are already in `app.json`.

## Out of scope for v0

Real-time talking-pet video, App Store Connect paperwork, and any clinical diagnostic claims.

## Project layout

```
src/app/(tabs)     Snap, History, Science
src/app/camera.tsx Camera capture
src/app/result.tsx Mood + science panel
src/analysis       Feature → score pipeline, demo extractor, citations
src/storage        Local history + in-memory pending snap
```
