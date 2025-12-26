import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Radio,
  DatePicker,
  Select,
  Checkbox,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  message,
  Divider,
  Avatar,
} from 'antd';
import { BellOutlined, SendOutlined, SaveOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

// 定义地区常量数据
const REGIONS = [
  { value: 'MENA', label: 'MENA (中东北非区)' },
  { value: 'Europe', label: 'Europe (欧洲区)' },
  { value: 'SSA', label: 'SSA (南部非洲区)' },
  { value: 'APAC', label: 'APAC (亚太区)' },
  { value: 'AMER', label: 'AMER (美洲区)' },
  { value: 'Eurasia_SZ', label: 'Eurasia SZ. (亚欧专区)' },
];

// 定义表单数据的接口
interface PushFormData {
  type: 'now' | 'scheduled';
  scheduledTime?: dayjs.Dayjs | null;
  target: string; // 存储地区的 value 值
  title: string;
  content: string;
  url?: string;
  platforms: string[];
}

// 定义历史记录数据的接口
interface HistoryDataType {
  key: string;
  date: string;
  title: string;
  target: string; // 存储地区的 label 值用于展示
  status: 'success' | 'pending' | 'failed';
}

const PushDemo: React.FC = () => {
  const [form] = Form.useForm<PushFormData>();
  const [sending, setSending] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  // 用于控制动态表单项的显示状态
  const [pushType, setPushType] = useState<'now' | 'scheduled'>('now');

  // 模拟历史数据
  const [historyData, setHistoryData] = useState<HistoryDataType[]>([
    { key: '1', date: '2023-10-27 10:00:00', title: 'Q4 销售冲刺启动', target: 'APAC (亚太区)', status: 'success' },
    { key: '2', date: '2023-10-26 15:30:00', title: '新的合规政策更新通知', target: 'Europe (欧洲区)', status: 'success' },
    { key: '3', date: '2023-10-25 09:00:00', title: '系统维护通知', target: 'MENA (中东北非区)', status: 'failed' },
  ]);

  // 监听表单值变化，用于动态显示字段 (这里主要监听推送类型)
  const handleValuesChange = (changedValues: any) => {
    if (changedValues.type) {
      setPushType(changedValues.type);
    }
  };

  // 辅助函数：根据 value 获取地区的完整 Label 文案
  const getTargetLabel = (value: string): string => {
    const region = REGIONS.find(r => r.value === value);
    return region ? region.label : value;
  };

  // 提交表单
  const onFinish = (values: PushFormData) => {
    setSending(true);
    // 模拟 API 调用延时
    setTimeout(() => {
      setSending(false);
      message.success('消息已提交发送队列！');

      // 添加一条新的模拟记录
      const newRecord: HistoryDataType = {
        key: Date.now().toString(),
        date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        title: values.title,
        // 将表单里的 value (如 'MENA') 转换为 label (如 'MENA (中东北非区)') 用于显示
        target: getTargetLabel(values.target),
        status: 'pending',
      };
      setHistoryData([newRecord, ...historyData]);
    }, 1500);
  };

  // 保存草稿
  const onSaveDraft = () => {
    message.info('草稿已保存（模拟）');
  };

  // 打开预览
  const handlePreview = async () => {
    try {
      // 预览前校验必填项
      await form.validateFields(['target', 'title', 'content']);
      setPreviewOpen(true);
    } catch (error) {
      message.error('请先填写完整的推送信息');
    }
  };

  // 历史记录表格列定义
  const columns: ColumnsType<HistoryDataType> = [
    { title: '发送时间', dataIndex: 'date', key: 'date', width: 180 },
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '目标区域', dataIndex: 'target', key: 'target', width: 180 }, // 调整宽度以适应较长的地区名
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        let color = 'default';
        let text = '未知';
        if (status === 'success') {
          color = 'success';
          text = '成功';
        } else if (status === 'pending') {
          color = 'processing';
          text = '发送中';
        } else {
          color = 'error';
          text = '失败';
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" size="small">复用</Button>
          <Button type="link" danger size="small">删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <Card
        title={<Space><BellOutlined />消息推送演示</Space>}
        extra={
          <Button icon={<EyeOutlined />} onClick={handlePreview}>
            预览效果
          </Button>
        }
        style={{ marginBottom: '24px' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onValuesChange={handleValuesChange}
          initialValues={{
            type: 'now',
            target: 'MENA', // 默认选中第一个
            platforms: ['Web', 'iOS', 'Android'],
          }}
        >
          <Form.Item name="type" label="推送类型">
            <Radio.Group>
              <Radio value="now">立即推送</Radio>
              <Radio value="scheduled">定时推送</Radio>
            </Radio.Group>
          </Form.Item>

          {pushType === 'scheduled' && (
            <Form.Item
              name="scheduledTime"
              label="发送时间"
              rules={[{ required: true, message: '请选择发送时间' }]}
            >
              <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
            </Form.Item>
          )}

          {/* ✅ 修改：标签改为“地区销售”，选项改为指定的地区 */}
          <Form.Item
            name="target"
            label="地区销售"
            rules={[{ required: true, message: '请选择目标地区销售' }]}
          >
            <Select placeholder="请选择目标地区">
              {REGIONS.map(region => (
                <Option key={region.value} value={region.value}>{region.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Divider />

          <Form.Item
            name="title"
            label="消息标题"
            rules={[{ required: true, message: '请输入消息标题' }]}
          >
            <Input placeholder="请输入消息标题 (最多50字)" maxLength={50} showCount />
          </Form.Item>

          {/* ✅ 修改：字数限制改为 1000 字 */}
          <Form.Item
            name="content"
            label="消息内容"
            rules={[{ required: true, message: '请输入消息内容' }]}
          >
            <TextArea
              rows={6} // 增加行数以便输入更多内容
              placeholder="请输入消息内容 (最多1000字)"
              maxLength={1000}
              showCount
            />
          </Form.Item>

          {/* ✅ 修改：标签改为“详情链接” */}
          <Form.Item name="url" label="详情链接">
            <Input addonBefore="http://" placeholder="请输入链接地址，例如: internal.crm/deal/123" />
          </Form.Item>

          <Form.Item name="platforms" label="目标平台">
            <Checkbox.Group options={['Web', 'iOS', 'Android']} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={sending}>
                确认发送
              </Button>
              <Button icon={<SaveOutlined />} onClick={onSaveDraft}>
                保存草稿
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title="最近推送记录 (演示数据)">
        <Table columns={columns} dataSource={historyData} pagination={{ pageSize: 5 }} />
      </Card>

      {/* 消息预览模态框 */}
      <Modal
        open={previewOpen}
        title="消息通知预览"
        onCancel={() => setPreviewOpen(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewOpen(false)}>
            关闭
          </Button>,
        ]}
        width={400}
      >
        <div
          style={{
            border: '1px solid #f0f0f0',
            borderRadius: '8px',
            padding: '16px',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar shape="square" size="small" icon={<BellOutlined />} style={{ backgroundColor: '#1890ff', marginRight: '8px' }} />
              <span style={{ fontSize: '12px', color: '#8c8c8c' }}>企业智脑 · 刚刚</span>
            </div>
            {/* 在预览中显示目标区域 */}
            <Tag style={{ marginRight: 0, fontSize: '10px' }}>
               {getTargetLabel(form.getFieldValue('target'))}
            </Tag>
          </div>
          <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '8px' }}>
            {form.getFieldValue('title') || '未设置标题'}
          </div>
          <div style={{ fontSize: '14px', color: '#595959', whiteSpace: 'pre-wrap', maxHeight: '300px', overflowY: 'auto' }}>
            {form.getFieldValue('content') || '未设置内容...'}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PushDemo;