import { useState } from "react";
import useYoroi from "../../../hooks/yoroiProvider";
import useWasm, { useWasmTxBuilder } from "../../../hooks/useWasm";
import { hexToBytes, bytesToHex, wasmMultiassetToJSONs } from "../../../utils/utils"

const Cip30Tab = () => {
    const { api } = useYoroi()
    const wasm = useWasm()
    return (
        <div className="container mx-auto text-gray-300 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                    <IsEnabledCard />
                </div>
                <div>
                    <GetBalanceCard api={api} wasm={wasm} />
                </div>
                <div>
                    <GetUnusedAddressesCard api={api} wasm={wasm} />
                </div>
                <div>
                    <GetUsedAddresses api={api} wasm={wasm} />
                </div>
                <div>
                    <GetChangeAddressCard api={api} wasm={wasm} />
                </div>
                <div>
                    <GetRewardAddressesCard api={api} wasm={wasm} />
                </div>
                <div>
                    <GetUtxosCard api={api} wasm={wasm} />
                </div>
                <div>
                    <GetCollateralUtxosCard api={api} wasm={wasm} />
                </div>
                <div>
                    <SignTransactionCard api={api} wasm={wasm} />
                </div>
                <div>
                    <SubmitTransactionCard api={api} />
                </div>
            </div>

        </div>
    );
}

const ApiCard = (props) => {
    const { apiName, apiDescription, text, clickFunction, inputs, children } = props

    return (
        <div className="flex flex-col max-w-sm h-full rounded-lg border shadow-md bg-gray-800 border-gray-700">
            <button className="w-full h-20 bg-orange-700 hover:bg-orange-800 rounded-t-lg text-white" onClick={clickFunction}>{apiName}</button>
            <div className="p-5">
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-white">{apiName + "(" + (inputs ? inputs : "") + ")"}</h5>
                <p className="mb-3 font-normal text-gray-400">{apiDescription}</p>
            </div>
            {children}
            <div className="flex-grow">
                <textarea className="w-full h-full flex-row rounded bg-gray-900 text-white px-2" disabled readOnly value={text}></textarea>
            </div>
        </div>
    );
}

const InputModal = (props) => {
    const [showModal, setShowModal] = useState(false);
    const { buttonLabel, children } = props
    return (
        <div className="grid justify-items-center pb-2">
            <button className="block text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-gray-600 hover:bg-gray-700 focus:ring-gray-800" type="button"
                onClick={() => setShowModal(!showModal)} >
                {buttonLabel}
            </button >
            {showModal &&
                <div className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full">
                    <div
                        className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
                    >
                        <div className="relative w-auto my-6 mx-auto max-w-3xl">
                            {/*content*/}
                            <div className="bg-gray-900 border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                                {/*header*/}
                                <div className="bg-gray-900 flex items-start justify-between p-5 rounded-t">
                                    <h3 className="text-3xl font-semibold">
                                        Inputs
                                    </h3>
                                    <button
                                        className="p-1 ml-auto bg-transparent border-0 text-white float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                                        onClick={() => setShowModal(false)}
                                    >
                                        ×

                                    </button>
                                </div>
                                {/*body*/}
                                <div className="bg-gray-900 relative p-6 flex-auto">
                                    {children}
                                </div>
                                {/*footer*/}
                                <div className="bg-gray-900 flex items-center justify-end p-6 rounded-b">
                                    <button
                                        className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>}
        </div>
    );
}

const IsEnabledCard = () => {
    const [isEnabledText, setIsEnabledText] = useState("")

    const isDisabledClick = () => {
        window.cardano.yoroi?.isEnabled()
            .then((enabled) => {
                setIsEnabledText(enabled)
            })
            .catch((e) => {
                setIsEnabledText(e.info)
                console.log(e)
            })
    }

    const apiProps = {
        apiName: "isEnabled",
        apiDescription: "Returns true or false depending on whether Yoroi is enabled",
        text: isEnabledText,
        clickFunction: isDisabledClick
    }

    return (
        <ApiCard {...apiProps} />
    );
}

