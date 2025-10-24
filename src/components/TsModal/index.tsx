import { CloseOutlined } from '@ant-design/icons';
import { Button, Modal, ModalProps } from 'antd';
import { FullScreen, Close, OffScreenTwo } from "@icon-park/react";
import React, { useState, useEffect } from 'react';
import './index.css'
interface BaseModalProps extends Omit<ModalProps, 'open'> {
  open: boolean;           // 是否显示弹窗    必传
  bodyHeight: number | string;    // 弹窗内容高度   必传
  modalWidth: number | string;     // 弹窗宽度     必传
  fullSCreenShow?: boolean;       // 是否全屏显示
  foorterIsShow?: boolean;      // 是否显示底部
  padding?: string;     // 内容padding
  children?: React.ReactNode;    // 内容
  onCancel?: () => void;     // 取消回调
  onOk?: () => void;        // 确定回调
  headerComponent?: React.ReactNode | null;
  bodyComponent?: React.ReactNode | null;
  footerComponent?: React.ReactNode | null;
  headerHeight?: string   // 头部高度
  headerBgColor?: string   //头部背景颜色
  herderSize?: string      // 头部字体大小
  bodyBgColor?: string      // 内容背景颜色
}
const TsModal: React.FC<BaseModalProps> = ({
  foorterIsShow,
  onCancel,
  children,
  fullSCreenShow = false,
  headerHeight = '45px',
  headerBgColor = '#ffffff',
  herderSize = '14px',
  padding = '15px 0px 0px 0px',
  bodyBgColor = 'rgba(248,251,255,1)',
  modalWidth = 700,
  open,
  onOk = () => { },
  ...rest
}) => {
  const [isFullSCreen, setIsFullSCreen] = useState(true);
  const [newModalWidth, setNewModalWidth] = useState<string | number>('');
  const [newBodyHeight, setNewBodyHeight] = useState<string | number>(300);
  useEffect(() => {
    setNewModalWidth(modalWidth)
  }, [modalWidth])
  useEffect(() => {
    if (rest?.bodyHeight) {
      setNewBodyHeight(rest.bodyHeight)
    }
  }, [rest.bodyHeight])

  // 在组件中添加 useEffect 监听键盘事件
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // 当 ESC 键被按下时，退出全屏
        if (!isFullSCreen) {
          if (rest.bodyHeight) {
            setNewBodyHeight(rest.bodyHeight)
          }
          setNewModalWidth(modalWidth)
          setIsFullSCreen(true);
        }
      }
    };
    // 添加键盘事件监听
    document.addEventListener('keydown', handleKeyDown);
    // 组件卸载时移除监听
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullSCreen]);
  //头部内容
  const headerContent = rest.headerComponent || (
    <>
      <div className='flex items-center justify-between px-[20px] rounded-[10px]' style={{ height: headerHeight, backgroundColor: headerBgColor }}>
        <div style={{ fontSize: herderSize }} className='text-[500]'>{rest.title}</div>
        <div className='flex items-center' >
          {
            fullSCreenShow && (isFullSCreen ? (<FullScreen theme="outline" size="16" fill="#8D97A3" className='mr-[20px] cursor-pointer flex items-center'
              onClick={() => {
                setNewBodyHeight(`calc(100vh - ${headerHeight} - 65px`);
                setNewModalWidth('100vw')
                setIsFullSCreen(!isFullSCreen)
              }} />) : (<OffScreenTwo theme="outline" size="16" fill="#8D97A3" className='mr-[20px] flex items-center cursor-pointer' onClick={() => {
                if (rest.bodyHeight) {
                  setNewBodyHeight(rest.bodyHeight)
                }
                setNewModalWidth(modalWidth)
                setIsFullSCreen(!isFullSCreen)
              }} />))
          }
          <Close onClick={onCancel} theme="outline" size="16" fill="#8D97A3" className='cursor-pointer flex items-center' />
        </div>
      </div>
      <div style={{ borderBottom: '1px solid rgba(223,226,231,1)' }}></div>
    </>
  );
  //中间内容
  const bodyContent = rest.bodyComponent || children;
  //底部内容  按钮高度64px
  const footerContent = rest.footerComponent || (
    <div>
      <Button
        className=" h-[34px]"
        htmlType="submit"
        style={{ background: '#002FA7', color: '#ffffff' }}
        onClick={onOk}
        loading={rest.confirmLoading}
      >
        确定
      </Button>
      <Button
        className="ml-[10px] h-[34px]"
        style={{ color: '#092C4D' }}
        onClick={onCancel}
      >
        取消
      </Button>
    </div>
  );

  return (
    <Modal
      open={open}
      afterClose={() => {
        if (rest.bodyHeight) {
          setNewBodyHeight(rest.bodyHeight)
        }
        setNewModalWidth(modalWidth)
        setIsFullSCreen(true);
      }}
      maskClosable={false}  //阻止点击蒙尘关闭对话框
      keyboard={false}     //阻止按下esc关闭对话框
      onCancel={onCancel}
      footer={null}
      centered={true}
      closable={false}
      width={newModalWidth}
      destroyOnHidden={true}   //关闭的时候消除内容元素
      {...rest}
      title={null}
      styles={{
        content: {
          padding: 0,
        },
      }}
      style={{
        maxWidth: '100%'
      }}>
      <header>
        {headerContent}
      </header>
      <div>
        <div style={{ height: newBodyHeight, background: bodyBgColor, borderRadius: '0px 0px 10px 10px', overflow: 'auto', }}>
          <main style={{ padding }} >
            {bodyContent}
          </main>
        </div>
        <footer className='tsFooter' style={{ background: bodyBgColor }}>{foorterIsShow ? footerContent : rest.footerComponent}</footer>
      </div>
    </Modal>
  );
};
export default TsModal;
