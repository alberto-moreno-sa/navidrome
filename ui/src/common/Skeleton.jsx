import React from 'react'

// Loading placeholders that mirror the real card/row geometry, so content
// doesn't jump when it arrives. Shimmer respects prefers-reduced-motion (CSS).
export const SkeletonCard = () => (
  <div className="nd-cardwrap">
    <div className="nd-card">
      <div className="nd-art nd-sk" />
      <div className="nd-meta">
        <div className="lines">
          <div className="nd-sk nd-sk-line" />
          <div className="nd-sk nd-sk-line short" />
        </div>
      </div>
    </div>
  </div>
)

export const SkeletonRail = ({ count = 6 }) => (
  <div className="nd-rail cols-6" aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
)

export const SkeletonRow = () => (
  <div className="nd-listrow" aria-hidden="true">
    <span className="th nd-sk" />
    <div className="lines">
      <div className="nd-sk nd-sk-line" />
      <div className="nd-sk nd-sk-line short" />
    </div>
  </div>
)

export const SkeletonList = ({ count = 8 }) => (
  <div className="nd-list" aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonRow key={i} />
    ))}
  </div>
)

export default SkeletonRail
