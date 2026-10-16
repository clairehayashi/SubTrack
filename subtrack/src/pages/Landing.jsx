import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import styles from './Landing.module.css'
import { LANDING_LOGOS } from '../lib/landingLogos'

const asset = (name) => `${import.meta.env.BASE_URL}landing/${name}`
const SERVICES = {
  netflix: {
    name: 'Netflix',
    amount: 1490,
    date: 'Apr 14',
  },
  spotify: {
    name: 'Spotify',
    amount: 980,
    date: 'Apr 22',
  },
  youtube: {
    name: 'YouTube Premium',
    amount: 1180,
    date: 'Apr 28',
  },
  chatgpt: {
    name: 'ChatGPT Plus',
    amount: 3000,
    date: 'May 1',
  },
  figma: { name: 'Figma', amount: 1800, date: 'May 8' },
  notion: { name: 'Notion', amount: 1200, date: 'May 12' },
  adobe: {
    name: 'Adobe Creative Cloud',
    amount: 2180,
    date: 'Apr 20',
  },
  microsoft: {
    name: 'Microsoft 365',
    amount: 0,
    date: 'Sep 1',
  },
}
const ACCOUNTS = [
  {
    name: 'Personal',
    email: 'claire@gmail.com',
    color: '#534AB7',
    services: ['netflix', 'spotify', 'youtube'],
  },
  {
    name: 'Work',
    email: 'claire@studio.com',
    color: '#A96611',
    services: ['chatgpt', 'figma', 'notion'],
  },
  {
    name: 'School',
    email: 'c.lin@uni.edu',
    color: '#167E61',
    services: ['adobe', 'microsoft'],
  },
]
const yen = (amount) => `¥${amount.toLocaleString('en-US')}`
const TOTAL = Object.values(SERVICES).reduce(
  (sum, service) => sum + service.amount,
  0,
)
const BENEFITS = [
  {
    icon: 'mail',
    title: 'Find the right account',
    text: 'Keep the signup email beside each subscription, so you know where to manage it.',
    example: 'Netflix · claire@gmail.com',
  },
  {
    icon: 'cost',
    title: 'See what adds up',
    text: 'Review your recorded recurring costs together, including monthly and annual plans.',
    example: `${yen(TOTAL)} / month · example`,
  },
  {
    icon: 'calendar',
    title: 'Keep upcoming renewals visible',
    text: 'Check renewal dates and trial endings in one place when reviewing what comes next.',
    example: 'Adobe trial ends Apr 20',
  },
  {
    icon: 'link',
    title: 'Keep cancellation details handy',
    text: 'Save the cancellation link and notes while they’re easy to find.',
    example: 'Cancellation link + your notes',
  },
]
const STEPS = [
  {
    label: 'Add',
    title: 'Add your subscriptions',
    text: 'Enter the services you use, their prices, billing dates, and signup emails. Include trials and annual plans alongside monthly subscriptions to build an overview of what you’re tracking.',
  },
  {
    label: 'Organize',
    title: 'Organize by account',
    text: 'Group subscriptions under Personal, Work, School, or labels you choose. Keep the relevant email attached to each service, so you can find the right account when you need to manage it.',
  },
  {
    label: 'Review',
    title: 'Review what’s coming next',
    text: 'Check upcoming renewals alongside your recorded costs and cancellation details. Use that information to decide which subscriptions still earn their place before another payment is due.',
  },
]
const FAQS = [
  {
    q: 'Which subscriptions can I track?',
    a: 'You enter subscriptions manually, so you can record streaming services, software, memberships, and other recurring payments. Add the price, billing date, and account details you want to keep track of.',
  },
  {
    q: 'Can I use more than one email account?',
    a: 'Yes. Keep the signup email with each subscription and organize your list under Personal, Work, School, or your own labels. These groups are part of your SubTrack overview.',
  },
  {
    q: 'Do I need to connect my bank or inbox?',
    a: 'No. The current workflow uses the details you enter. It does not scan your bank account or email inbox to discover subscriptions.',
  },
  {
    q: 'Does SubTrack cancel subscriptions for me?',
    a: 'You complete cancellation with the service itself. SubTrack keeps the cancellation link and any notes you save alongside the subscription, so the information is easier to find.',
  },
]

