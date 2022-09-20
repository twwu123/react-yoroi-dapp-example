import React, { useState, useEffect } from 'react';

const YoroiContext = React.createContext(null);

export const YoroiProvider = ({children}) => {
    const [api, setApi] = useState(null)

    useEffect(() => {
        connect(true, true)
    }, [])

    const connect = (requestId, silent) => {
        if (!window.cardano.yoroi) {
            alert("Yoroi wallet not found! Please install it")
            return
        }
        window.cardano.yoroi.enable({requestIdentification: requestId, onlySilent: silent})
            .then((connectedApi) => {
                setApi(connectedApi)
            })
            .catch((e) => {
                console.log(e)
            })
    }

    const values = {api, connect}
    
    return <YoroiContext.Provider value={values}>{children}</YoroiContext.Provider>
}

const useYoroi = () => {
    const context = React.useContext(YoroiContext)

    if (context === undefined) {
        throw new Error("Install Yoroi")
    }
    
    return context
}

export default useYoroi;