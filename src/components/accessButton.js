import React from 'react';
import useYoroi from '../hooks/yoroiProvider';
import { textPartFromWalletChecksumImagePart } from '@emurgo/cip4-js';

const AccessButton = () => {
  const { api, connect } = useYoroi();
  const getWalletPlate = (apiObject) => {
    const auth = apiObject.experimental.auth && apiObject.experimental.auth();
    const walletId = auth.getWalletId();
    return textPartFromWalletChecksumImagePart(walletId);
  };

  return (
    <div className="mx-auto bg-gray-900">
      <div className="grid justify-items-center py-3">
        {api ?
          <div className="py-5 text-xl font-bold tracking-tight text-white">
            Connected To Yoroi
            <div className="py-1 text-xl font-bold tracking-tight text-white text-center">
              {getWalletPlate(api)}
            </div>
          </div> :
          <button className="rounded-md border-black-300 bg-blue-500 hover:bg-blue-500 py-5 px-5" onClick={() => connect(true, false)}>
            Request Access To Yoroi
          </button>
        }
      </div>
    </div>
  );
}

export default AccessButton;
