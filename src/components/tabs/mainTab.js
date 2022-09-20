import { useState } from "react";
import Cip30Tab from "./subtabs/cip30Tab";
import ContractTab from "./subtabs/contractTab";

const MainTab = () => {
    const [currentTab, setCurrentTab] = useState("CIP-30")

    const ACTIVE_COLOURS = "text-blue-600 active bg-gray-800 text-blue-500"
    const INACTIVE_COLOURS = "hover:bg-gray-800 hover:text-gray-300"

    return (
        <>
            <div className="bg-gray-900 grid justify-items-center pt-5">
                <ul className="flex flex-wrap text-sm font-medium text-center border-b border-gray-700 text-gray-400">
                    <li className="mr-2">
                        <button className={"inline-block p-4 rounded-t-lg " + (currentTab === "CIP-30" ? ACTIVE_COLOURS : INACTIVE_COLOURS)}
                            onClick={() => { setCurrentTab("CIP-30") }}>CIP-30</button>
                    </li>
                    <li className="mr-2">
                        <button className={"inline-block p-4 rounded-t-lg " + (currentTab === "Contracts" ? ACTIVE_COLOURS : INACTIVE_COLOURS)}
                            onClick={() => { setCurrentTab("Contracts") }}>Contracts</button>
                    </li>
                    <li className="mr-2">
                        <button className="inline-block p-4 rounded-t-lg cursor-not-allowed text-gray-500">NFTs</button>
                    </li>
                </ul>
            </div>
            {currentTab === "CIP-30" && <Cip30Tab />}
            {currentTab === "Contracts" && <ContractTab />}
        </>
    );
}

export default MainTab;