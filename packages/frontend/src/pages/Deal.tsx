import React from 'react'
import { useParams, Link } from "react-router-dom";
import { observer } from 'mobx-react-lite'
import Button from '../components/Button'
import Tooltip from '../components/Tooltip';
import './home.css'

import Trustlist from '../contexts/Trustlist';
import User from '../contexts/User'

type ReqInfo = {
  nonce: number
}

type ProofInfo = {
  publicSignals: string[]
  proof: string[]
  valid: boolean
}

export default observer(() => {

  const { id }: any = useParams()
  const app = React.useContext(Trustlist)
  const user = React.useContext(User)

  const [reqData, setReqData] = React.useState<{
    [key: number]: number | string
  }>({})
  const [reqInfo, setReqInfo] = React.useState<ReqInfo>({ nonce: 0 })
  const [proveData, setProveData] = React.useState<{
      [key: number]: number | string
  }>({})
  const [repProof, setRepProof] = React.useState<ProofInfo>({
      publicSignals: [],
      proof: [],
      valid: false,
  })

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
      <hr style={{margin: '3rem'}}></hr>
      <div>{id}</div>
      {deal ? 
        <>
        <div>
          {/* {deal._id} */}
          {deal.title} / {deal.posterId} / {deal.responderId}
          {deal.dealOpened ?
          <button onClick={() => app.updateDeal(id, 'close')}>complete deal and attest to interaction</button>  
          : null }
        </div>

<hr style={{margin: '3rem'}}></hr>

        <div>
        <div className="action-container">
                        <div className="icon">
                            <h2>Change Data</h2>
                            <Tooltip text="You can request changes to data here. The demo attester will freely change your data." />
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                justifyContent: 'flex-start',
                            }}
                        >
                            {Array(
                                user.userState.sync.settings.fieldCount
                            )
                                .fill(0)
                                .map((_, i) => {
                                    return (
                                        <div key={i} style={{ margin: '4px' }}>
                                            <p>
                                                Data {i} ({fieldType(i)})
                                            </p>
                                            <input
                                                value={reqData[i] ?? ''}
                                                onChange={(event) => {
                                                    if (
                                                        !/^\d*$/.test(
                                                            event.target.value
                                                        )
                                                    )
                                                        return
                                                    setReqData(() => ({
                                                        ...reqData,
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
                                    reqData,
                                    reqInfo.nonce ?? 0
                                )
                                setReqData({})
                            }}
                        >
                            Attest
                        </Button>
                    </div>
        </div>
        </>
        : 'deal not found' }  
        
    </div>
  )
})