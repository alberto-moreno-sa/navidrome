import React from 'react'
import { Route } from 'react-router-dom'
import Personal from './personal/Personal'
import Library from './home/Library'

const routes = [
  <Route exact path="/personal" render={() => <Personal />} key={'personal'} />,
  <Route exact path="/library" render={() => <Library />} key={'library'} />,
]

export default routes