const GetBalanceCard = ({ api, wasm }) => {
    const [getBalanceText, setGetBalanceText] = useState("")

    const getBalanceClick = () => {
        api?.getBalance()
            .then((hexBalance) => {
                const wasmValue = wasm.Value.from_bytes(hexToBytes(hexBalance))
                const adaValue = wasmValue.coin().to_str()
                const assetValue = wasmMultiassetToJSONs(wasmValue.multiasset())
                setGetBalanceText(`lovelaces: ${adaValue} Assets: ${JSON.stringify(assetValue)}`)
            })
            .catch((e) => {
                setGetBalanceText(e.info)
                console.log(e)
            })
    }

    const apiProps = {
        apiName: "getBalance",
        apiDescription: "Returns the balance of your account in lovelaces and tokens",
        text: getBalanceText,
        clickFunction: getBalanceClick
    }

    return (
        <ApiCard {...apiProps} />
    );
}

const GetUnusedAddressesCard = ({ api, wasm }) => {
    const [unusedAddressesText, setUnusedAddressesText] = useState("")

    const getUnusedAddressesClick = () => {
        api?.getUnusedAddresses()
            .then((hexAddresses) => {
                const addresses = []
                for (let i = 0; i < hexAddresses.length; i++) {
                    const wasmAddress = wasm.Address.from_bytes(hexToBytes(hexAddresses[i]))
                    addresses.push(wasmAddress.to_bech32())
                }
                setUnusedAddressesText(addresses)
            })
            .catch((e) => {
                setUnusedAddressesText(e.info)
                console.log(e)
            })
    }

    const apiProps = {
        apiName: "getUnusedAddresses",
        apiDescription: "Returns the unused addresses of your Yoroi wallet",
        text: unusedAddressesText,
        clickFunction: getUnusedAddressesClick
    }

    return (
        <ApiCard {...apiProps} />
    );
}

const GetUsedAddresses = ({ api, wasm }) => {
    const [usedAddressesText, setUsedAddressesText] = useState("")
    const [usedAddressInput, setUsedAddressInput] = useState({ page: 0, limit: 5 })

    const getUsedAddressesClick = () => {
        api?.getUsedAddresses(usedAddressInput)
            .then((hexAddresses) => {
                const addresses = []
                for (let i = 0; i < hexAddresses.length; i++) {
                    const wasmAddress = wasm.Address.from_bytes(hexToBytes(hexAddresses[i]))
                    addresses.push(wasmAddress.to_bech32())
                }
                setUsedAddressesText(addresses)
            })
            .catch((e) => {
                setUsedAddressesText(e.info)
                console.log(e)
            })
    }


    const apiProps = {
        apiName: "getUsedAddresses",
        apiDescription: "Returns already used addresses of your Yoroi wallet",
        text: usedAddressesText,
        inputs: "{page: number, limit: number}",
        clickFunction: getUsedAddressesClick
    }

    return (
        <ApiCard {...apiProps}>
            <InputModal buttonLabel="Set Inputs">
                <div className="grid gap-6 mb-6 md:grid-cols-2 px-4">
                    <div>
                        <label htmlFor="page" className="block mb-2 text-sm font-medium text-gray-300">Page</label>
                        <input type="number" min="0" id="page" className="appearance-none border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="0"
                            value={usedAddressInput.page} onChange={(event) => setUsedAddressInput({ ...usedAddressInput, page: Number(event.target.value) })} />
                    </div>
                    <div>
                        <label htmlFor="limit" className="block mb-2 text-sm font-medium text-gray-300">Limit</label>
                        <input type="number" min="0" id="limit" className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="5"
                            value={usedAddressInput.limit} onChange={(event) => setUsedAddressInput({ ...usedAddressInput, limit: Number(event.target.value) })} />
                    </div>
                </div>
            </InputModal>
        </ApiCard>
    )
}