function Icon({ name, className }) {
  const paths = {
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    cost: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <path d="M7 16v-3m5 3V8m5 8v-5" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M7 3v4m10-4v4M3 10h18m-13 5h3" />
      </>
    ),
    link: (
      <path d="m10 14 4-4m-5 7-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m0 8a4 4 0 0 0 6 0l4-4a4 4 0 0 0-6-6l-1 1" />
    ),
    arrow: <path d="m9 5 7 7-7 7" />,
    check: <path d="m5 12 4 4L19 6" />,
    pause: <path d="M9 5v14m6-14v14" />,
    play: <path d="m8 5 11 7-11 7Z" />,
    replay: <path d="M4 10a8 8 0 1 1 1 8M4 4v6h6" />,
  }
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

function BrandMark({ className }) {
  return (
    <svg className={className} viewBox="0 0 28 28" aria-hidden="true">
      <rect width="28" height="28" rx="7.84" fill="#534AB7" />
      <svg x="3.92" y="3.92" width="20.16" height="20.16" viewBox="0 0 14 14">
        <rect
          x="1"
          y="1"
          width="5"
          height="5"
          rx="1.5"
          fill="white"
          opacity=".95"
        />
        <rect
          x="8"
          y="1"
          width="5"
          height="5"
          rx="1.5"
          fill="white"
          opacity=".6"
        />
        <rect
          x="1"
          y="8"
          width="5"
          height="5"
          rx="1.5"
          fill="white"
          opacity=".6"
        />
        <rect
          x="8"
          y="8"
          width="5"
          height="5"
          rx="1.5"
          fill="white"
          opacity=".3"
        />
      </svg>
    </svg>
  )
}

function ServiceLogo({ service, small = false }) {
  return (
    <span
      className={`${styles.serviceLogo} ${small ? styles.serviceLogoSmall : ''}`}
    >
      <img src={LANDING_LOGOS[service]} data-service={service} alt="" width="28" height="28" />
    </span>
  )
}

function AccountCards() {
  return (
    <div className={styles.accountGrid}>
      {ACCOUNTS.map((account) => (
        <article className={styles.accountCard} key={account.name}>
          <header className={styles.accountHeader}>
            <span
              className={styles.accountDot}
              style={{ background: account.color }}
            />
            <div>
              <h3>{account.name}</h3>
              <p>{account.email}</p>
            </div>
          </header>
          <div className={styles.accountList}>
            {account.services.map((key) => {
              const service = SERVICES[key]
              return (
                <div className={styles.serviceRow} key={key}>
                  <ServiceLogo service={key} />
                  <div className={styles.serviceBody}>
                    <span className={styles.serviceName}>{service.name}</span>
                    <span className={styles.serviceMeta}>
                      {service.amount
                        ? `${yen(service.amount)} · monthly`
                        : 'Free · student'}
                    </span>
                  </div>
                  <span className={styles.serviceDate}>{service.date}</span>
                </div>
              )
            })}
          </div>
        </article>
      ))}
    </div>
  )
}

function OverviewPreview({ animated = false }) {
  return (
    <div className={styles.previewCard}>
      <div className={styles.previewHeader}>
        <span>Your subscriptions</span>
        <span className={styles.previewLabel}>Example data</span>
      </div>
      {ACCOUNTS.map((account) => (
        <div
          className={`${styles.overviewRow} ${animated ? styles.overviewEntry : ''}`}
          key={account.name}
        >
          <span
            className={styles.accountDot}
            style={{ background: account.color }}
          />
          <span className={styles.overviewName}>{account.name}</span>
          <div className={styles.miniLogos}>
            {account.services.map((key) => (
              <ServiceLogo key={key} service={key} small />
            ))}
          </div>
        </div>
      ))}
      <div className={styles.previewTotal}>
        <span>Recorded monthly cost</span>
        <strong>{yen(TOTAL)}</strong>
      </div>
    </div>
  )
}

