import { formatDuration, getDisplayTopic } from './resource-utils.js'

// Local podcast heuristic, duplicated in PodcastShows.jsx on purpose so that
// resource-utils.js stays untouched. Keep both copies aligned:
// podcast if format/seriesTitle/channel matches /podcast/i, or title/channel contains 播客.
export function isPodcastResource(resource) {
  return (
    /podcast/i.test(resource.format || '') ||
    /podcast/i.test(resource.seriesTitle || '') ||
    /podcast/i.test(resource.channel || '') ||
    (resource.title || '').includes('播客') ||
    (resource.channel || '').includes('播客')
  )
}

export function showNameFor(resource) {
  return resource.seriesTitle || resource.channel
}

function topicFor(resource) {
  if (resource.focusArea && resource.focusArea !== 'Other') return resource.focusArea
  const keyword = resource.keywords?.split(';').map((value) => value.trim()).find(Boolean)
  return keyword || resource.domain || 'this research area'
}

function presenterFor(resource) {
  return resource.speaker && resource.speaker !== 'To be added'
    ? resource.speaker
    : resource.channel
}

// Verification bookkeeping that should never leak into editorial copy.
const verificationBoilerplate = new RegExp(
  [
    'matched to the target',
    'public metadata',
    'metadata accessible',
    'metadata reviewed',
    'player metadata',
    'verified as accessible',
    'accessibility verified',
    'editorially reviewed',
    'discovered through public',
    'official video endpoint',
    'title, channel',
    'title, creator',
    'targeted addition',
    'curated in the targeted',
    'curated for the',
    'weekly update',
    'canonical video url',
    'official institution, conference',
    'public youtube result',
    'original .{0,60} upload',
    'priority areas',
  ].join('|'),
  'i',
)

// Keeps the substantive sentences of a verification note and drops the audit trail.
export function distillNotes(resource) {
  if (!resource.notes?.trim()) return ''
  return resource.notes
    .split(/(?<=[.!?;。！？；])\s*/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 24 && !verificationBoilerplate.test(sentence))
    .slice(0, 2)
    .map((sentence) => sentence.charAt(0).toLocaleUpperCase() + sentence.slice(1))
    .map((sentence) => (/[.!?。！？]$/.test(sentence) ? sentence : `${sentence}.`))
    .join(' ')
}