const GetChangeAddressCard = ({ api, wasm }) => {
    const [getChangeAddressText, setGetChangeAddressText] = useState("")

    const getChangeAddressClick = () => {
        api?.getChangeAddress()
            .then((hexAddress) => {
                const wasmAddress = wasm.Address.from_bytes(hexToBytes(hexAddress))
                setGetChangeAddressText(wasmAddress.to_bech32())
            })
            .catch((e) => {
                setGetChangeAddressText(e.info)
                console.log(e)
            })
    }

    const apiProps = {
        apiName: "getChangeAddress",
        apiDescription: "Returns your change address, Yoroi generates a new one every transaction",
        text: getChangeAddressText,
        clickFunction: getChangeAddressClick
    }
    return (
        <ApiCard {...apiProps} />
    );
}

const GetRewardAddressesCard = ({ api, wasm }) => {
    const [rewardAddressesText, setRewardAddressesText] = useState("")

    const getRewardAddressesClick = () => {
        api?.getRewardAddresses()
            .then((hexAddresses) => {
                const addresses = []
                for (let i = 0; i < hexAddresses.length; i++) {
                    const wasmAddress = wasm.Address.from_bytes(hexToBytes(hexAddresses[i]))
                    addresses.push(wasmAddress.to_bech32())
                }
                setRewardAddressesText(addresses)
            })
            .catch((e) => {
                setRewardAddressesText(e.info)
                console.log(e)
            })
    }


    const apiProps = {
        apiName: "getRewardAddresses",
        apiDescription: "Returns your reward addresses, these are where your staking rewards go",
        text: rewardAddressesText,
        clickFunction: getRewardAddressesClick
    }

    return (
        <ApiCard {...apiProps} />
    );
}

const GetUtxosCard = ({ api, wasm }) => {
    const [getUtxosText, setGetUtxosText] = useState("")
    const [getUtxosInput, setGetUtxosInput] = useState({ amount: "", page: 0, limit: 10 })

    const getUtxosClick = () => {
        api?.getUtxos(getUtxosInput.amount, { page: getUtxosInput.page, limit: getUtxosInput.limit })
            .then((hexUtxos) => {
                let utxos = []
                for (let i = 0; i < hexUtxos.length; i++) {
                    const utxo = {}
                    const wasmUtxo = wasm.TransactionUnspentOutput.from_bytes(hexToBytes(hexUtxos[i]))
                    const output = wasmUtxo.output()
                    const input = wasmUtxo.input()
                    utxo.tx_hash = bytesToHex(input.transaction_id().to_bytes())
                    utxo.tx_index = input.index()
                    utxo.receiver = output.address().to_bech32()
                    utxo.amount = output.amount().coin().to_str()
                    utxo.asset = wasmMultiassetToJSONs(output.amount().multiasset())
                    utxos.push(JSON.stringify(utxo))
                }
                setGetUtxosText(utxos)
            })
            .catch((e) => {
                setGetUtxosText(e.info)
                console.log(e)
            })
    }

    const apiProps = {
        apiName: "getUtxos",
        apiDescription: "Returns the available UTXOs within your wallet. If \"amount\" is undefined, returns all UTXOs, else perform UTXO selection for amount",
        text: getUtxosText,
        clickFunction: getUtxosClick,
        inputs: "amount: string, {page: number, limit: number}"
    }

    return (
        <ApiCard {...apiProps}>
            <InputModal buttonLabel="Set Inputs">
                <div className="px-4 pb-3">
                    <label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-300">Amount</label>
                    <input type="number" min="0" id="amount" className="appearance-none border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder=""
                        value={getUtxosInput.amount} onChange={(event) => setGetUtxosInput({ ...getUtxosInput, amount: event.target.value })} />
                </div>
                <div className="grid gap-6 mb-6 md:grid-cols-2 px-4">
                    <div>
                        <label htmlFor="page" className="block mb-2 text-sm font-medium text-gray-300">Page</label>
                        <input type="number" min="0" id="page" className="appearance-none border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder=""
                            value={getUtxosInput.page} onChange={(event) => setGetUtxosInput({ ...getUtxosInput, page: Number(event.target.value) })} />
                    </div>
                    <div>
                        <label htmlFor="limit" className="block mb-2 text-sm font-medium text-gray-300">Limit</label>
                        <input type="number" min="0" id="limit" className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder=""
                            value={getUtxosInput.limit} onChange={(event) => setGetUtxosInput({ ...getUtxosInput, limit: Number(event.target.value) })} />
                    </div>
                </div>
            </InputModal>
        </ApiCard>
    );
}

