import React from 'react'
import { Route } from 'react-router-dom'
import Personal from './personal/Personal'
import Library from './home/Library'
import Search from './home/Search'
import Settings from './home/Settings'
import Admin from './home/Admin'

const routes = [
  <Route exact path="/personal" render={() => <Personal />} key={'personal'} />,
  <Route exact path="/library" render={() => <Library />} key={'library'} />,
  <Route exact path="/search" render={() => <Search />} key={'search'} />,
  <Route exact path="/settings" render={() => <Settings />} key={'settings'} />,
  <Route exact path="/admin" render={() => <Admin />} key={'admin'} />,
]

export default routes