function angleFor(resource) {
  const title = resource.title.toLocaleLowerCase()

  if (/from scratch|let['’]s build|implementation|in code|coding/.test(title)) {
    return 'an implementation-level walkthrough that connects the ideas to working systems'
  }
  if (/\bintro\b|introduction|\b101\b|crash course|foundation|explained/.test(title)) {
    return 'clear conceptual framing and a practical entry point'
  }
  if (/keynote/.test(title)) {
    return 'the original keynote framing of system direction, priorities, and supporting examples'
  }
  if (/panel|debate|roundtable/.test(title)) {
    return 'multiple viewpoints and points of disagreement preserved in their original context'
  }
  if (/tutorial|lecture|course|class|lesson/.test(title) || resource.section === 'Course') {
    return 'structured instruction that can be followed, paused, and revisited'
  }
  if (/paper|cvpr|neurips|icml|research/.test(title)) {
    return 'the research claims, evidence, and limitations as presented by the source'
  }
  if (/demo|live|workshop/.test(title)) {
    return 'direct demonstrations and concrete system behavior rather than a second-hand summary'
  }
  if (/future|roadmap|state of|next generation/.test(title)) {
    return 'a forward-looking account of the field’s priorities and unresolved questions'
  }
  if (/interview|podcast|fireside|conversation/.test(title) || resource.section === 'Interview') {
    return 'first-person reasoning, assumptions, and trade-offs that short summaries often flatten'
  }
  return 'the original argument, examples, and technical context in one source-linked recording'
}

function curationSentence(resource) {
  if (resource.recommendation === 'Core') {
    return 'Its Core placement makes it one of the stronger starting points in this part of the index.'
  }
  if (resource.recommendation === 'Reserve') {
    return 'Its Reserve placement makes it most useful as a specialized or alternative angle after the main references.'
  }
  return 'Its Recommended placement makes it a focused complement to the Core material.'
}

function levelFor(resource) {
  const title = resource.title.toLocaleLowerCase()

  if (/\bintro\b|introduction|\b101\b|crash course|foundation|explained|beginner/.test(title)) {
    return 'newcomers, students, and cross-disciplinary researchers building a reliable mental model'
  }
  if (/from scratch|tutorial|lecture|course|class|coding|implementation/.test(title) || resource.section === 'Course') {
    return 'students, engineers, and researchers ready to follow technical material step by step'
  }
  if (/paper|cvpr|neurips|icml|research/.test(title)) {
    return 'readers who already know the fundamentals and want to evaluate a research contribution closely'
  }
  if (/keynote|panel|debate|roadmap|future/.test(title)) {
    return 'researchers and technical leads comparing field direction, priorities, and competing viewpoints'
  }
  if (resource.section === 'Interview') {
    return 'researchers and practitioners looking for the speaker’s reasoning and decision context'
  }
  return 'researchers and practitioners exploring the topic beyond a surface-level overview'
}

function timeCommitmentFor(minutes) {
  if (minutes < 20) return 'a quick orientation or refresher'
  if (minutes < 45) return 'a focused session that fits into a short study block'
  if (minutes <= 90) return 'a complete study session with room for notes'
  if (minutes <= 150) return 'a long-form session for careful note-taking'
  return 'a deep reference to work through in sections'
}

// Podcast episodes get their own angle: the value is the guest thinking out
// loud, not the fact that an interview happened. Varied by title, duration,
// and focus area so sibling episodes of the same show read differently.
function podcastAngleSentence(resource) {
  const guest = presenterFor(resource)
  const topic = topicFor(resource)
  const title = resource.title.toLocaleLowerCase()
  const minutes = resource.durationMinutes

  if (/danger|risk|safety|superintellig|end of human/.test(title)) {
    return `${guest} argues a position on ${topic} that much of the field pushes back on, and the pushback happens on air instead of being edited out.`
  }
  if (/career|advice|phd|taste|how to research|马拉松|访谈录/.test(title) || resource.focusArea === 'How to Research') {
    return `${guest} talks through research taste, career decisions, and the judgment calls behind work on ${topic} — the material that never makes it into papers.`
  }
  if (/agent/.test(title) && resource.focusArea === 'Agent') {
    return `${guest} separates what agent systems can already do from what still fails, with the caveats and failure stories intact.`
  }
  if (minutes >= 180) {
    return `${guest} gets marathon-length room on ${topic} — enough for the reasoning behind decisions, the dead ends, and the disagreements to surface, not just the conclusions.`
  }
  if (minutes >= 90) {
    return `${guest} works through ${topic} at conversational depth: how the problem is framed inside the lab, what has already failed, and where their bets differ from the field.`
  }
  return `${guest} compresses a working researcher’s view of ${topic} into a single sitting — current bets, open problems, and what they would change first.`
}

function podcastShowSentence(resource) {
  const show = showNameFor(resource)
  const channel = resource.channel || ''
  const hostIsDistinct = channel && channel !== show &&
    !channel.toLocaleLowerCase().includes(show.toLocaleLowerCase()) &&
    !show.toLocaleLowerCase().includes(channel.toLocaleLowerCase())
  const host = hostIsDistinct ? channel : null

  if (host) {
    return `The episode ran on ${show}, ${host}’s long-form show, so the pauses, caveats, and lab context survive rather than being cut to a highlight reel.`
  }
  return `It ran on ${show} and is indexed at the canonical upload, so the conversation can be quoted and checked in full.`
}

function buildPodcastWhyWatch(resource) {
  const note = distillNotes(resource)
  const sentences = [podcastAngleSentence(resource), podcastShowSentence(resource)]
  if (note) sentences.push(note)
  else sentences.push(curationSentence(resource))
  return sentences.join(' ')
}

export function buildWhyWatch(resource) {
  if (isPodcastResource(resource)) return buildPodcastWhyWatch(resource)

  const topic = topicFor(resource)
  const presenter = presenterFor(resource)
  const note = distillNotes(resource)
  const sourceContext = presenter === resource.channel
    ? `It keeps ${resource.channel}’s original framing intact, making the argument easier to assess than a retelling.`
    : `It preserves ${presenter}’s perspective through ${resource.channel}, so the claims can be assessed in the context of the original ${resource.section.toLowerCase()}.`

  const sentences = [
    `“${resource.title}” is worth watching for ${angleFor(resource)} on ${topic}.`,
    sourceContext,
  ]
  if (note) sentences.push(note)
  sentences.push(curationSentence(resource))
  return sentences.slice(0, 4).join(' ')
}

function podcastListeningSentence(resource) {
  const minutes = resource.durationMinutes
  const duration = formatDuration(minutes)
  if (minutes >= 180) {
    return `At ${duration}, treat it like a primary-source document: work through it in sections and keep timestamps as you go.`
  }
  if (minutes >= 90) {
    return `At ${duration}, it fills one long listening session and rewards notes more than background play.`
  }
  return `At ${duration}, it fits a single focused listen without trimming the substance.`
}

function buildPodcastAudience(resource) {
  const guest = presenterFor(resource)
  const topic = topicFor(resource)
  const show = showNameFor(resource)

  return `Best for researchers and practitioners who want ${guest}’s own reasoning on ${topic} — assumptions, trade-offs, and taste — rather than a second-hand summary. ${podcastListeningSentence(resource)} Choose it when you want what ${show} does well — long-form, host-guided conversation at the canonical upload — pointed at the questions you are actually working on.`
}

export function buildAudience(resource) {
  if (isPodcastResource(resource)) return buildPodcastAudience(resource)

  const topic = topicFor(resource)
  const presenter = presenterFor(resource)
  const duration = formatDuration(resource.durationMinutes)

  return `Best for ${levelFor(resource)}. It is especially relevant to work on ${topic}. Choose this ${duration} ${resource.section.toLowerCase()} when you want ${timeCommitmentFor(resource.durationMinutes)} and the specific perspective of ${presenter} in “${resource.title}”.`
}

function uniqueSeriesValues(resources, getter) {
  return [...new Set(resources.map(getter).filter(Boolean))]
}

function listTopics(topics) {
  if (topics.length <= 1) return topics[0] || 'its research area'
  if (topics.length === 2) return `${topics[0]} and ${topics[1]}`
  return `${topics.slice(0, -1).join(', ')}, and ${topics[topics.length - 1]}`
}

// Editorial introduction for a grouped series: what it is, who it is for,
// and how much of it the index holds. Used by CourseSeriesDetail and PodcastShows.
export function buildSeriesIntro(series) {
  const episodes = series.resources
  const count = episodes.length
  const totalMinutes = episodes.reduce((total, resource) => total + resource.durationMinutes, 0)
  const runtime = formatDuration(totalMinutes)
  const topics = listTopics(uniqueSeriesValues(episodes, getDisplayTopic).slice(0, 3))
  const languages = uniqueSeriesValues(episodes, (resource) => resource.language).join(' and ')
  const channels = uniqueSeriesValues(episodes, (resource) => resource.channel)
  const sections = uniqueSeriesValues(episodes, (resource) => resource.section)
  const isPodcast = episodes.some(isPodcastResource)
  const isCourse = sections.length === 1 && sections[0] === 'Course'
  const episodeWord = count === 1 ? 'episode' : 'episodes'

  if (isPodcast) {
    return `${series.title} is a long-form ${languages} podcast whose episodes are selected here for guests who do the research or build the systems they discuss. ScholarTube indexes ${count} ${episodeWord} (${runtime} of conversation) covering ${topics}, each linked to its canonical upload. It suits listeners who want first-person reasoning — lab context, disagreements, and research taste — rather than a news summary.`
  }
  if (isCourse) {
    return `${series.title} is a complete course indexed as ${count} ${count === 1 ? 'lecture' : 'lectures'} (${runtime} of teaching) from ${channels.join(' and ')}. Follow the listed order for a structured path through ${topics}, or jump straight to the lecture that matches the problem in front of you. It suits students and researchers who want the primary teaching material, not a compressed retelling.`
  }
  return `${series.title} groups ${count} ${episodeWord} from the same program (${runtime} in total) spanning ${topics}. Every entry keeps its canonical link and verified metadata, so the videos can be watched, cited, and compared without leaving the source. Use it when you want one program’s perspective across guests and topics rather than a single conversation.`
}

export function getResourceDetail(resource) {
  return {
    whyWatch: resource.whyWatch || buildWhyWatch(resource),
    audience: resource.audience || buildAudience(resource),
    publishedAt: resource.publishedAt || 'Not yet verified',
    lastVerifiedAt: resource.lastVerifiedAt || resource.collectedOn || 'Not yet verified',
  }
}

export function getResourceTopics(resource, limit = 5) {
  const keywords = (resource.keywords || '')
    .split(';')
    .map((value) => value.trim())
    .filter(Boolean)
  if (keywords.length) return [...new Set(keywords)].slice(0, limit)
  return (resource.domain || '')
    .split('/')
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, limit)
}

export function formatDate(value) {
  if (!value || value === 'Not yet verified') return 'Not yet verified'
  const parsed = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(parsed)
}