const GetCollateralUtxosCard = ({ api, wasm }) => {
    const [getCollateralUtxosText, setGetCollateralUtxosText] = useState("")
    const [getCollateralUtxosInput, setGetCollateralUtxosInput] = useState(2000000)

    const getCollateralUtxosClick = () => {
        api?.getCollateral(getCollateralUtxosInput)
            .then((hexUtxos) => {
                let utxos = []
                for (let i = 0; i < hexUtxos.length; i++) {
                    const utxo = {}
                    const wasmUtxo = wasm.TransactionUnspentOutput.from_bytes(hexToBytes(hexUtxos[i]))
                    const output = wasmUtxo.output()
                    const input = wasmUtxo.input()
                    utxo.tx_hash = bytesToHex(input.transaction_id().to_bytes())
                    utxo.tx_index = input.index()
                    utxo.receiver = output.address().to_bech32()
                    utxo.amount = output.amount().coin().to_str()
                    utxo.asset = wasmMultiassetToJSONs(output.amount().multiasset())
                    utxos.push(JSON.stringify(utxo))
                }
                setGetCollateralUtxosText(utxos)
            })
            .catch((e) => {
                setGetCollateralUtxosText(e.info)
                console.log(e)
            })

    }

    const apiProps = {
        apiName: "getCollateral",
        apiDescription: "Returns UTXOs usable for collateral (required by plutus transactions)",
        text: getCollateralUtxosText,
        clickFunction: getCollateralUtxosClick,
        inputs: "amount: number"
    }

    return (
        <ApiCard {...apiProps}>
            <InputModal buttonLabel="Set Inputs">
                <div className="px-4 pb-3">
                    <label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-300">Amount</label>
                    <input type="number" min="0" id="amount" className="appearance-none border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="2000000"
                        value={getCollateralUtxosInput} onChange={(event) => setGetCollateralUtxosInput(Number(event.target.value))} />
                </div>
            </InputModal>
        </ApiCard>
    );
}

