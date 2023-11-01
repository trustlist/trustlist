import { useContext, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import ReviewForm from '../components/ReviewForm'
import Button from '../components/Button'
import './deal.css'

import Trustlist from '../contexts/Trustlist'
import User from '../contexts/User'
import Interface from '../contexts/interface'

export default observer(() => {
    const { id }: any = useParams()
    const app = useContext(Trustlist)
    const user = useContext(User)
    const ui = useContext(Interface)

    useEffect(() => {
        const loadData = async () => {
            await app.loadDealById(id)
        }
        loadData()
    }, [])

    const deal = app.listingsById.get(id)
    const memberKeys = [user.epochKey(0), user.epochKey(1)]

    if (!user.userState) {
        return <div className="container">Loading...</div>
    }

    return (
        <>
            <div className="deal-content">
                {deal &&
                deal.epoch !== user.userState?.sync.calcCurrentEpoch() ? (
                    <div className="deal-expired">🚫 this deal has expired</div>
                ) : null}
                {deal && ui.isMobile ? (
                    <div style={{ textAlign: 'center' }}>
                        <h3>{deal.title.slice(0, 25)}</h3>
                        <h3>${deal.offerAmount}</h3>
                        <h3>{deal.contact}</h3>
                    </div>
                ) : null}
                {deal ? (
                    <>
                        <div className="deal-info">
                            <div className="member-info">
                                <div>poster id:</div>
                                <div style={{ color: 'black' }}>
                                    {deal.posterId.slice(0, 10)}...
                                </div>
                                {deal.posterDealClosed ? (
                                    <>
                                        <div className="checked">✅</div>
                                        <div>deal complete</div>
                                    </>
                                ) : (
                                    <>
                                        <div className="unchecked">
                                            {memberKeys.includes(
                                                deal.posterId
                                            ) ? (
                                                <Button
                                                    style={{
                                                        backgroundColor:
                                                            'white',
                                                        border: 'none',
                                                        padding: '0 0',
                                                        fontSize: '2rem',
                                                    }}
                                                    onClick={async () => {
                                                        const message =
                                                            await app.dealClose(
                                                                deal._id,
                                                                'poster'
                                                            )
                                                        if (
                                                            deal.responderDealClosed
                                                        ) {
                                                            // +1 to responder's completed LO score
                                                            // +1 to responder's initiated CB score
                                                            await user.requestData(
                                                                {
                                                                    [1]: 1,
                                                                    [2]:
                                                                        1 << 23,
                                                                },
                                                                memberKeys.indexOf(
                                                                    deal.posterId
                                                                ) ?? 0,
                                                                deal.responderId
                                                            )
                                                            // +1 to poster's completed LP score
                                                            // +1 to poster's initiated CB score
                                                            await user.requestData(
                                                                {
                                                                    [0]: 1,
                                                                    [2]:
                                                                        1 << 23,
                                                                },
                                                                memberKeys.indexOf(
                                                                    deal.posterId
                                                                ) ?? 0,
                                                                ''
                                                            )
                                                        }
                                                        window.alert(message)
                                                        window.location.reload()
                                                    }}
                                                >
                                                    ☑️
                                                </Button>
                                            ) : (
                                                <Button
                                                    style={{
                                                        cursor: 'not-allowed',
                                                        backgroundColor:
                                                            'white',
                                                        border: 'none',
                                                        padding: '0 0',
                                                        fontSize: '2rem',
                                                    }}
                                                >
                                                    ☑️
                                                </Button>
                                            )}
                                        </div>
                                        <div>deal pending</div>
                                    </>
                                )}
                            </div>

                            {!ui.isMobile ? (
                                <div>
                                    <h3>{deal.title.slice(0, 25)}</h3>
                                    <h3>${deal.offerAmount}</h3>
                                    <h3>{deal.contact}</h3>
                                </div>
                            ) : null}

                            <div className="member-info">
                                <div>responder id:</div>
                                <div style={{ color: 'black' }}>
                                    {deal.responderId.slice(0, 10)}...
                                </div>
                                {deal.responderDealClosed ? (
                                    <>
                                        <div className="checked">✅</div>
                                        <div>deal complete</div>
                                    </>
                                ) : (
                                    <>
                                        <div className="unchecked">
                                            {memberKeys.includes(
                                                deal.responderId
                                            ) ? (
                                                <Button
                                                    style={{
                                                        backgroundColor:
                                                            'white',
                                                        border: 'none',
                                                        padding: '0 0',
                                                        fontSize: '2rem',
                                                    }}
                                                    onClick={async () => {
                                                        const message =
                                                            await app.dealClose(
                                                                deal._id,
                                                                'responder'
                                                            )
                                                        if (
                                                            deal.posterDealClosed
                                                        ) {
                                                            // +1 to responder's completed LO score
                                                            // +1 to responder's initiated CB score
                                                            await user.requestData(
                                                                {
                                                                    [1]: 1,
                                                                    [2]:
                                                                        1 << 23,
                                                                },
                                                                memberKeys.indexOf(
                                                                    deal.responderId
                                                                ) ?? 0,
                                                                ''
                                                            )
                                                            // +1 to poster's completed LP score
                                                            // +1 to poster's initiated CB score
                                                            await user.requestData(
                                                                {
                                                                    [0]: 1,
                                                                    [2]:
                                                                        1 << 23,
                                                                },
                                                                memberKeys.indexOf(
                                                                    deal.responderId
                                                                ) ?? 0,
                                                                deal.posterId
                                                            )
                                                        }
                                                        window.alert(message)
                                                        window.location.reload()
                                                    }}
                                                >
                                                    ☑️
                                                </Button>
                                            ) : (
                                                <Button
                                                    style={{
                                                        cursor: 'not-allowed',
                                                        backgroundColor:
                                                            'white',
                                                        border: 'none',
                                                        padding: '0 0',
                                                        fontSize: '2rem',
                                                    }}
                                                >
                                                    ☑️
                                                </Button>
                                            )}
                                        </div>
                                        <div>deal pending</div>
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    'deal not found'
                )}
            </div>

            {deal && deal.posterDealClosed && deal.responderDealClosed ? (
                <div className="attestation-container">
                    <ReviewForm
                        key={deal.posterId}
                        dealId={deal._id}
                        member="poster"
                        memberKeys={memberKeys}
                        currentMemberId={deal.posterId}
                        oppositeMemberId={deal.responderId}
                        currentMemberReview={deal.posterReview}
                        oppositeMemberReview={deal.responderReview}
                    />
                    <ReviewForm
                        key={deal.responderId}
                        dealId={deal._id}
                        member="responder"
                        memberKeys={memberKeys}
                        currentMemberId={deal.responderId}
                        oppositeMemberId={deal.posterId}
                        currentMemberReview={deal.responderReview}
                        oppositeMemberReview={deal.posterReview}
                    />
                </div>
            ) : (
                <div
                    style={{
                        color: 'black',
                        textAlign: 'center',
                        padding: '2rem 4rem',
                    }}
                >
                    both members must mark deal complete to enable reviews
                </div>
            )}
        </>
    )
})