function AddPreview({ animated = false }) {
  return (
    <div className={`${styles.previewCard} ${styles.addCard}`}>
      <div className={styles.previewHeader}>
        <span>Add subscription</span>
        <span className={styles.previewLabel}>Example</span>
      </div>
      <div className={styles.addFields}>
        <div className={styles.previewField}>
          <span>Service</span>
          <div>
            <ServiceLogo service="netflix" small />
            <strong className={animated ? styles.typedService : ''}>
              Netflix
            </strong>
          </div>
        </div>
        <div
          className={`${styles.previewField} ${animated ? styles.accountField : ''}`}
        >
          <span>Signup email</span>
          <strong>claire@gmail.com</strong>
        </div>
        <div className={styles.fieldPair}>
          <div
            className={`${styles.previewField} ${animated ? styles.amountField : ''}`}
          >
            <span>Amount / month</span>
            <strong>¥1,490</strong>
          </div>
          <div
            className={`${styles.previewField} ${animated ? styles.amountField : ''}`}
          >
            <span>Next renewal</span>
            <strong>Apr 14</strong>
          </div>
        </div>
        <div
          className={`${styles.previewSave} ${animated ? styles.animatedSave : ''}`}
        >
          {animated && (
            <span className={styles.savePending}>Save subscription</span>
          )}
          <span className={animated ? styles.saveDone : ''}>
            <Icon name="check" />
            Saved
          </span>
        </div>
      </div>
    </div>
  )
}

const FILE_STARTS = [
  [-12, 35],
  [75, -15],
  [198, -25],
  [350, 8],
  [448, 72],
  [414, 220],
  [382, 310],
  [243, 319],
  [112, 302],
  [-15, 257],
  [-36, 143],
  [26, 80],
  [107, 47],
  [319, 53],
  [404, 133],
  [327, 261],
  [193, 280],
  [53, 223],
  [30, 142],
  [150, -2],
  [287, 10],
  [438, 287],
  [71, 314],
  [254, 323],
]
function LogoGather() {
  const keys = Object.keys(SERVICES)
  return (
    <svg
      className={styles.gatherScene}
      viewBox="0 0 480 360"
      aria-hidden="true"
    >
      <rect
        className={styles.logoTile}
        x="140"
        y="66"
        width="200"
        height="200"
        rx="56"
        fill="#534AB7"
      />
      {FILE_STARTS.map(([x, y], index) => {
        const group = index % 4
        return (
          <g
            className={`${styles.flyingFile} ${index < 8 ? styles.openingFile : ''}`}
            key={index}
            style={{
              '--from-x': `${x}px`,
              '--from-y': `${y}px`,
              '--intro-x': `${Math.max(24, Math.min(400, x))}px`,
              '--intro-y': `${Math.max(24, Math.min(264, y))}px`,
              '--from-rotation': `${((index % 5) - 2) * 9}deg`,
              '--to-x': `${group % 2 ? 250.286 : 178.286}px`,
              '--to-y': `${group > 1 ? 176.286 : 104.286}px`,
              '--pile-x': `${((index % 6) - 2) * 2}px`,
              '--pile-y': `${((index % 6) - 2) * -2}px`,
            }}
          >
            <rect
              className={styles.filePaper}
              width="56"
              height="68"
              rx="7"
              fill="white"
              stroke="#D9DCE5"
            />
            <g className={styles.fileContents}>
              <image
                href={LANDING_LOGOS[keys[index % keys.length]]} data-service={keys[index % keys.length]}
                x="8"
                y="9"
                width="18"
                height="18"
              />
              <path
                d="M8 38h39M8 46h31M8 54h20"
                stroke="#B9BFCC"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>
          </g>
        )
      })}
      <g className={styles.finishedMark}>
        <svg x="140" y="66" width="200" height="200" viewBox="0 0 28 28">
          <BrandMark />
        </svg>
      </g>
      <text className={styles.logoWord} x="240" y="311" textAnchor="middle">
        SubTrack
      </text>
    </svg>
  )
}