const SignTransactionCard = ({ api, wasm }) => {
    const [signTransactionText, setSignTransactionText] = useState("")
    const [buildTransactionInput, setBuildTransactionInput] = useState({ amount: "2000000", address: "" })
    const [signTransactionInput, setSignTransactionInput] = useState("")
    const txBuilder = useWasmTxBuilder()

    const buildTransaction = async () => {
        // We add half an ADA more for fees
        const adaValue = (Number(buildTransactionInput.amount) + 500000).toString()
        const hexUtxos = await api?.getUtxos(adaValue)

        const txInputsBuilder = wasm.TxInputsBuilder.new()
        for (let i = 0; i < hexUtxos.length; i++) {
            const wasmUtxo = wasm.TransactionUnspentOutput.from_bytes(hexToBytes(hexUtxos[i]))
            txInputsBuilder.add_input(wasmUtxo.output().address(), wasmUtxo.input(), wasmUtxo.output().amount())
        }
        txBuilder.set_inputs(txInputsBuilder)
        const changeAddress = await api?.getChangeAddress()
        const wasmChangeAddress = wasm.Address.from_bytes(hexToBytes(changeAddress))
        const wasmOutputAddress = buildTransactionInput.address ? buildTransactionInput.address : wasmChangeAddress
        const wasmOutput = wasm.TransactionOutput.new(wasmOutputAddress, wasm.Value.new(wasm.BigNum.from_str(adaValue)))
        txBuilder.add_output(wasmOutput)

        txBuilder.add_change_if_needed(wasmChangeAddress)

        const wasmUnsignedTransaction = txBuilder.build_tx()
        setSignTransactionInput(bytesToHex(wasmUnsignedTransaction.to_bytes()))
        return bytesToHex(wasmUnsignedTransaction.to_bytes())
    }

    const signTransactionClick = async () => {
        let txHex = signTransactionInput
        if (!txHex) {
            txHex = await buildTransaction()
        }
        api?.signTx(txHex)
            .then((witnessHex) => {
                const wasmUnsignedTransaction = wasm.Transaction.from_bytes(hexToBytes(txHex))
                const wasmWitnessSet = wasm.TransactionWitnessSet.from_bytes(hexToBytes(witnessHex))
                const wasmSignedTransaction = wasm.Transaction.new(wasmUnsignedTransaction.body(), wasmWitnessSet, wasmUnsignedTransaction.auxiliary_data())
                setSignTransactionText(bytesToHex(wasmSignedTransaction.to_bytes()))
            })
            .catch((e) => {
                setSignTransactionText(e.info)
                console.log(e)
            })
    }
    const apiProps = {
        apiName: "signTx",
        apiDescription: "Returns a signed Transaction CBOR. Signing uses your Yoroi wallet and will initiate a popup",
        text: signTransactionText,
        clickFunction: signTransactionClick,
        inputs: "unsignedTx: string, partialSign: bool"
    }

    return (
        <ApiCard {...apiProps}>
            <InputModal buttonLabel="Build Transaction">
                <div className="px-4 pb-3">
                    <label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-300">Amount</label>
                    <input type="number" min="0" id="amount" className="appearance-none border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder=""
                        value={buildTransactionInput.amount} onChange={(event) => setBuildTransactionInput({ ...buildTransactionInput, amount: event.target.value })} />
                </div>
                <div className="px-4 pb-3">
                    <label htmlFor="address" className="block mb-2 text-sm font-medium text-gray-300">Address</label>
                    <input type="text" id="address" className="appearance-none border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder=""
                        value={buildTransactionInput.address} onChange={(event) => setBuildTransactionInput({ ...buildTransactionInput, address: event.target.value })} />
                    <p>(will send to your change address if unspecified)</p>
                </div>
                <div className="grid justify-items-center pb-2">
                    <button className="block text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-gray-600 hover:bg-gray-700 focus:ring-gray-800" type="button"
                        onClick={buildTransaction}>
                        Build Tx
                    </button>
                </div>
                <div className="px-4 pb-3">
                    <label htmlFor="txHex" className="block mb-2 text-sm font-medium text-gray-300">Tx Hex</label>
                    <input type="text" id="txHex" className="appearance-none border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder=""
                        value={signTransactionInput} onChange={(event) => setSignTransactionInput(event.target.value)} />
                </div>
            </InputModal>
        </ApiCard>
    );
}

const SubmitTransactionCard = ({ api }) => {
    const [submitTransactionText, setSubmitTransactionText] = useState("")
    const [submitTransactionInput, setSubmitTransactionInput] = useState("")

    const submitTransactionClick = () => {
        api?.submitTx(submitTransactionInput)
            .then((txId) => {
                setSubmitTransactionText(txId)
            })
            .catch((e) => {
                setSubmitTransactionText(e.info)
                console.log(e)
            })
    }

    const apiProps = {
        apiName: "submitTx",
        apiDescription: "Submits a transaction to the blockchain. You may copy and paste the result of signTx to input. Returns the Transaction Id",
        text: submitTransactionText,
        clickFunction: submitTransactionClick,
        inputs: "signedTx: string"
    }

    return (
        <ApiCard {...apiProps}>
            <div className="px-4 pb-3">
                <label htmlFor="txHex" className="block mb-2 text-sm font-medium text-gray-300">Tx Hex</label>
                <input type="text" id="txHex" className="appearance-none border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder=""
                    value={submitTransactionInput} onChange={(event) => setSubmitTransactionInput(event.target.value)} />
            </div>
        </ApiCard>
    );
}

export default Cip30Tab;