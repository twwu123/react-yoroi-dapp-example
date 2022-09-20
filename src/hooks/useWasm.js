import { useEffect, useState } from 'react';

const useWasm = () => {
    const [CardanoWasm, setCardanoWasm] = useState(null)

    useEffect(() => {
        const getWasm = async () => {
            try {
                setCardanoWasm(await import("@emurgo/cardano-serialization-lib-browser"))
            } catch (e) {
                console.error(e)
            }
        }
        getWasm()
    }, [])
    return CardanoWasm
}

export const useWasmTxBuilder = () => {
    const wasm = useWasm()
    return wasm?.TransactionBuilder.new(
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
}

export default useWasm