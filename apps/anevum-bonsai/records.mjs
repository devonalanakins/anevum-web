/**
 * ANEVUM Living Atlas — verified public collection data.
 * Add records only from owner-confirmed sources. Missing facts stay null.
 *
 * @typedef {'observed'|'planned'|'completed'} EventState
 * @typedef {'authentic'|'illustrative'} MediaKind
 * @typedef {{id: string, specimenId: string|null, kind: MediaKind, approved: boolean,
 *   src: string|null, poster: string|null, capturedAt: string|null, alt: string, caption: string}} MediaAsset
 */

export const SPECIES = Object.freeze({
  scientific: "Acer rubrum",
  common: "Red maple",
  family: "Sapindaceae"
});

export const SPECIMENS = Object.freeze(Array.from({length: 5}, (_, index) => {
  const number = index + 1;
  const id = "tree-" + String(number).padStart(2, "0");
  return Object.freeze({
    id,
    number,
    title: "Tree " + String(number).padStart(2, "0"),
    scientificName: SPECIES.scientific,
    commonName: SPECIES.common,
    origin: "Seed-grown in 2026",
    originYear: 2026,
    germinationDate: null,
    measurements: null,
    healthAssessment: null,
    styling: number === 1 ? "Root-over-rock — proposed study" : null,
    stylingState: number === 1 ? "planned" : null,
    notes: number === 1
      ? "The owner's first bonsai experiment. Rock selection and root placement are future work."
      : "A separate seed-grown red maple. Individual styling and photographic history are not yet recorded.",
    mediaIds: []
  });
}));

/**
 * Year-precision events must not be silently formatted as full dates.
 * A design decision is not a completed horticultural intervention.
 */
export const EVENTS = Object.freeze([
  Object.freeze({
    id: "seed-grown-2026",
    specimenId: null,
    date: "2026",
    precision: "year",
    state: "observed",
    type: "origin",
    title: "Five red maples, grown from seed",
    description: "The collection began with five Acer rubrum seedlings in 2026. Individual germination dates have not been recorded.",
    mediaIds: []
  }),
  Object.freeze({
    id: "tree-01-root-over-rock-direction",
    specimenId: "tree-01",
    date: "2026-11-15",
    precision: "day",
    state: "planned",
    type: "design",
    title: "A root-over-rock direction",
    description: "Tree 01's intended direction was selected. No stone installation or root placement has been documented.",
    mediaIds: []
  })
]);

export const JOURNAL = Object.freeze([
  Object.freeze({
    slug: "time-is-the-medium",
    title: "Time is the medium",
    date: "2026-11-15",
    type: "editorial record",
    summary: "A new direction for the collection, and for the first seed-grown maple.",
    paragraphs: [
      "ANEVUM is becoming a record of living trees: five red maples grown from seed in 2026, observed over the years rather than presented as finished objects.",
      "Tree 01 is the first experiment. A root-over-rock composition has been chosen as a design direction, not carried out as a horticultural intervention.",
      "The next record will be grounded in the actual specimen, its photographs, a suitable stone, and what its roots permit. For now, the archive begins with what is known."
    ],
    mediaIds: []
  })
]);

/** Every asset remains unpublished until provenance and owner clearance are recorded. */
export const MEDIA = Object.freeze([
  Object.freeze({
    id: "hero-master",
    specimenId: null,
    kind: "illustrative",
    approved: false,
    src: null,
    poster: null,
    capturedAt: null,
    alt: "Cinematic botanical concept image pending",
    caption: "Art-directed landscape master pending — not specimen evidence"
  }),
  Object.freeze({
    id: "tree-01-documentary",
    specimenId: "tree-01",
    kind: "authentic",
    approved: false,
    src: null,
    poster: null,
    capturedAt: null,
    alt: "Owner photograph of Tree 01 pending",
    caption: "Authentic owner photography not yet cleared for public display"
  })
]);

export const STUDIES = Object.freeze([
  Object.freeze({
    id: "study-root-over-rock",
    specimenId: "tree-01",
    title: "Root over rock",
    state: "planned",
    date: "2026-11-15",
    known: "A dramatic exposed-root composition is the chosen design direction.",
    unknown: "Stone identity, root geometry, viability, viewing angle, and installation date are not established.",
    alternatives: [
      {id: "vertical", title: "Vertical emphasis", note: "Study a narrower stone and an ascending silhouette. Material selection pending."},
      {id: "shelter", title: "Sheltered contour", note: "Study a lower, weathered form with space for the trunk. No stone selected."},
      {id: "cascade", title: "Offset balance", note: "Study the tree's visual weight against an asymmetrical rock. Root geometry unverified."}
    ]
  })
]);

export function specimenById(id) {
  return SPECIMENS.find(specimen => specimen.id === id) || null;
}

export function visibleMedia(ids) {
  return MEDIA.filter(asset => ids.includes(asset.id) && asset.approved && asset.src && asset.alt);
}

export function assertContentIntegrity() {
  const ids = new Set(SPECIMENS.map(specimen => specimen.id));
  if (ids.size !== 5) throw new Error("Specimen IDs must be unique");
  for (const specimen of SPECIMENS) {
    if (specimen.scientificName !== "Acer rubrum") throw new Error("Species drift");
    if (specimen.originYear !== 2026) throw new Error("Unverified origin");
  }
  for (const event of EVENTS) {
    if (!["observed", "planned", "completed"].includes(event.state)) throw new Error("Invalid event state");
    if (event.specimenId !== null && !ids.has(event.specimenId)) throw new Error("Unlinked event");
    if (event.precision === "day" && !/^\d{4}-\d{2}-\d{2}$/.test(event.date)) throw new Error("Invalid day date");
  }
  for (const media of MEDIA) {
    if (media.specimenId !== null && !ids.has(media.specimenId)) throw new Error("Unlinked media");
    if (media.approved && (!media.src || !media.alt || !["authentic", "illustrative"].includes(media.kind))) {
      throw new Error("Media lacks approved provenance");
    }
    if (!media.approved && media.src) throw new Error("Unapproved public media URL");
  }
  return true;
}
