import React from 'react'
import { useContainerWidth } from './useContainerWidth'
import { columnsFor } from './columns'

// A bleed rail (see redesign.css .nd-rail). Column count comes from the measured
// width of the rail itself, so it discounts sidebar/drawer automatically.
const Rail = ({ variant = 'dense', children, className = '' }) => {
  const [ref, width] = useContainerWidth()
  const cols = columnsFor(variant, width)
  return (
    <div ref={ref} className={`nd-rail cols-${cols} ${className}`}>
      {children}
    </div>
  )
}

export default Rail