function HeroCommercial() {
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [paused, setPaused] = useState(false)
  const [finished, setFinished] = useState(false)
  const [run, setRun] = useState(0)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  const replay = () => {
    setPaused(false)
    setFinished(false)
    setRun((value) => value + 1)
  }
  return (
    <div className={styles.commercial}>
      <div
        key={run}
        className={`${styles.motionCanvas} ${paused ? styles.motionPaused : ''} ${reducedMotion ? styles.motionStatic : ''}`}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget) setFinished(true)
        }}
        role="img"
        aria-label="A ten-second SubTrack preview: subscription records arrive, a subscription is added, costs and renewal dates are reviewed, then all records gather into the four squares of the SubTrack logo."
      >
        <div
          className={`${styles.motionScene} ${styles.boardScene}`}
          aria-hidden="true"
        >
          <OverviewPreview animated />
        </div>
        <div
          className={`${styles.motionScene} ${styles.formScene}`}
          aria-hidden="true"
        >
          <AddPreview animated />
        </div>
        <div className={styles.renewalToast} aria-hidden="true">
          <span className={styles.toastIcon}>
            <Icon name="calendar" />
          </span>
          <div>
            <strong>Trial ending soon</strong>
            <span>Adobe · Apr 20</span>
          </div>
        </div>
        <LogoGather />
      </div>
      <div className={styles.commercialFooter}>
        <span>
          {reducedMotion
            ? 'Subscription details, together.'
            : 'A quick look at SubTrack · 10 seconds'}
        </span>
        {!reducedMotion && (
          <div className={styles.motionControls}>
            {!finished && (
              <button
                type="button"
                onClick={() => setPaused((value) => !value)}
                aria-label={paused ? 'Resume animation' : 'Pause animation'}
              >
                <Icon name={paused ? 'play' : 'pause'} />
              </button>
            )}
            <button
              type="button"
              onClick={replay}
              aria-label="Replay animation"
            >
              <Icon name="replay" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ReviewPreview() {
  return (
    <div className={styles.previewCard}>
      <div className={styles.previewHeader}>
        <span>Upcoming renewals</span>
        <span className={styles.previewLabel}>Example data</span>
      </div>
      <div className={styles.reviewRow}>
        <span className={styles.dateTile}>
          <small>APR</small>
          <strong>14</strong>
        </span>
        <ServiceLogo service="netflix" />
        <div className={styles.serviceBody}>
          <strong>Netflix</strong>
          <span className={styles.serviceMeta}>Personal · ¥1,490 / month</span>
        </div>
      </div>
      <div className={styles.reviewRow}>
        <span className={styles.dateTile}>
          <small>APR</small>
          <strong>20</strong>
        </span>
        <ServiceLogo service="adobe" />
        <div className={styles.serviceBody}>
          <strong>Adobe Creative Cloud</strong>
          <span className={styles.serviceMeta}>School · trial ending</span>
        </div>
      </div>
      <div className={styles.cancelPreview}>
        <Icon name="link" />
        <div>
          <strong>Cancellation details</strong>
          <span>account.adobe.com · check plan terms</span>
        </div>
      </div>
    </div>
  )
}

function Walkthrough() {
  const [step, setStep] = useState(0)
  const tabs = useRef([])
  const touchStart = useRef(null)
  const onTabKey = (event) => {
    let index
    if (event.key === 'ArrowRight') index = (step + 1) % STEPS.length
    if (event.key === 'ArrowLeft')
      index = (step + STEPS.length - 1) % STEPS.length
    if (event.key === 'Home') index = 0
    if (event.key === 'End') index = STEPS.length - 1
    if (index !== undefined) {
      event.preventDefault()
      setStep(index)
      tabs.current[index]?.focus()
    }
  }
  return (
    <div className={styles.walkthrough}>
      <div className={styles.walkToolbar}>
        <div
          className={styles.walkTabs}
          role="tablist"
          aria-label="How SubTrack works"
          onKeyDown={onTabKey}
        >
          {STEPS.map((item, index) => (
            <button
              key={item.label}
              ref={(node) => {
                tabs.current[index] = node
              }}
              type="button"
              role="tab"
              id={`step-tab-${index}`}
              aria-controls={`step-panel-${index}`}
              aria-selected={step === index}
              tabIndex={step === index ? 0 : -1}
              onClick={() => setStep(index)}
            >
              <span>0{index + 1}</span>
              {item.label}
            </button>
          ))}
        </div>
        <div className={styles.walkArrows}>
          <button
            type="button"
            aria-label="Previous step"
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
          >
            <Icon name="arrow" className={styles.arrowBack} />
          </button>
          <button
            type="button"
            aria-label="Next step"
            disabled={step === STEPS.length - 1}
            onClick={() => setStep(step + 1)}
          >
            <Icon name="arrow" />
          </button>
        </div>
      </div>
      <div
        className={styles.walkViewport}
        onTouchStart={(event) => {
          touchStart.current = event.touches[0].clientX
        }}
        onTouchEnd={(event) => {
          if (touchStart.current === null) return
          const distance = touchStart.current - event.changedTouches[0].clientX
          if (Math.abs(distance) > 60)
            setStep((value) =>
              Math.max(
                0,
                Math.min(STEPS.length - 1, value + (distance > 0 ? 1 : -1)),
              ),
            )
          touchStart.current = null
        }}
      >
        <div
          className={styles.walkTrack}
          style={{ transform: `translateX(-${step * 100}%)` }}
        >
          {STEPS.map((item, index) => (
            <div
              className={styles.walkSlide}
              key={item.label}
              role="tabpanel"
              id={`step-panel-${index}`}
              aria-labelledby={`step-tab-${index}`}
              aria-hidden={step !== index}
            >
              <div className={styles.walkVisual}>
                
                <div className={styles.walkPreview}>
                  {index === 0 ? (
                    <AddPreview />
                  ) : index === 1 ? (
                    <OverviewPreview />
                  ) : (
                    <ReviewPreview />
                  )}
                </div>
              </div>
              <div className={styles.walkCopy}>
                <span className={styles.stepNumber}>0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.walkCaption}>
        <span>Example subscription details</span>
        <span>
          {step + 1} / {STEPS.length}
        </span>
      </div>
    </div>
  )
}

export default function Landing() {
  const user = useStore((state) => state.user)
  const page = useRef(null)
  const [openFaq, setOpenFaq] = useState(null)
  const destination = user ? '/home' : '/auth?mode=signup'
  const cta = user ? 'Open your dashboard' : 'Create an account'
  useEffect(() => {
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    )
      return
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.revealed)
            observer.unobserve(entry.target)
          }
        }),
      { threshold: 0.08 },
    )
    const root = page.current
    root.dataset.revealsReady = 'true'
    root
      .querySelectorAll('[data-reveal]')
      .forEach((element) => observer.observe(element))
    return () => {
      observer.disconnect()
      delete root.dataset.revealsReady
    }
  }, [])
  return (
    <div className={styles.page} ref={page}>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link to="/" className={styles.brand} aria-label="SubTrack home">
          <BrandMark className={styles.brandMark} />
          <span>SubTrack</span>
        </Link>
        <div className={styles.navActions}>
          <a className={styles.navLearn} href="#how-it-works">
            How it works
          </a>
          {!user && (
            <Link to="/auth" className={styles.navLink}>
              Sign in
            </Link>
          )}
          <Link to={destination} className={styles.navButton}>
            {user ? 'Open dashboard' : 'Get started'}
          </Link>
        </div>
      </nav>
      <main id="main-content">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Subscription tracking</p>
            <h1 id="hero-title">
              Know exactly what
              <br />
              you’re <span>paying for.</span>
            </h1>
            <p className={styles.heroLead}>
              Your subscriptions, accounts, and renewal dates in one place.
            </p>
            <p className={styles.heroDescription}>
              Keep track of the services you use across personal, work, and
              school accounts, with the details you need when it’s time to
              review another payment.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryButton} to={destination}>
                {cta}
                <Icon name="arrow" />
              </Link>
              <a className={styles.textLink} href="#how-it-works">
                See how it works
              </a>
            </div>
            <p className={styles.heroNote}>
              No bank or inbox connection needed.
            </p>
          </div>
          <div className={styles.heroVisual}>
            <HeroCommercial />
          </div>
        </section>
        <section
          className={styles.overviewSection}
          aria-labelledby="accounts-title"
        >
          <div className={styles.sectionHead} data-reveal>
            <p className={styles.eyebrow}>Everything within reach</p>
            <h2 id="accounts-title">
              Know where you once signed up.
              <br />
              Stop searching three inboxes for one subscription.
            </h2>
            <p>
              Finding the account behind a charge shouldn’t take a round of
              password resets and email searches. Keep each subscription’s
              signup email, renewal date, and cancellation details together, so
              you can find what you need without retracing how you signed up.
            </p>
          </div>
          <div data-reveal>
            <AccountCards />
            <p className={styles.exampleNote}>
              Example accounts, prices, and dates. Add your own subscription
              details.
            </p>
          </div>
          <div className={styles.benefitGrid} data-reveal>
            {BENEFITS.map((benefit) => (
              <article className={styles.benefit} key={benefit.title}>
                <Icon name={benefit.icon} className={styles.benefitIcon} />
                <h3>{benefit.title}</h3>
                <p>{benefit.text}</p>
                <span className={styles.benefitExample}>{benefit.example}</span>
              </article>
            ))}
          </div>
        </section>
        <section
          id="how-it-works"
          className={styles.walkSection}
          aria-labelledby="walk-title"
        >
          <div className={styles.sectionHead} data-reveal>
            <p className={styles.eyebrow}>How SubTrack works</p>
            <h2 id="walk-title">
              Keep the details together,
              <br />
              so reviewing them is easier.
            </h2>
          </div>
          <div data-reveal>
            <Walkthrough />
          </div>
        </section>
        <section
          className={styles.closingSection}
          aria-labelledby="questions-title"
        >
          <div className={styles.faqGrid} data-reveal>
            <div className={styles.faqIntro}>
              <p className={styles.eyebrow}>A few helpful details</p>
              <h2 id="questions-title">Before you get started.</h2>
            </div>
            <div className={styles.faqList}>
              {FAQS.map((faq, index) => (
                <div className={styles.faqItem} key={faq.q}>
                  <h3>
                    <button
                      type="button"
                      id={`faq-question-${index}`}
                      aria-expanded={openFaq === index}
                      aria-controls={`faq-answer-${index}`}
                      onClick={() =>
                        setOpenFaq(openFaq === index ? null : index)
                      }
                    >
                      {faq.q}
                      <span aria-hidden="true">
                        {openFaq === index ? '−' : '+'}
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`faq-answer-${index}`}
                    role="region"
                    aria-labelledby={`faq-question-${index}`}
                    hidden={openFaq !== index}
                  >
                    <p>{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.finalCta} data-reveal>
            <div>
              <h2>Ready to know what you’re paying for?</h2>
            </div>
            <Link className={styles.primaryButton} to={destination}>
              {cta}
              <Icon name="arrow" />
            </Link>
          </div>
        </section>
      </main>
      <footer className={styles.footer}>
        <Link to="/" className={styles.brand}>
          <BrandMark className={styles.brandMark} />
          <span>SubTrack</span>
        </Link>
        <span>
          Designed and built by Claire Lin · {new Date().getFullYear()}
        </span>
      </footer>
    </div>
  )
}
