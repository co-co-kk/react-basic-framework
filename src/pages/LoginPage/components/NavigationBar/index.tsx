import React, { useEffect } from 'react';
import logo from '@assets/login/logo6.png';

const NavigationBar = () => {

  return (
    <div
      className="
        h-[70px] w-[100%] bg-[#fff]
        flex pl-[15px] pr-[15px] items-center
      "
    >
      <img
        src={logo}
        className="
          w-[160px] h-[37px] ml-[30px]
          hidden lg:block /* 小屏幕隐藏，大屏幕显示 */
        "
        alt=""
      />

      <div className="
        text-[16px] text-[#002fa7]
        ml-[30px] mr-[20px]
        cursor-pointer
        overflow-hidden whitespace-nowrap text-ellipsis font-medium
      ">
      </div>
    </div>
  );
};

export default NavigationBar;
