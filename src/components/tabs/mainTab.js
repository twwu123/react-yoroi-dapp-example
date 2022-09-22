import { useState } from "react";
import Cip30Tab from "./subtabs/cip30Tab";
import ContractTab from "./subtabs/contractTab";
import NFTTab from "./subtabs/NFTTab";
import {
    Routes,
    Route,
    Link
} from "react-router-dom";

const MainTab = () => {
    const [currentTab, setCurrentTab] = useState("CIP-30")

    const ACTIVE_COLOURS = "text-blue-600 active bg-gray-800 text-blue-500"
    const INACTIVE_COLOURS = "hover:bg-gray-800 hover:text-gray-300"

    return (
        <>
            <div className="bg-gray-900 grid justify-items-center pt-5">
                <ul className="flex flex-wrap text-sm font-medium text-center border-b border-gray-700 text-gray-400">
                    <li className="mr-2">
                        <Link to="CIP-30">
                            <button className={"inline-block p-4 rounded-t-lg " + (currentTab === "CIP-30" ? ACTIVE_COLOURS : INACTIVE_COLOURS)}
                                onClick={() => { setCurrentTab("CIP-30") }}>CIP-30</button>
                        </Link>
                    </li>
                    <li className="mr-2">
                        <Link to="Contracts">
                            <button className={"inline-block p-4 rounded-t-lg " + (currentTab === "Contracts" ? ACTIVE_COLOURS : INACTIVE_COLOURS)}
                                onClick={() => { setCurrentTab("Contracts") }}>Contracts</button>
                        </Link>
                    </li>
                    <li className="mr-2">
                        <Link to="NFTs">
                            <button className={"inline-block p-4 rounded-t-lg" + (currentTab === "NFTs" ? ACTIVE_COLOURS : INACTIVE_COLOURS)}
                                onClick={() => { setCurrentTab("NFTs") }}>NFTs</button>
                        </Link>
                    </li>
                </ul>
            </div>
            <Routes>
                <Route path="/CIP-30" element={<Cip30Tab />} />
                <Route path="/Contracts" element={<ContractTab />} />
                <Route path="/NFTs" element={<NFTTab />} />
            </Routes>
        </>
    );
}

export default MainTab;