import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import md5 from 'js-md5';
import { zxcvbn } from '@zxcvbn-ts/core';
import { usePostUpdatePassword, getLast, updatePassword } from '@/api/updatePassword'
import useAuthStore from "@/stores/authStore";
import TsModal from '@/components/TsModal';

interface PasswordChangeDialogProps {
    visible: boolean;
    onClose: () => void;
}

const PasswordChangeDialog: React.FC<PasswordChangeDialogProps> = ({ visible, onClose }) => {
    const formItemLayout = {
        labelCol: {
            xs: { span: 24 },
            sm: { span: 7 },
        },
        wrapperCol: {
            xs: { span: 24 },
            sm: { span: 17 },
        },
    };

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    // const [configLogin, setConfigLogin] = useState({
    //     passwordLength: 6,
    //     passwordComplexity: 1,
    //     weekSave: 1,
    //     disabledRepeat: 1
    // });
    const regxMsg = useRef('密码长度为 6 到 20 个数字或字母组成');
    const logout = useAuthStore((state) => state.logout);

    // useEffect(() => {
    //     if (visible) {
    //         getLastConfig();
    //     }
    // }, [visible]);

    // const getLastConfig = async () => {
    //     try {
    //         const response = await getLast();
    //         if (response.data.data) {
    //             setConfigLogin(response.data.data);
    //         }
    //     } catch (error) {
    //         console.error('Failed to fetch config:', error);
    //     }
    // };

    const checkPasswordStrength = (password: string) => {
        if (!password) return -1;
        const result = zxcvbn(password);
        return result.score;
    };

    const checkPassword = (_: any, value: string) => {
        if (!value) {
            // 空值由 required 规则处理，此处直接通过
            return Promise.resolve();
        }
        if (!checkConfig(value)) {
            return Promise.reject(new Error(regxMsg.current));
        }
        return Promise.resolve();
    };

    const checkConfirmPassword = ({ getFieldValue }: any) => ({
        validator(_: any, value: string) {
            if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve();
            }
            return Promise.reject(new Error('新密码和确认密码不一致'));
        },
    });

    const checkConfig = (password: string) => {
        // 检查长度、中文和空格
        const chineseOrSpaceRegex = /[\u4e00-\u9fa5\s]/;
        const isValid = password.length >= 6 &&
            password.length <= 20 &&
            !chineseOrSpaceRegex.test(password);

        // 更新错误提示（如果需要）
        if (!isValid) {
            regxMsg.current = "请输入 6-20 位密码，不包含中文及空格。";
        }
        return isValid;
    };

    const handleSubmit = async () => {
        const values = await form.validateFields();
        if (values.oldPassword === values.newPassword) {
            message.error(`新密码不能与旧密码相同`);
            return
        }

        try {
            setLoading(true);

            const params = {
                oldPassword: md5(values.oldPassword),
                confirmPassword: md5(values.confirmPassword),
                password: md5(values.newPassword),
            };

            const response = await updatePassword(params);
            if (response.data.code === 200) {
                message.success('修改成功，请重新登录');
                onClose();
                form.resetFields();
                setTimeout(() => {
                    logout();
                }, 500);
            } else {
                message.error(response.data.msg);
            }
        } catch (error) {
            // console.error('Password change failed:', error);
            // message.error(`修改密码失败:${error}`);
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrength = () => {
        const password = form.getFieldValue('newPassword') || '';
        return checkPasswordStrength(password);
    };

    const renderPasswordStrengthBar = () => {
        const score = getPasswordStrength();
        let width = '0%';
        let color = 'transparent';

        switch (score) {
            case 0:
                width = '20%';
                color = '#ff4d4f';
                break;
            case 1:
                width = '40%';
                color = '#ff4d4f';
                break;
            case 2:
                width = '60%';
                color = '#faad14';
                break;
            case 3:
                width = '80%';
                color = '#52c41a';
                break;
            case 4:
                width = '100%';
                color = '#52c41a';
                break;
            default:
                break;
        }

        return (
            <div
                style={{
                    // 使用 Form.Item 的 wrapperCol 计算宽度
                    marginLeft: `${(formItemLayout.wrapperCol.sm.span / 24) * 100}%`,
                    width: `calc(${(formItemLayout.wrapperCol.sm.span / 24) * 100}% - 20px)`, // 减去 padding
                    paddingLeft: 0,
                    marginTop: 4,  // 调整与输入框的距离
                    marginBottom: 0,
                    height: 4,
                }}
            >
                <div style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#f0f0f0',
                    borderRadius: 2,
                    overflow: 'hidden',
                }}>
                    <div
                        style={{
                            width,
                            height: '100%',
                            backgroundColor: color,
                            transition: 'all 0.3s ease-in-out',
                        }}
                    />
                </div>
            </div>
        );
    };

    return (
        <TsModal
            fullSCreenShow={false}
            confirmLoading={loading}
            onOk={handleSubmit}
            title='修改密码'
            onCancel={onClose}
            open={visible}
            width='600px'
            height='auto'
        >
            <Form
                {...formItemLayout}
                form={form}
                layout="horizontal"
                labelAlign="left"
                style={{ width: '100%' }}
            >

                <Form.Item
                    label={<span style={{ color: '#092C4D' }}>旧密码</span>}
                    name="oldPassword"
                    rules={[{ required: true, message: '请输入旧密码' }]}
                >
                    <Input.Password
                        placeholder="请输入旧密码"
                        className='text-[#092C4D]'
                    />
                </Form.Item>

                <Form.Item
                    label={<span style={{ color: '#092C4D' }}>新密码</span>}
                    name="newPassword"
                    rules={[
                        { required: true, message: '请输入新密码' },
                        { validator: checkPassword }
                    ]}
                >
                    <Input
                        type={passwordVisible ? 'text' : 'password'}
                        placeholder="请输入新密码"
                        className='text-[#092C4D]'
                        suffix={
                            <span
                                className="cursor-pointer"
                                onClick={() => setPasswordVisible(!passwordVisible)}
                            >
                                {passwordVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                            </span>
                        }
                    />
                </Form.Item>

                {/* {renderPasswordStrengthBar()} */}

                <Form.Item
                    label={<span style={{ color: '#092C4D' }}>确认密码</span>}
                    name="confirmPassword"
                    rules={[
                        { required: true, message: '请确认新密码' },
                        checkConfirmPassword
                    ]}
                >
                    <Input.Password
                        placeholder="请确认新密码"
                        className='text-[#092C4D]'
                    />
                </Form.Item>
            </Form>
        </TsModal>
    );
};

export default PasswordChangeDialog;
