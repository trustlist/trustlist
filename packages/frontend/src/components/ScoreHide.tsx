import { observer } from 'mobx-react-lite'
import './newListingModal.css'

type Props = {
    hidden: boolean
}

export default observer(({ hidden }: Props) => {
    return (
        <>
            {hidden ? (
                <div className="choose hide">
                    <img
                        src={require('../../public/eye_closed.svg')}
                        alt="eye with slash"
                    />
                </div>
            ) : (
                <div className="choose">
                    <img
                        src={require('../../public/eye_closed.svg')}
                        alt="eye with slash"
                    />
                </div>
            )}
        </>
    )
})
