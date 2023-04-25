import React from 'react'
import { useParams, Link } from "react-router-dom";
import { observer } from 'mobx-react-lite'
import Button from '../components/Button'
import Tooltip from '../components/Tooltip';
import './deal.css'

import Trustlist from '../contexts/Trustlist';
import User from '../contexts/User'

type ReqInfo = {
  nonce: number
}

// type ProofInfo = {
//   publicSignals: string[]
//   proof: string[]
//   valid: boolean
// }

export default observer(() => {

  const { id }: any = useParams()
  const app = React.useContext(Trustlist)
  const user = React.useContext(User)

  const [reqData1, setReqData1] = React.useState<{
    [key: number]: number | string
  }>({})
  const [reqData2, setReqData2] = React.useState<{
    [key: number]: number | string
  }>({})
  const [reqInfo, setReqInfo] = React.useState<ReqInfo>({ nonce: 0 })
  // const [proveData, setProveData] = React.useState<{
  //     [key: number]: number | string
  // }>({})
  // const [repProof, setRepProof] = React.useState<ProofInfo>({
  //     publicSignals: [],
  //     proof: [],
  //     valid: false,
  // })

  const fieldType = (i: number) => {
    if (i < user.sumFieldCount) {
        return 'sum'
    } else if (i % 2 === user.sumFieldCount % 2) {
        return 'replace'
    } else return 'timestamp'
  }

  React.useEffect(() => {
    const loadData = async () => {
      await app.loadDealById(id)
    }
    loadData()
  }, [])

  const deal = app.listingsById.get(id)

  if (!user.userState) {
    return <div className="container">Loading...</div>
}

  return (
    <div>
      <hr style={{margin: '1rem'}}></hr>
      {/* <div style={{textAlign: 'center'}}>deal id: {id}</div> */}
      {deal ? 
        <>
        <div style={{textAlign: 'center'}}>
          <div>{deal.title} : ${deal.offerAmount}</div>
          <div>member1: {deal.posterId}</div>
          <div>member2: {deal.responderId}</div>
          {/* {deal.dealOpened ?
          <button onClick={() => app.updateDeal(id, 'close')}>complete deal and attest to interaction</button>  
          : null } */}
        </div>
      
      <div style={{display: 'flex'}}>

        <div className="attestation-container">
          <div className="icon">
              <h2>member1 attestation</h2>
              <Tooltip text="Create an attestation by rating your experience with this member." />
          </div>
          <div
              style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'flex-start',
              }}
          >
              {Array(
                  user.userState.sync.settings.sumFieldCount
              )
                  .fill(0)
                  .map((_, i) => {
                      return (
                          <div key={i} style={{ margin: '4px' }}>
                              <p>
                                  Score {i}
                              </p>
                              <input
                                  value={reqData1[i] ?? ''}
                                  onChange={(event) => {
                                      if (
                                          !/^\d*$/.test(
                                              event.target.value
                                          )
                                      )
                                          return
                                      setReqData1(() => ({
                                          ...reqData1,
                                          [i]: event.target.value,
                                      }))
                                  }}
                              />
                          </div>
                      )
                  })}
          </div>
          <div className="icon">
              <p style={{ marginRight: '8px' }}>
                  Epoch key nonce
              </p>
              <Tooltip text="Epoch keys are short lived identifiers for a user. They can be used to receive reputation and are valid only for 1 epoch." />
          </div>
          <select
              value={reqInfo.nonce ?? 0}
              onChange={(event) => {
                  setReqInfo((v) => ({
                      ...v,
                      nonce: Number(event.target.value),
                  }))
              }}
          >
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
          </select>
          <p style={{ fontSize: '12px' }}>
              Requesting data with epoch key:
          </p>
          <p
              style={{
                  maxWidth: '650px',
                  wordBreak: 'break-all',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
              }}
          >
              {user.epochKey(reqInfo.nonce ?? 0)}
          </p>

          <Button
              onClick={async () => {
                  if (
                      user.userState &&
                      user.userState.sync.calcCurrentEpoch() !==
                          (await user.userState.latestTransitionedEpoch())
                  ) {
                      throw new Error('Needs transition')
                  }
                  await user.requestReputation(
                      reqData1,
                      reqInfo.nonce ?? 0
                  )
                  setReqData1({})
              }}
          >
              Submit
          </Button>
        </div>

        <div className="attestation-container">
          <div className="icon">
              <h2>member2 attestation</h2>
              <Tooltip text="Create an attestation by rating your experience with this member." />
          </div>
          <div
              style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'flex-start',
              }}
          >
              {Array(
                  user.userState.sync.settings.sumFieldCount
              )
                  .fill(0)
                  .map((_, i) => {
                      return (
                          <div key={i} style={{ margin: '4px' }}>
                              <p>
                                  Score {i}
                              </p>
                              <input
                                  value={reqData2[i] ?? ''}
                                  onChange={(event) => {
                                      if (
                                          !/^\d*$/.test(
                                              event.target.value
                                          )
                                      )
                                          return
                                      setReqData2(() => ({
                                          ...reqData2,
                                          [i]: event.target.value,
                                      }))
                                  }}
                              />
                          </div>
                      )
                  })}
          </div>
          <div className="icon">
              <p style={{ marginRight: '8px' }}>
                  Epoch key nonce
              </p>
              <Tooltip text="Epoch keys are short lived identifiers for a user. They can be used to receive reputation and are valid only for 1 epoch." />
          </div>
          <select
              value={reqInfo.nonce ?? 0}
              onChange={(event) => {
                  setReqInfo((v) => ({
                      ...v,
                      nonce: Number(event.target.value),
                  }))
              }}
          >
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
          </select>
          <p style={{ fontSize: '12px' }}>
              Requesting data with epoch key:
          </p>
          <p
              style={{
                  maxWidth: '650px',
                  wordBreak: 'break-all',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
              }}
          >
              {user.epochKey(reqInfo.nonce ?? 0)}
          </p>

          <Button
              onClick={async () => {
                  if (
                      user.userState &&
                      user.userState.sync.calcCurrentEpoch() !==
                          (await user.userState.latestTransitionedEpoch())
                  ) {
                      throw new Error('Needs transition')
                  }
                  await user.requestReputation(
                      reqData2,
                      reqInfo.nonce ?? 0
                  )
                  setReqData2({})
              }}
          >
              Submit
          </Button>
        </div>

      </div>  

    </>
    : 'deal not found' }  
        
    </div>
  )
})