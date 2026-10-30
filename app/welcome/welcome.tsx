import {
  ArrowDown,
  ArrowRight,
  Bot,
  ChartNoAxesCombined,
  Cpu,
  Layers3,
} from "lucide-react"
import { Link } from "react-router"
import { Button } from "~/components/ui/button"
import { LocaleToggle } from "~/components/locale-toggle"
import { ModeToggle } from "~/components/mode-toggle"
import { ParkbotFooter } from "~/components/parkbot-footer"
import { m } from "@paraglide/messages.js"
import "./welcome.css"

// A schematic illustration, independent of live plant data.
function ParkingIllustration() {
  return (
    <svg
      className="parking-illustration"
      viewBox="0 0 560 440"
      role="img"
      aria-label={m.welcome_diagram()}
    >
      <defs>
        <pattern
          id="parking-grid"
          width="28"
          height="28"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M28 0 H0 V28"
            fill="none"
            stroke="currentColor"
            strokeOpacity=".08"
          />
        </pattern>
        <g id="parking-car">
          <rect
            width="54"
            height="29"
            rx="9"
            fill="currentColor"
            fillOpacity=".13"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path
            d="M15 3 L12 8 V21 L15 26 M39 3 L42 8 V21 L39 26 M16 7 H38 V22 H16 Z"
            fill="none"
            stroke="currentColor"
            strokeOpacity=".65"
          />
          <path
            d="M5 6 V10 M5 19 V23 M49 6 V10 M49 19 V23"
            stroke="currentColor"
            strokeWidth="2"
          />
        </g>
      </defs>
      <rect width="560" height="440" fill="url(#parking-grid)" />
      <g transform="translate(280 215) rotate(-30) skewX(30) scale(.88)">
        <path d="M-190-142 H190 V142 H-190 Z" className="parking-slab" />
        <path
          d="M-190 142 V157 H190 V142 M190-142 V142 M-190-48 H190 M-190 48 H190"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".35"
        />
        {[-180, -108, -36, 36, 108].map((x, i) => (
          <g key={x}>
            <path
              d={`M${x} -132 v74 h64 v-74 M${x} 132 v-74 h64 v74`}
              fill="none"
              stroke="currentColor"
              strokeOpacity=".35"
            />
            {i !== 1 && <use href="#parking-car" x={x + 5} y={-112} />}
            {i !== 3 && <use href="#parking-car" x={x + 5} y={82} />}
          </g>
        ))}
        <path
          d="M-175 0 H175"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".35"
          strokeDasharray="5 7"
        />
        <g className="parking-shuttle">
          <rect
            x="-44"
            y="-38"
            width="88"
            height="76"
            rx="5"
            className="parking-platform"
          />
          <path
            d="M-36-29 H36 M-36 29 H36"
            stroke="currentColor"
            strokeWidth="3"
          />
          <use href="#parking-car" x="-27" y="-14.5" />
          <path
            d="M-58-8 L-66 0 L-58 8 M58-8 L66 0 L58 8"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </g>
        <path
          d="M-190-142 V-163 M190-142 V-163 M-190-156 H190"
          stroke="currentColor"
          strokeOpacity=".3"
        />
        <circle cx="-190" cy="-156" r="3" fill="currentColor" />
        <circle cx="190" cy="-156" r="3" fill="currentColor" />
      </g>
      <path
        d="M280 225 V358 H426"
        stroke="currentColor"
        strokeOpacity=".4"
        fill="none"
      />
      <circle cx="280" cy="225" r="4" fill="currentColor" />
      <text
        x="435"
        y="362"
        fill="currentColor"
        fontSize="11"
        fontFamily="monospace"
        letterSpacing="2"
      >
        APS
      </text>
      <text
        x="30"
        y="42"
        fill="currentColor"
        opacity=".5"
        fontSize="10"
        fontFamily="monospace"
        letterSpacing="2"
      >
        P / 01
      </text>
      <path
        d="M500 34 h20 M510 24 v20 M30 394 h20 M40 384 v20"
        stroke="currentColor"
        strokeOpacity=".4"
      />
    </svg>
  )
}

export function Welcome() {
  const features = [
    {
      icon: Layers3,
      title: m.welcome_overview_title(),
      description: m.welcome_overview_description(),
    },
    {
      icon: Cpu,
      title: m.welcome_devices_title(),
      description: m.welcome_devices_description(),
    },
    {
      icon: ChartNoAxesCombined,
      title: m.welcome_history_title(),
      description: m.welcome_history_description(),
    },
  ]

  return (
    <div className="welcome-page">
      <a className="welcome-skip" href="#main">
        {m.welcome_explore()}
      </a>
      <header className="welcome-header welcome-container">
        <Link to="/" className="welcome-brand" aria-label="Parkbot">
          <span className="welcome-brand-icon">
            <Bot size={32} strokeWidth={1.6} aria-hidden="true" />
          </span>
          <span>
            parkbot<span className="welcome-brand-dot">.</span>
          </span>
        </Link>
        <div className="welcome-controls">
          <LocaleToggle />
          <ModeToggle />
          <span className="welcome-control-divider" />
          <Link to="/signin" className="welcome-header-login">
            {m.signin()} <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </header>
      <main id="main">
        <section
          className="welcome-hero welcome-container"
          aria-labelledby="welcome-title"
        >
          <div className="welcome-copy">
            <p className="welcome-eyebrow">
              <span />
              {m.welcome_eyebrow()}
            </p>
            <h1 id="welcome-title">
              {m.welcome_heading()}
              <br />
              <span>{m.welcome_heading_accent()}</span>
            </h1>
            <p className="welcome-description">{m.welcome_description()}</p>
            <div className="welcome-actions">
              <Button
                className="welcome-primary"
                render={<Link to="/signin" />}
              >
                {m.welcome_login_button()}
                <ArrowRight size={18} aria-hidden="true" />
              </Button>
              <a href="#platform" className="welcome-explore">
                {m.welcome_explore()}
                <ArrowDown size={16} aria-hidden="true" />
              </a>
            </div>
            <p className="welcome-byline">
              <span />
              {m.welcome_text()}
            </p>
          </div>
          <figure className="welcome-visual">
            <div className="welcome-visual-heading">
              <span>{m.welcome_diagram_label()}</span>
              <span aria-hidden="true">↗</span>
            </div>
            <ParkingIllustration />
            <figcaption>
              <strong>{m.welcome_diagram_caption()}</strong>
              <span>{m.welcome_diagram_note()}</span>
            </figcaption>
          </figure>
        </section>
        <section
          className="welcome-features welcome-container"
          id="platform"
          aria-labelledby="platform-title"
        >
          <div className="welcome-section-heading">
            <span className="welcome-section-number" aria-hidden="true">
              01 — 03
            </span>
            <h2 id="platform-title">{m.welcome_platform()}</h2>
          </div>
          <div className="welcome-feature-grid">
            {features.map(({ icon: Icon, title, description }, index) => (
              <article className="welcome-feature" key={title}>
                <div className="welcome-feature-top">
                  <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
                  <span>0{index + 1}</span>
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <ParkbotFooter />
    </div>
  )
}
