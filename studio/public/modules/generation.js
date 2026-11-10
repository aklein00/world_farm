// A small, explicit grammar, not a language model. The result is an editable
// recipe, never executable prompt content or a request to an external service.
export const GENERATOR = 'procedural-kit-v1';
export const BUILDING_TYPES = ['Bakery', 'Shop', 'Townhouse', 'Workshop'];
export const FOOTPRINTS = ['1x2', '2x2', '3x2'];
export const GENERATION_HELP = 'Try “broad shopfront, entrance on the left, three windows per floor, pitched roof, striped awning”. Type, footprint, height and the awning checkbox are fixed constraints. Other prose is kept as a note, not interpreted.';
const words = {one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10, single:1, double:2};
const number = s => words[s] ?? Number(s);
const round = n => Math.round(n * 100) / 100;
const hash = text => {let n = 2166136261; for (const char of text) n = Math.imul(n ^ char.charCodeAt(0), 16777619); return n >>> 0;};
const random = seed => () => {seed = (seed + 0x6d2b79f5) | 0; let x = Math.imul(seed ^ seed >>> 15, 1 | seed); x ^= x + Math.imul(x ^ x >>> 7, 61 | x); return ((x ^ x >>> 14) >>> 0) / 4294967296;};
const fail = message => {throw new Error(message);};

export function interpretBrief(brief) {
  if (!brief || !BUILDING_TYPES.includes(brief.type)) fail('Choose a bakery, shop, townhouse or workshop.');
  if (!FOOTPRINTS.includes(brief.footprint) || !Number.isInteger(brief.floors) || brief.floors < 1 || brief.floors > 3 || typeof brief.awning !== 'boolean') fail('Use a supported footprint and 1–3 floors.');
  if (typeof brief.description !== 'string' || brief.description.length > 2000) fail('Keep the description within 2,000 characters.');
  const text = brief.description.toLowerCase().normalize('NFKC').replace(/[–—-]/g, ' '), applied = [], warnings = [], settings = {};
  const store = ['Bakery', 'Shop'].includes(brief.type);
  // Unsupported forms are rejected, rather than being silently turned into a shop.
  const unsupported = text.match(/\b(skyscraper|castle|cathedral|spaceship|stadium|bridge|floating|underground|interior|interiors|spiral|dome|domed|curved roof|gable|gabled|balconies|balcony|chimney|chimneys|tower|turret|pool|garage|solar panels?)\b/);
  if (unsupported) fail(`“${unsupported[0]}” is outside this kit. Try a 1–3 floor shop, townhouse or workshop with a flat or hip roof. Remove that request to continue; no saved building has changed.`);
  const choose = (key, options) => {
    const matches = options.filter(([, expression]) => expression.test(text));
    if (matches.length > 1) fail(`The description asks for conflicting ${key}. Choose one, then generate again.`);
    if (matches.length) {settings[key] = matches[0][0]; applied.push(matches[0][2]);}
  };
  choose('entrance', [
    [-.14, /\b(?:left(?: hand| side)? (?:entrance|door)|(?:entrance|door)(?: is)?(?: on| to| at)?(?: the)? left)\b/, 'Entrance on the left'],
    [.14, /\b(?:right(?: hand| side)? (?:entrance|door)|(?:entrance|door)(?: is)?(?: on| to| at)?(?: the)? right)\b/, 'Entrance on the right'],
    [0, /\b(?:cent(?:er|re)(?:ed|d)? (?:entrance|door)|(?:entrance|door)(?: is)?(?: in| at)?(?: the)? cent(?:er|re))\b/, 'Centered entrance']
  ]);
  choose('width', [[1.08, /\b(?:broad|wide) (?:building|shopfront|facade|frontage)\b/, 'Broad frontage'], [.84, /\b(?:narrow|compact) (?:building|shopfront|facade|frontage)\b/, 'Narrow frontage']]);
  choose('windowWidth', [[1.35, /\b(?:wide|broad|large) windows?\b/, 'Wide windows'], [.85, /\b(?:narrow|small) windows?\b/, 'Narrow windows']]);
  choose('doorWidth', [[1.25, /\b(?:wide|broad|large) (?:entrance|door)\b/, 'Wide entrance'], [.85, /\b(?:narrow|small) (?:entrance|door)\b/, 'Narrow entrance']]);
  choose('roof', [['flat', /\bflat roof\b/, 'Flat roof'], ['pitched', /\b(?:pitched|slop(?:ed|ing)|hip|hipped|steep) roof\b/, 'Pitched hip roof']]);
  choose('awningStripe', [[0, /\b(?:solid|plain|unstriped) awning\b/, 'Solid awning'], [1, /\bstriped awning\b/, 'Striped awning']]);
  const negatives = text.match(/\b(?:no|without|not)\s+(?:(?:a|an|any|the)\s+)?(?:(?:wide|narrow|flat|pitched|striped|solid|left|right|centered)\s+)?(?:windows?|doors?|entrance|roof)\b/);
  if (negatives) fail(`“${negatives[0]}” is not a supported instruction. This kit needs windows, an entrance and a roof. Use a supported positive description, or leave that detail to the style.`);
  const floors = [...text.matchAll(/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|single|double)\s*(?:storeys?|stories|story|floors?)\b/g)].map(m => number(m[1]));
  if (floors.some(n => n !== brief.floors)) warnings.push(`Height control wins: using ${brief.floors} floor${brief.floors === 1 ? '' : 's'}, even though the description names a different height.`);
  const footprint = text.match(/\b(\d)\s*[x×]\s*(\d)\s*plots?\b/);
  if (footprint && `${footprint[1]}x${footprint[2]}` !== brief.footprint) warnings.push(`Footprint control wins: using ${brief.footprint.replace('x', ' × ')} plots.`);
  const namedTypes = [...text.matchAll(/\b(bakery|shop|townhouse|workshop)\b/g)].map(m => m[1]);
  if (namedTypes.some(type => type !== brief.type.toLowerCase() && !(brief.type === 'Bakery' && type === 'shop'))) warnings.push(`Building type control wins: using ${brief.type}.`);
  const counts = [...text.matchAll(/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:front |facade )?windows?(?:\s+(?:per|on each)\s+(?:floor|storey|story))?\b/g)].map(m => number(m[1]));
  if (new Set(counts).size > 1) fail('Choose one front-window count per upper floor.');
  if (counts.length) {
    if (counts[0] < 1 || counts[0] > 4) fail('This kit supports 1–4 front windows per upper floor. Try four windows or fewer.');
    settings.facadeBays = counts[0]; applied.push(`${counts[0]} front window${counts[0] === 1 ? '' : 's'} per upper floor`);
    if (brief.floors === 1) warnings.push('Front-window count applies to upper floors. This one-floor building keeps its ground-floor openings.');
  }
  const angle = text.match(/\b(\d+(?:\.\d+)?)\s*(?:degrees?|°)\s*(?:(?:pitched|hip|sloped)\s+)?roof\b/);
  if (angle) {
    const n = Number(angle[1]); if (n > 45) fail('Roof pitch is limited to 45°. Try a roof between 0° and 45°.');
    if ((settings.roof === 'flat' && n > 0) || (settings.roof === 'pitched' && n === 0)) fail('The roof description conflicts with its angle. Choose a flat roof or a pitch above 0°.');
    settings.roof = n === 0 ? 'flat' : 'pitched'; settings.roofPitch = n; applied.push(`${n}° roof pitch`);
  }
  const noAwning = /\b(?:no|without)(?: an?| any)? (?:striped |solid )?awning\b/.test(text), mentionsAwning = /\bawning\b/.test(text);
  if (mentionsAwning && (!store || noAwning === brief.awning)) warnings.push(!store ? 'Awnings are only supported on shops and bakeries.' : `Awning checkbox wins: the awning is ${brief.awning ? 'included' : 'off'}.`);
  if ('awningStripe' in settings && (!store || !brief.awning)) {delete settings.awningStripe; const i=applied.findIndex(s=>s.endsWith('awning')); if(i>=0)applied.splice(i,1);}
  if (!applied.length) warnings.push('No supported layout details found. Candidates will vary the unspecified proportions and openings within your controls.');
  warnings.push('Only the listed details and controls affect geometry. Unlisted prose, colors, materials and mood stay as notes; the shared style remains linked.');
  return {settings, applied, warnings};
}

