import React from "react";

interface tsImgComp {
  tsImg?: string;
  tsWid?: string;
  tsHig?: string;
}

// img图片
const TsImg = ({ tsImg, tsWid = "100%", tsHig = "100%" }: tsImgComp) => {
  return (
    <>
      <img
        src={tsImg}
        style={{ width: tsWid, height: tsHig }}
        loading="lazy"
        alt=""
        draggable="false"
      />
    </>
  );
};

export default React.memo(TsImg);
