const standards = [
  ['01', 'Source fidelity', 'Every link points to the original host — the lab, the course, the conference — never a re-upload or a clipped mirror.'],
  ['02', 'Technical value', 'The video must teach a mechanism, method, or hard-won lesson, not merely announce a result.'],
  ['03', 'Durable signal', 'We favour material still worth an hour in two years over commentary on this week’s release.'],
  ['04', 'Podcast selection', 'Researcher guests, long-form, canonical host.'],
  ['05', 'Verified metadata', 'Titles, speakers, durations, and links are checked against the source and re-verified on every catalog sync.'],
]

export default function Curation() {
  return (
    <section className="curation" id="curation">
      <div className="curation-grid shell">
        <div className="curation-intro">
          <p className="section-kicker">Selection protocol</p>
          <h2>Curation over aggregation.</h2>
          <p>Every entry must help a researcher understand a mechanism, a method, a system’s behaviour, or a lesson about doing research. Anything that only tracks the news cycle stays out.</p>
        </div>
        <ol className="standard-list">
          {standards.map(([number, title, copy]) => (
            <li key={number}>
              <span>{number}</span>
              <div><h3>{title}</h3><p>{copy}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
