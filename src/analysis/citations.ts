import type { Citation, Species } from './types';

export const DISCLAIMER =
  'Snappet reads published facial-expression and grimace-scale signals from a still photo. It is not a veterinary diagnosis, does not detect internal disease, and cannot replace a hands-on exam. If cues look high, or you are worried, check with a veterinarian.';

export const HIGH_PAIN_VET_SUGGESTION =
  'These cues are consistent with a higher discomfort pattern on grimace-scale features. Consider a professional veterinary check — especially if your pet is hiding, not eating, or seems unlike themselves.';

export const CITATIONS: Citation[] = [
  {
    id: 'evangelista-2019',
    title: 'Facial expressions of pain in cats: the development and validation of a Feline Grimace Scale',
    authors: 'Evangelista MC, Watanabe R, Leung VSY, Monteiro BP, O’Toole E, Pang DSJ, Steagall PV',
    year: 2019,
    source: 'Scientific Reports 9:19128',
    url: 'https://doi.org/10.1038/s41598-019-55693-8',
    notes:
      'Defines the five Feline Grimace Scale action units used here: ear position, orbital tightening, muzzle tension, whiskers change, and head position (each 0–2).',
  },
  {
    id: 'evangelista-2020',
    title: 'Clinical applicability of the Feline Grimace Scale: real-time versus image scoring and the influence of sedation and surgery',
    authors: 'Evangelista MC, Benito J, Monteiro BP, Watanabe R, Steagall PV',
    year: 2020,
    source: 'BMC Veterinary Research 16:90',
    url: 'https://doi.org/10.1186/s12917-020-02314-6',
    notes:
      'Supports using still images to score FGS features and discusses practical limits of photo-only reading.',
  },
  {
    id: 'steagall-2022',
    title: '2022 ISFM Consensus Guidelines on the Management of Acute Pain in Cats',
    authors: 'Steagall PV, Robertson S, Simon B, Warne LN, Shilo-Benjamini Y, Taylor S',
    year: 2022,
    source: 'Journal of Feline Medicine and Surgery 24(1)',
    url: 'https://doi.org/10.1177/1098612X211066268',
    notes:
      'Places grimace scoring in a broader acute-pain assessment that also includes behavior and context — which a single snap cannot capture.',
  },
  {
    id: 'holden-2014',
    title: 'Evaluation of facial expression in acute pain in cats and development of a pain face in dogs',
    authors: 'Holden E, Calvo G, Collins M, Bell A, Reid J, Scott EM, Nolan AM',
    year: 2014,
    source: 'Veterinary Record 174(26):668 / related facial-expression work in dogs',
    url: 'https://doi.org/10.1136/vr.102215',
    notes:
      'Identifies facial differences (orbital tightening, ear carriage, muzzle tension) between dogs with and without pain. Less standardized than the feline scale.',
  },
  {
    id: 'reid-2007',
    title: 'Development of the short-form Glasgow Composite Measure Pain Scale (CMPS-SF)',
    authors: 'Reid J, Nolan AM, Hughes JML, Lascelles D, Pawson P, Scott EM',
    year: 2007,
    source: 'Animal Welfare 16(S):97–104',
    url: 'https://www.gla.ac.uk/schools/bohvm/research/painandwelfare/downloadacopiesoftheglasgowcompositemeasurepainscale/',
    notes:
      'Widely used dog pain instrument. Includes a “pain face” item among behavioral scores — Snappet uses the facial subset only, so confidence stays lower for dogs.',
  },
  {
    id: 'descovich-2017',
    title: 'Facial expression: An under-utilized tool for the assessment of welfare in mammals',
    authors: 'Descovich KA, Wathan J, Leach MC, Buchanan-Smith HM, Flecknell P, Farningham D, Vick SJ',
    year: 2017,
    source: 'ALTEX 34(3):409–429',
    url: 'https://doi.org/10.14573/altex.1607161',
    notes:
      'Reviews mammalian grimace features (ears, orbital tightening, muzzle/cheek tension) that inform the other-species fallback — with explicitly lower confidence.',
  },
];

export function citationsForSpecies(species: Species): Citation[] {
  if (species === 'cat') {
    return CITATIONS.filter((item) =>
      ['evangelista-2019', 'evangelista-2020', 'steagall-2022', 'descovich-2017'].includes(item.id),
    );
  }
  if (species === 'dog') {
    return CITATIONS.filter((item) =>
      ['holden-2014', 'reid-2007', 'descovich-2017'].includes(item.id),
    );
  }
  return CITATIONS.filter((item) => ['descovich-2017', 'evangelista-2019', 'holden-2014'].includes(item.id));
}