export function generateCandidates(brief, version, generationRound = 0) {
  if (!Number.isInteger(version) || version < 1 || version > 10000) fail('Save a shared style before generating.');
  if (!Number.isInteger(generationRound) || generationRound < 0 || generationRound >= 100000) fail('Export this project and start a new family before generating more candidates.');
  const interpretation = interpretBrief(brief), s = interpretation.settings;
  const signature = JSON.stringify([GENERATOR, brief.type, s, brief.footprint, brief.floors, brief.awning, generationRound]);
  return Array.from({length:3}, (_, i) => {
    const seed = hash(signature + ':' + i) % 1_000_000_000, rng = random(seed), entranceOffset = s.entrance ?? round((i - 1) * .12);
    const width = s.width ?? round(.88 + i * .075 + rng() * .025), facadeBays = s.facadeBays ?? 2 + (i % 3);
    const parameters = {floors:brief.floors, width, depth:round(.87+i*.08+rng()*.015), windowWidth:s.windowWidth ?? round(.95 + rng() * .3), frameThickness:.1, doorWidth:s.doorWidth ?? round(.9 + rng() * .25), roofPitch:s.roofPitch ?? (s.roof === 'pitched' ? 30 : 0), overhang:.15, entranceOffset, facadeBays, awning:Number(brief.awning && ['Shop','Bakery'].includes(brief.type)), awningStripe:s.awningStripe ?? 1};
    const entrance = entranceOffset < -.03 ? 'Left entrance' : entranceOffset > .03 ? 'Right entrance' : 'Centered entrance';
    return {id:crypto.randomUUID(), name:brief.type === 'Bakery' ? 'Harbor Bakery' : brief.type === 'Workshop' ? 'Repair workshop' : brief.type, type:brief.type, styleVersion:version,
      baseline:{seed, layout:`${entrance} · ${facadeBays} upper bays`, variant:i, description:brief.description, footprint:brief.footprint, floors:brief.floors, awning:!!parameters.awning,
        generation:{engine:GENERATOR, round:generationRound, roof:s.roof ?? 'shared', applied:[...interpretation.applied], warnings:[...interpretation.warnings]}},
      parameters, overrides:{}, pinned:{Windows:true, Doors:true, Roof:true, Building:true}, collection:'Family buildings', source:GENERATOR};
  });
}
