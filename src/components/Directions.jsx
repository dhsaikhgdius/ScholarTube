import { ArrowIcon } from '../icons'
import { getFormatFamily } from '../resource-utils'

const breakdownFamilies = ['Interview', 'Course', 'Talk', 'Podcast']

const directionDefinitions = [
  {
    id: 'World Model',
    number: '01',
    label: 'World Models',
    copy: 'Learned simulators that predict how environments evolve — temporal dynamics, latent imagination, planning, and spatial reasoning.',
  },
  {
    id: 'Agent',
    number: '02',
    label: 'Agents',
    copy: 'Systems that act on their own: tool use, memory, orchestration, multi-agent coordination, and rigorous agent evaluation.',
  },
  {
    id: 'Vision',
    number: '03',
    label: 'Vision',
    copy: 'Perception and generation across images and video — multimodal understanding, visual representation, and generative systems.',
  },
  {
    id: 'Robotics',
    number: '04',
    label: 'Robotics',
    copy: 'Embodied intelligence: manipulation, locomotion, sim-to-real transfer, and policies that turn perception into grounded action.',
  },
  {
    id: 'Other',
    number: '05',
    label: 'Broader AI',
    copy: 'The wider field: deep learning foundations, AI systems and infrastructure, NLP, industry perspectives, social impact, and research frontiers.',
  },
  {
    id: 'How to Research',
    number: '06',
    label: 'How to Research',
    copy: 'The craft of research: finding problems, reading literature, experimental rigor, scientific writing, peer review, and clear communication.',
  },
]

export default function Directions({ setFocus, resources }) {
  const directions = directionDefinitions.map((direction) => {
    const matching = resources.filter((resource) => resource.focusArea === direction.id)
    return {
      ...direction,
      count: matching.length,
      breakdown: breakdownFamilies.map((family) => (
        matching.filter((resource) => getFormatFamily(resource) === family).length
      )),
    }
  })

  function chooseDirection(id) {
    setFocus(id)
    document.querySelector('#library')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="directions" id="directions">
      <div className="shell">
        <div className="section-heading section-heading--row">
          <div>
            <p className="section-kicker">Research directions</p>
            <h2>Enter through the question you’re working on.</h2>
          </div>
          <p>Six directions connect field knowledge with the craft of doing careful, communicable research.</p>
        </div>

        <div className="direction-list">
          {directions.map((direction) => (
            <button type="button" className="direction-row" key={direction.id} onClick={() => chooseDirection(direction.id)}>
              <span className="direction-number">{direction.number}</span>
              <span className="direction-main">
                <strong>{direction.label}</strong>
                <span>{direction.copy}</span>
              </span>
              <span className="direction-count">{direction.count}<small> resources</small></span>
              <span className="direction-breakdown" aria-label={`${direction.breakdown[0]} interviews, ${direction.breakdown[1]} courses, ${direction.breakdown[2]} talks, ${direction.breakdown[3]} podcasts`}>
                {direction.breakdown.map((value, index) => (
                  <i key={index} style={{ '--bar': `${Math.max(24, value * 3)}%` }} />
                ))}
                <em>I / C / T / P</em>
              </span>
              <span className="direction-arrow"><ArrowIcon /></span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
