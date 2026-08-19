import React from 'react'
import ArtistList from './ArtistList'
import ArtistShow from './ArtistShow'
import ArtistPage from './ArtistPage'
import DynamicMenuIcon from '../layout/DynamicMenuIcon'
import MicNoneOutlinedIcon from '@material-ui/icons/MicNoneOutlined'
import MicIcon from '@material-ui/icons/Mic'

export default {
  list: ArtistList,
  show: ArtistPage,
  icon: (
    <DynamicMenuIcon
      path={'artist'}
      icon={MicNoneOutlinedIcon}
      activeIcon={MicIcon}
    />
  ),
}
