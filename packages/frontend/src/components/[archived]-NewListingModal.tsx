import { useContext, useState } from 'react'
import { observer } from 'mobx-react-lite'
import ScoreReveal from './ScoreReveal'
import ScoreHide from './ScoreHide'
import {Button} from '../components/ui/button'
// import './newListingModal.css'

import Trustlist from '../contexts/Trustlist'
import User from '../contexts/User'
import Interface from '../contexts/interface'

type Props = {
    setShowNewListing: (value: boolean) => void
}

type ReqInfo = {
    nonce: number
}

type ProofInfo = {
    publicSignals: string[]
    proof: string[]
    valid: boolean
}

export default observer(({ setShowNewListing }: Props) => {
    const app = useContext(Trustlist)
    const user = useContext(User)
    const ui = useContext(Interface)

    const [section, setSection] = useState('')
    const [category, setCategory] = useState('')
    const [title, setTitle] = useState('')
    const [amount, setAmount] = useState('')
    const [amountType, setAmountType] = useState('one time')
    const [description, setDescription] = useState('')
    const [pScores, setPScores] = useState<{
        [key: number]: number | string
    }>({ 0: 'X', 1: 'X', 2: 'X', 3: 'X' })
    const [hidden, setHidden] = useState<{
        [key: number]: boolean
    }>({ 0: true, 1: true, 2: true, 3: true })
    const [proveData, setProveData] = useState<{
        [key: number]: number | string
    }>({})
    const [reqInfo, setReqInfo] = useState<ReqInfo>({ nonce: 0 })
    const [repProof, setRepProof] = useState<ProofInfo>({
        publicSignals: [],
        proof: [],
        valid: false,
    })

    if (!user.userState) {
        return <div className="container">Loading...</div>
    }

    return (
        <div className="dark-bg">
            <div className="centered">
                <div className="modal">
                    <div className="form-content">
                        <div style={{ display: 'flex' }}>
                            <div style={{ marginRight: '1rem' }}>
                                <p style={{ fontWeight: '600' }}>
                                    listing type:
                                </p>
                                {app.sections.map((section) => (
                                    <div>
                                        <input
                                            type="radio"
                                            id={section}
                                            name="section"
                                            value={section}
                                            onChange={(e) =>
                                                setSection(e.target.value)
                                            }
                                        />
                                        <label htmlFor={section}></label>
                                        {section}
                                        <br />
                                    </div>
                                ))}
                            </div>

                            <div>
                                <p style={{ fontWeight: '600' }}>category:</p>
                                <div id="category-class">
                                    {section
                                        ? app.categoriesBySection
                                              .get(section)
                                              .map((category: string) => (
                                                  <div>
                                                      <input
                                                          type="radio"
                                                          id={category}
                                                          name="category"
                                                          value={category}
                                                          onChange={(e) =>
                                                              setCategory(
                                                                  e.target.value
                                                              )
                                                          }
                                                      />
                                                      <label
                                                          htmlFor={category}
                                                      ></label>
                                                      {category}
                                                      <br />
                                                  </div>
                                              ))
                                        : null}
                                </div>
                            </div>
                        </div>

                        <div className="form-flex">
                            <div className="form-container">
                                <div className="form-flex">
                                    <label htmlFor="title">title</label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        onChange={(e) =>
                                            setTitle(e.target.value)
                                        }
                                    />
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <div className="form-flex">
                                        <label htmlFor="amount">amount</label>
                                        <input
                                            type="number"
                                            id="amount"
                                            name="amount"
                                            onChange={(e) =>
                                                setAmount(e.target.value)
                                            }
                                            className="form-input-sm"
                                        />
                                    </div>
                                    <div className="form-flex">
                                        <label htmlFor="amountType">
                                            amount type
                                        </label>
                                        <select
                                            id="amountType"
                                            name="amountType"
                                            onChange={(e) =>
                                                setAmountType(e.target.value)
                                            }
                                        >
                                            <option value="one time">
                                                one time
                                            </option>
                                            <option value="per day">
                                                per day
                                            </option>
                                            <option value="per week">
                                                per week
                                            </option>
                                            <option value="per month">
                                                per month
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-flex">
                                    <label htmlFor="description">
                                        description
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        onChange={(e) =>
                                            setDescription(e.target.value)
                                        }
                                        className="form-textarea"
                                    />
                                </div>
                            </div>

                            <div
                                className="form-container"
                                style={{ paddingBottom: '0.3rem' }}
                            >
                                <div className="score-display">
                                    {app.scoreNames.map((name, i) => {
                                        const score = Number(
                                            user.provableData[i]
                                        )
                                        return (
                                            <div key={i}>
                                                <div
                                                    style={{
                                                        fontWeight: '600',
                                                    }}
                                                >
                                                    {name} Score:{' '}
                                                    {app.calcScoreFromUserData(
                                                        score
                                                    )}
                                                    %
                                                </div>
                                                <div className="score-boxes">
                                                    <div
                                                        onClick={() => {
                                                            setHidden(() => ({
                                                                ...hidden,
                                                                [i]: false,
                                                            }))
                                                            setPScores(() => ({
                                                                ...pScores,
                                                                [i]: score,
                                                            }))
                                                            setProveData(
                                                                () => ({
                                                                    ...proveData,
                                                                    [i]: score,
                                                                })
                                                            )
                                                        }}
                                                    >
                                                        <ScoreReveal
                                                            hidden={hidden[i]}
                                                        />
                                                    </div>

                                                    <div
                                                        onClick={() => {
                                                            setHidden(() => ({
                                                                ...hidden,
                                                                [i]: true,
                                                            }))
                                                            setPScores(() => ({
                                                                ...pScores,
                                                                [i]: 'X',
                                                            }))
                                                        }}
                                                    >
                                                        <ScoreHide
                                                            hidden={hidden[i]}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                <div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            padding: '1rem 0 0 0.5rem',
                                        }}
                                    >
                                        <select
                                            value={reqInfo.nonce ?? 0}
                                            onChange={(event) => {
                                                setReqInfo((v) => ({
                                                    ...v,
                                                    nonce: Number(
                                                        event.target.value
                                                    ),
                                                }))
                                            }}
                                        >
                                            <option value="0">0</option>
                                            <option value="1">1</option>
                                            {/* <option value="2">2</option> */}
                                        </select>
                                        <p style={{ fontSize: '12px' }}>
                                            Create listing with epoch key:
                                        </p>
                                    </div>
                                    <p
                                        className="epoch-key"
                                        style={{ maxWidth: '650px' }}
                                    >
                                        {user.epochKey(reqInfo.nonce ?? 0)}
                                    </p>
                                </div>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                {repProof.proof.length ? (
                                    <div className="proof">
                                        {repProof.valid ? '✅' : '❌'}
                                    </div>
                                ) : null}

                                <Button
                                    onClick={async () => {
                                        if (!section) {
                                            window.alert(
                                                'please select a section for your listing.'
                                            )
                                            return
                                        }
                                        if (!category) {
                                            window.alert(
                                                'please select a category for your listing.'
                                            )
                                            return
                                        }
                                        if (!title) {
                                            window.alert(
                                                'please provide a title for your listing.'
                                            )
                                            return
                                        }
                                        if (!amount) {
                                            window.alert(
                                                'please provide an amount for your listing.'
                                            )
                                            return
                                        }
                                        if (!description) {
                                            window.alert(
                                                'please provide a description for your listing.'
                                            )
                                            return
                                        }
                                        const proof = await user.proveData(
                                            proveData
                                        )
                                        setRepProof(proof)
                                    }}
                                >
                                    {!ui.isMobile
                                        ? 'prove trust scores'
                                        : 'prove scores'}
                                </Button>

                                {/* only allow post after valid proof */}
                                {repProof.valid ? (
                                    <Button
                                        style={{
                                            backgroundColor: 'blue',
                                            color: 'white',
                                            marginLeft: '0.5rem',
                                        }}
                                        onClick={async () => {
                                            if (
                                                user.userState &&
                                                user.userState.sync.calcCurrentEpoch() !==
                                                    (await user.userState.latestTransitionedEpoch())
                                            ) {
                                                throw new Error(
                                                    'please transition to the current epoch before posting'
                                                )
                                            }
                                            // +1 to current member's initiated LP score
                                            await user.requestData(
                                                { [0]: 1 << 23 },
                                                reqInfo.nonce ?? 0,
                                                ''
                                            )
                                            const epoch =
                                                user.userState?.sync.calcCurrentEpoch()
                                            const posterId = user.epochKey(
                                                reqInfo.nonce
                                            )
                                            const scoreString =
                                                JSON.stringify(pScores)
                                            const message =
                                                await app.createNewListing(
                                                    epoch,
                                                    section,
                                                    category,
                                                    title,
                                                    amount,
                                                    amountType,
                                                    description,
                                                    posterId,
                                                    scoreString
                                                )
                                            window.alert(message)
                                            setShowNewListing(false)
                                            window.location.reload()
                                        }}
                                    >
                                        POST
                                    </Button>
                                ) : (
                                    <button className="blocked">POST</button>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        className="close-btn"
                        onClick={() => setShowNewListing(false)}
                    >
                        X
                    </button>
                </div>
            </div>
        </div>
    )
})
