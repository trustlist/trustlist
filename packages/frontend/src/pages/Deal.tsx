import React from 'react'
import { useParams, Link } from "react-router-dom";
import { observer } from 'mobx-react-lite'
import Button from '../components/Button'
import Tooltip from '../components/Tooltip';
import './home.css'

import Trustlist from '../contexts/Trustlist';
import User from '../contexts/User'

export default observer(() => {

  const { id } = useParams()
  console.log(id)
  const app = React.useContext(Trustlist)
  const user = React.useContext(User)

  React.useEffect(() => {
    const loadData = async () => {
      // await app.loadDealById(id)
    }
    loadData()
  }, [])

  const deal = app.listingsById.get(id)

  return (
    <div>
      <div>{id}</div>
      {deal ? 
        <>
          {deal._id}
          {deal.title}
          {deal.posterId}
          {deal.responderId}
          {/* {deal.dealOpened ?
          <button onClick={() => app.updateDeal(id, 'close')}>complete deal and attest to interaction</button>  
          : null } */}
        </>
        : 'deal not found' }  
        
    </div>
  )
})