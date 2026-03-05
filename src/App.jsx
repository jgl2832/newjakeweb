import { useState, useEffect } from 'react'
import './App.css'

const NAV_ITEMS = ['about', 'experience', 'education', 'contact']

const EXPERIENCE = [
  {
    company: 'Awin Global',
    title: 'Staff Software Engineer',
    period: '2024 — Present',
    location: 'Berlin, Germany',
    description: null,
  },
  {
    company: 'Awin Global',
    title: 'Solutions Architect',
    period: '2021 — 2024',
    location: 'Berlin, Germany',
    description: null,
  },
  {
    company: 'GetYourGuide',
    title: 'Senior Backend Engineer',
    period: '2020 — 2021',
    location: 'Berlin, Germany',
    description: null,
  },
  {
    company: 'Meetup',
    title: 'Staff Core Engineer',
    period: '2017 — 2019',
    location: 'New York, NY',
    description: null,
  },
  {
    company: 'Meetup',
    title: 'Core Engineering Manager',
    period: '2016 — 2017',
    location: 'New York, NY',
    description: null,
  },
  {
    company: 'Meetup',
    title: 'Product Engineering Lead',
    period: '2014 — 2016',
    location: 'New York, NY',
    description: 'Lead engineer on International & Partnerships and Notifications product teams.',
  },
  {
    company: 'Meetup',
    title: 'Software Engineer',
    period: '2011 — 2014',
    location: 'New York, NY',
    description: 'Backend features using Java, Python, and MySQL.',
  },
]

export default function App() {
  const [active, setActive] = useState('about')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-40% 0px -55% 0px' }
    )
    NAV_ITEMS.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <header className={scrolled ? 'scrolled' : ''}>
        <span className="logo" onClick={() => scrollTo('about')}>JL</span>
        <nav>
          {NAV_ITEMS.map((id) => (
            <button
              key={id}
              className={active === id ? 'active' : ''}
              onClick={() => scrollTo(id)}
            >
              {id}
            </button>
          ))}
        </nav>
      </header>

      <main>
        <section id="about" className="hero">
          <div className="hero-content">
            <p className="location">Berlin, Germany</p>
            <h1>Jake Levine</h1>
            <p className="headline">Staff Software Engineer at Awin</p>
            <p className="bio">
              Experienced software engineer with a history of working in the internet industry.
              Previously at Meetup and GetYourGuide. Speaker at Codemotion Berlin 2019.
            </p>
            <div className="links">
              <a href="https://github.com/jgl2832" target="_blank" rel="noreferrer">GitHub</a>
              <a href="https://linkedin.com/in/jakeglevine" target="_blank" rel="noreferrer">LinkedIn</a>
            </div>
          </div>
        </section>

        <section id="experience">
          <h2>Experience</h2>
          <div className="experience-list">
            {EXPERIENCE.map((role, i) => (
              <div className="role" key={i}>
                <div className="role-meta">
                  <span className="period">{role.period}</span>
                  <span className="role-location">{role.location}</span>
                </div>
                <div className="role-details">
                  <h3>{role.title}</h3>
                  <p className="company">{role.company}</p>
                  {role.description && <p className="role-desc">{role.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="education">
          <h2>Education</h2>
          <div className="experience-list">
            <div className="role">
              <div className="role-meta">
                <span className="period">2006 — 2011</span>
                <span className="role-location">Montréal, Canada</span>
              </div>
              <div className="role-details">
                <h3>BEng, Software Engineering</h3>
                <p className="company">McGill University</p>
              </div>
            </div>
          </div>
        </section>

        <section id="contact">
          <h2>Contact</h2>
          <p className="contact-text">
            Open to interesting conversations and opportunities.
          </p>
          <a className="email-link" href="https://linkedin.com/in/jakeglevine" target="_blank" rel="noreferrer">
            linkedin.com/in/jakeglevine
          </a>
        </section>
      </main>

      <footer>
        <p>Jake Levine · Berlin · {new Date().getFullYear()}</p>
      </footer>
    </>
  )
}
