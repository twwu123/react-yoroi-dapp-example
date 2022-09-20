import React from 'react';
import useYoroi from '../hooks/yoroiProvider';

const AccessButton = () => {
  const { api, connect } = useYoroi()

  return (
    <div className="mx-auto bg-gray-900">
      <div className="grid justify-items-center py-3">
        {api ?
          <div className="py-5 text-xl font-bold tracking-tight text-white">Connected To Yoroi</div> :
          <button className="rounded-md border-black-300 bg-blue-500 hover:bg-blue-500 py-5 px-5" onClick={() => connect(true, false)}>
            Request Access To Yoroi
          </button>
        }
      </div>
    </div>
  );
}

export default AccessButton;
