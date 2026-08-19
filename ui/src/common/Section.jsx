import React from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'

// Section header + rail, matching the reference structure. The subtitle states
// the editorial rule behind the rail, not a description of the content.
const Section = ({ title, subtitle, seeAllTo, chips, children }) => (
  <section className="nd-sec">
    <div className="nd-sec-head">
      <div>
        <div className="nd-sec-title">
          <h2>{title}</h2>
          {seeAllTo ? (
            <Link className="nd-seeall" to={seeAllTo}>
              Ver todo <Icon name="chevron" size={14} className="nd-icon" />
            </Link>
          ) : null}
        </div>
        {subtitle ? <div className="nd-sub">{subtitle}</div> : null}
      </div>
      {chips}
      {children}
    </div>
  </section>
)

export default Section
