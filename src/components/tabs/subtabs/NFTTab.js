import { useState } from "react";
import useYoroi from "../../../hooks/yoroiProvider";
import useWasm from "../../../hooks/useWasm";
import { Buffer } from "buffer";
import { hexToBytes, bytesToHex } from "../../../utils/utils";

const NFTTab = () => {
    const { api } = useYoroi();
    const wasm = useWasm();
    const [currentNFTName, setCurrentNFTName] = useState({nftName: ''});
    const [currentImageUrl, setCurrentImageUrl] = useState({imageUrl: ''});
    const [currentDescription, setCurrentDescription] = useState({description: ''});

    const splitBy64Char = (inputString) => {
        if (inputString.length <= 64) {
            return inputString;
        }
        const step = 64;
        const resultArray = [];
        for (let startIndex = 0; startIndex < inputString.length; startIndex = startIndex + step) {
            const stringSlice = inputString.slice(startIndex, startIndex + step)
            resultArray.push(stringSlice);
        }
        return resultArray;
    }

    const [currentMintingInfo, setCurrentMintingInfo] = useState({
        NFTName: "", metadata: JSON.stringify({
            "name": "<string>",
            "image": "<uri | array>",
            "mediaType": "image/<mime_sub_type>",
            "description": "<string | array>",
            "files": [{
                "name": "<string>",
                "mediaType": "<mime_type>",
                "src": "<uri | array>",
                "<other_properties>": "<other_properties>"
            }],
        }, null, 4)
    });
    const [mintingTxInfo, setMintingTxInfo] = useState([]);

    const pushMintInfo = () => {
        let tempMintInfo = { NFTName: "", metadata: "" }
        tempMintInfo.NFTName = currentMintingInfo.NFTName
        tempMintInfo.metadata = JSON.parse(currentMintingInfo.metadata)
        setMintingTxInfo(mintingTxInfo => [...mintingTxInfo, tempMintInfo])
    }

    const mint = async () => {
        const txBuilder = wasm?.TransactionBuilder.new(
            wasm.TransactionBuilderConfigBuilder.new()
                .fee_algo(
                    wasm.LinearFee.new(
                        wasm.BigNum.from_str("44"),
                        wasm.BigNum.from_str("155381")
                    )
                )
                .coins_per_utxo_word(wasm.BigNum.from_str('34482'))
                .pool_deposit(wasm.BigNum.from_str('500000000'))
                .key_deposit(wasm.BigNum.from_str('2000000'))
                .ex_unit_prices(wasm.ExUnitPrices.new(
                    wasm.UnitInterval.new(wasm.BigNum.from_str("577"), wasm.BigNum.from_str("10000")),
                    wasm.UnitInterval.new(wasm.BigNum.from_str("721"), wasm.BigNum.from_str("10000000"))
                ))
                .max_value_size(5000)
                .max_tx_size(16384)
                .build()
        )

        const changeAddress = await api?.getChangeAddress()
        const wasmChangeAddress = wasm.Address.from_bytes(hexToBytes(changeAddress))
        const usedAddresses = await api?.getUsedAddresses()
        const usedAddress = wasm.Address.from_bytes(hexToBytes(usedAddresses[0]))
        const pubkeyHash = wasm.BaseAddress.from_address(usedAddress).payment_cred().to_keyhash()
        const wasmNativeScript = wasm.NativeScript.new_script_pubkey(wasm.ScriptPubkey.new(pubkeyHash))

        for (let i = 0; i < mintingTxInfo.length; i++) {
            let metadata = {}
            metadata[wasmNativeScript.hash().to_hex()] = {}
            metadata[wasmNativeScript.hash().to_hex()][bytesToHex(Buffer.from(mintingTxInfo[i].NFTName, "utf8"))] = mintingTxInfo[i].metadata
            console.log(metadata)
            txBuilder.add_json_metadatum(wasm.BigNum.from_str("721"), JSON.stringify(mintingTxInfo[i].metadata))
            txBuilder.add_mint_asset_and_output_min_required_coin(wasmNativeScript,
                wasm.AssetName.new(Buffer.from(mintingTxInfo[i].NFTName, "utf8")),
                wasm.Int.new_i32(1),
                wasm.TransactionOutputBuilder.new().with_address(wasmChangeAddress).next()
            )
        }

        

        const hexInputUtxos = await api?.getUtxos()

        const wasmUtxos = wasm.TransactionUnspentOutputs.new()
        for (let i = 0; i < hexInputUtxos.length; i++) {
            const wasmUtxo = wasm.TransactionUnspentOutput.from_bytes(hexToBytes(hexInputUtxos[i]))
            wasmUtxos.add(wasmUtxo)
        }

        txBuilder.add_inputs_from(wasmUtxos, wasm.CoinSelectionStrategyCIP2.LargestFirstMultiAsset)
        txBuilder.add_required_signer(pubkeyHash)
        txBuilder.add_change_if_needed(wasmChangeAddress)

        const unsignedTransactionHex = bytesToHex(txBuilder.build_tx().to_bytes())
        api?.signTx(unsignedTransactionHex)
            .then((witnessSetHex) => {
                const wasmWitnessSet = wasm.TransactionWitnessSet.from_bytes(
                    hexToBytes(witnessSetHex)
                )
                const wasmTx = wasm.Transaction.from_bytes(
                    hexToBytes(unsignedTransactionHex)
                )
                const wasmSignedTransaction = wasm.Transaction.new(
                    wasmTx.body(),
                    wasmWitnessSet,
                    wasmTx.auxiliary_data()
                )
                const transactionHex = bytesToHex(wasmSignedTransaction.to_bytes())
                console.log(transactionHex)
                api.submitTx(transactionHex)
                    .then(txId => {
                        console.log(`Transaction successfully submitted: ${txId}`)
                    })
                    .catch(err => {
                        console.log(err)
                    })
            })
    }

    return (
        <>
            <div className="grid justify-items-center py-5 px-5">
                <div className="block p-6 min-w-full rounded-lg border shadow-md bg-gray-800 border-gray-700">
                    <div className="text-white">
                        Note: Currently the functionality of this is extremely limited, it is really only here to mint really basic NFTs for testing.
                        The minting policy is hardcoded to basically just use the pubkeyhash of your first used address, so all the NFTs you mint here
                        will have the same policy id. They're not even really NFTs, cus you can mint multiple of them. This is a work in progress and
                        will have more functionalities in the future.
                    </div>
                </div>
            </div>
            <div className="grid justify-items-center py-5 px-5">
                <div className="block p-6 min-w-full rounded-lg border shadow-md bg-gray-800 border-gray-700">
                    <div className="flex">
                        <div className="flex-1">
                           {/* Inputs */}
                           <div className="mb-6 pr-4">
                              <label htmlFor="NFTName" className="block mb-2 text-sm font-medium text-gray-300">
                                NFT Name
                              </label>
                              <input
                                type="text"
                                id="NFTName"
                                className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                                value={currentNFTName.nftName} onChange={(event) => { setCurrentNFTName({ ...currentNFTName, nftName: event.target.value }) }}
                              />
                            </div>
                          <div className="mb-6 pr-4">
                            <label htmlFor="ImageURL" className="block mb-2 text-sm font-medium text-gray-300">
                              Image URL
                            </label>
                            <input
                              type="text"
                              id="ImageURL"
                              className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                              value={currentImageUrl.imageUrl} onChange={(event) => { setCurrentImageUrl({ ...currentImageUrl, imageUrl: event.target.value }) }}
                            />
                          </div>
                          <div className="mb-6 pr-4">
                            <label htmlFor="Description" className="block mb-2 text-sm font-medium text-gray-300">
                              Description
                            </label>
                            <input
                              type="text"
                              id="Description"
                              className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                              value={currentDescription.description} onChange={(event) => { setCurrentDescription({ ...currentDescription, description: event.target.value }) }}
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                           <div className="mb-6">
                                <label className="block mb-2 text-sm font-medium text-gray-300">Metadata JSON</label>
                                <textarea className="flex-row w-full rounded bg-gray-900 text-white px-2 readonly" rows="10" readOnly
                                      value={currentMintingInfo.metadata} onChange={(event) => { setCurrentMintingInfo({ ...currentMintingInfo, metadata: event.target.value }) }}>
                                </textarea>
                            </div>
                        </div>
                    </div>
                    {/* Buttons */}
                    <div className="flex">
                      <div className="flex-1">
                        <div>
                          <button
                            type="button"
                            className="text-white font-medium rounded-lg text-sm sm:w-auto px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
                          >
                            Generate
                          </button>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div>
                          <button
                            type="button"
                            className="text-white font-medium rounded-lg text-sm sm:w-auto px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
                            onClick={pushMintInfo}
                          >
                            Add Mint Instructions
                          </button>
                        </div>
                      </div>
                    </div>
                </div>
            </div>
            <div className="grid justify-items-center py-5 px-5">
                <div className="block p-6 min-w-full rounded-lg border shadow-md bg-gray-800 border-gray-700">
                    <div className="mb-6">
                        <label className="block mb-2 text-sm font-medium text-gray-300">Current Minting Batch</label>
                        <textarea className="flex-row w-full rounded bg-gray-900 text-white px-2 readonly" rows="10" readOnly
                            value={JSON.stringify(mintingTxInfo, null, 4)}></textarea>
                    </div>
                    <div>
                        <button type="button" className="text-white font-medium rounded-lg text-sm sm:w-auto px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
                            onClick={mint}>Mint</button>
                        <button type="button" className="text-white font-medium rounded-lg text-sm sm:w-auto mx-5 px-5 py-2.5 text-center bg-red-600 hover:bg-red-700 focus:ring-red-800"
                            onClick={() => setMintingTxInfo([])}>Clear Minting Batch</button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default NFTTab